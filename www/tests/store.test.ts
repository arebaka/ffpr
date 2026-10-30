import { pack, unpack } from 'ffpr';
import type { Data, Master, Type } from 'ffpr';
import {
	afterEach,
	assert,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest';

import {
	close,
	detect,
	download,
	editSlot,
	game,
	names,
	open,
	opened,
	replace,
	setGame,
	slot as openSlot,
	toJson,
} from '@/store';

import { bestiary, slot } from './saves';

const file = async (data: Data, platform: Type, name = 'save') =>
	new File([new Uint8Array(await pack(data, platform))], name);

const bytes = (text: string) => new TextEncoder().encode(text);

beforeEach(() => {
	close();
	setGame(undefined);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('detect', () => {
	test('the platform is guessed by the first bytes', () => {
		expect(detect(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))).toBe('pc');
		expect(detect(bytes('QUJDRA=='))).toBe('pc');
		expect(detect(bytes('  {"id":1}'))).toBe('playstation');
		expect(detect(new Uint8Array([0x00, 0xff, 0x10, 0x80]))).toBe('switch');
	});
});

describe('open', () => {
	test('a save slot', async () => {
		expect(await open(await file(slot, 'switch'))).toBe('slot');
		expect(openSlot()?.userData.owendGil).toBe(12_345);
		expect(opened()?.platform).toBe('switch');
		expect(opened()?.modified).toBe(false);
	});

	test('the bestiary, the settings and other data', async () => {
		expect(await open(await file(bestiary, 'pc'))).toBe('bestiary');
		const settings = {
			language: 1,
			gamePadKeySettings: { keys: [], values: [] },
		} as unknown as Data;
		expect(await open(await file(settings, 'playstation'))).toBe(
			'settings',
		);
		const other = { level: 1 } as unknown as Data;
		expect(await open(await file(other, 'playstation'))).toBe('other');
	});

	test('the game of a slot is recognized', async () => {
		await open(await file(slot, 'switch'));
		expect(game()).toBe('III');
		expect(names()?.keyItems[38]).toBe('Canoe');
	});

	test('the last game settles a bestiary that fits several', async () => {
		await open(await file(bestiary, 'pc'));
		expect(game()).toBeUndefined();

		setGame('IV');
		await open(await file(bestiary, 'pc'));
		expect(game()).toBe('IV');
	});

	test('the last game is forgotten if the bestiary does not fit', async () => {
		setGame('I');
		const keys = [1, 300];
		const data = {
			...bestiary,
			monsterDefeats: { keys, values: [1, 1] },
		} as unknown as Data;
		await open(await file(data, 'pc'));
		expect(game()).toBeUndefined();
	});

	test('the game outlives the file and other kinds of data', async () => {
		await open(await file(slot, 'switch'));
		close();
		const other = { level: 1 } as unknown as Data;
		await open(await file(other, 'playstation'));
		expect(game()).toBe('III');
	});

	test('a save of another platform is rejected', async () => {
		const save = await file(slot, 'switch', 'slot1');
		await expect(open(save, 'pc')).rejects.toThrow(
			'slot1 is not a PC save',
		);
	});
});

describe('edit', () => {
	test('a changed slot is downloaded for another platform', async () => {
		await open(await file(slot, 'switch', 'slot1'));
		editSlot(data => {
			data.userData.owendGil = 9999;
		});
		expect(opened()?.modified).toBe(true);

		const blobs: Blob[] = [];
		URL.createObjectURL = vi.fn<(blob: Blob) => string>(blob => {
			blobs.push(blob);
			return 'blob:save';
		});
		URL.revokeObjectURL = vi.fn<(url: string) => void>();
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, 'click')
			.mockImplementation(() => {});

		await download('pc');
		expect(click).toHaveBeenCalledOnce();
		expect(blobs).toHaveLength(1);
		expect(blobs[0]?.type).toBe('application/octet-stream');
		const content = new Uint8Array(await new Blob(blobs).arrayBuffer());
		const data = (await unpack(content, 'pc')) as Master;
		expect(data.userData.owendGil).toBe(9999);
		expect(opened()?.modified).toBe(false);
	});

	test('JSON leaves the picture out and replacing data keeps it', async () => {
		await open(await file(slot, 'switch'));
		const data = opened()?.data;
		assert(data !== undefined);
		expect(toJson(data)).not.toContain('pictureData');

		replace({ monsterDefeats: { keys: [], values: [] } });
		expect(opened()?.kind).toBe('bestiary');
		expect(opened()?.data.pictureData).toBeInstanceOf(Uint8Array);
		expect(opened()?.modified).toBe(true);
	});

	test('only objects replace the data', async () => {
		await open(await file(slot, 'switch'));
		expect(() => {
			replace([1, 2]);
		}).toThrow('Must be a JSON object');
	});
});
