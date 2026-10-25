import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { load, pack, save, unpack } from '../src/index.js';
import type { Master, Type } from '../src/index.js';

const TYPES: Type[] = ['switch', 'pc', 'playstation'];
const BOM = [0xef, 0xbb, 0xbf];

const picture = Buffer.from('89504e470d0a1a0a', 'hex');

// a save slot with every kind of value the serializer handles
const slot = {
	id: 1,
	pictureData: picture,
	userData: {
		owendGil: 500,
		playTime: 123.5,
		corpsList: {
			target: [
				{ id: 1, characterId: 1 },
				{ id: 2, characterId: 2 },
			],
		},
		ownedCharacterList: {
			target: [
				{
					id: 1,
					name: 'Warrior',
					parameter: {
						currentHP: 35,
						currentConditionList: { target: [] },
					},
				},
			],
		},
		ownedTransportationList: {
			target: [
				{
					position: { x: 1, y: 2, z: 3 },
					direction: 0,
					id: 1,
					mapId: 1,
					enable: true,
					timeStampTicks: 0,
				},
			],
		},
		cheatSettingsData: { isEnableEncount: true, expRate: 1 },
		currentArea: 'area',
	},
	configData: { buttonType: 0, isCursorMemory: true },
	dataStorage: { scenario: [1, 2, 3], selected: 0 },
	mapData: {
		mapId: 1,
		playerEntity: { position: { x: 0.5, y: 0, z: -1 }, direction: 2 },
		companionEntity: '',
		otherPartyDataList: [
			{
				mapId: 2,
				pointIn: 1,
				playerEntity: { position: { x: 4, y: 0, z: 8 }, direction: 1 },
				playableCharacterCorpsId: 1,
			},
			{
				mapId: 0,
				pointIn: 0,
				playerEntity: '',
				playableCharacterCorpsId: -1,
			},
		],
	},
	timeStamp: '10/18/2026 16:00:00',
	playTime: 123.5,
	clearFlag: 0,
	isCompleteFlag: 0,
} as unknown as Master;

// parses one level of nested JSON
const parse = (json: unknown) =>
	JSON.parse(json as string) as Record<string, unknown>;

describe('pack and unpack', () => {
	test.each(TYPES)('%s: round-trip keeps data', async type => {
		expect(await unpack(await pack(slot, type), type)).toStrictEqual(slot);
	});

	test('switch is the default type', async () => {
		const file = await pack(slot);
		expect(file).toEqual(await pack(slot, 'switch'));
		expect(await unpack(file)).toStrictEqual(slot);
	});

	test('strings that look like JSON stay strings', async () => {
		const data = {
			id: 1,
			userData: {
				ownedCharacterList: { target: [{ id: 1, name: '123' }] },
				currentArea: 'true',
				currentLocation: '[1]',
			},
		} as unknown as Master;
		expect(await unpack(await pack(data))).toStrictEqual(data);
	});

	test('rejects invalid pictureData', async () => {
		const data = { ...slot, pictureData: 1 } as unknown as Master;
		const error = await pack(data).catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(Error);
		expect(error).toHaveProperty(
			'message',
			'serialize: Invalid picture data',
		);
	});
});

describe('playstation format', () => {
	test('nested objects are JSON strings', async () => {
		const file = parse((await pack(slot, 'playstation')).toString('utf8'));
		expect(file.pictureData).toBe(picture.toString('base64'));

		const user = parse(file.userData);
		expect(typeof user.corpsList).toBe('string');
		expect(parse(user.corpsList).target).toEqual([
			'{"id":1,"characterId":1}',
			'{"id":2,"characterId":2}',
		]);
	});

	test('some objects are stored as is', async () => {
		const file = parse((await pack(slot, 'playstation')).toString('utf8'));
		const user = parse(file.userData);
		expect(user.cheatSettingsData).toEqual({
			isEnableEncount: true,
			expRate: 1,
		});

		const [transport] = parse(user.ownedTransportationList)
			.target as string[];
		expect(parse(transport).position).toEqual({ x: 1, y: 2, z: 3 });

		const map = parse(file.mapData);
		const player = parse(map.playerEntity);
		expect(player.position).toEqual({ x: 0.5, y: 0, z: -1 });

		const parties = map.otherPartyDataList as Record<string, unknown>[];
		const entity = parties[0]?.playerEntity;
		expect(typeof entity).toBe('string');
		expect(parse(entity).position).toEqual({ x: 4, y: 0, z: 8 });
		expect(parties[1]).toEqual(slot.mapData.otherPartyDataList?.[1]);
	});
});

describe('switch and pc formats', () => {
	test('switch: encrypted with 256-bit blocks', async () => {
		expect((await pack(slot, 'switch')).length % 32).toBe(0);
	});

	test('pc: switch format in base64 with UTF-8 BOM', async () => {
		const file = await pack(slot, 'pc');
		expect([...file.subarray(0, 3)]).toEqual(BOM);
		expect(file.subarray(3).toString('utf8')).toBe(
			(await pack(slot, 'switch')).toString('base64'),
		);
	});

	test('pc: BOM is optional when reading', async () => {
		const file = await pack(slot, 'pc');
		expect(await unpack(file.subarray(3), 'pc')).toStrictEqual(slot);
	});
});

describe('load and save', () => {
	const dir = mkdtempSync(join(tmpdir(), 'ffpr-test-'));
	afterAll(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	test.each(TYPES)('%s: edit a save file', async type => {
		const file = join(dir, type);
		await save(file, slot, type);
		const written: Buffer = readFileSync(file);
		expect(written).toEqual(await pack(slot, type));

		const data = (await load(file, type)) as Master;
		data.userData.owendGil = 9999999;
		await save(file, data, type);
		const edited = (await load(file, type)) as Master;
		expect(edited.userData.owendGil).toBe(9999999);
	});

	test('switch is the default type', async () => {
		const file = join(dir, 'default');
		await save(file, slot);
		const written: Buffer = readFileSync(file);
		expect(written).toEqual(await pack(slot, 'switch'));
		expect(await load(file)).toStrictEqual(slot);
	});
});
