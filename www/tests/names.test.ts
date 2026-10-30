import { unpack } from 'ffpr';
import type { Bestiary, Data, Master } from 'ffpr';
import { describe, expect, test } from 'vitest';

import {
	findId,
	type Game,
	games,
	gamesOfBestiary,
	gamesOfSlot,
	itemName,
	pickGame,
	tables,
} from '@/names';

// vite.config.ts replaces the modules of node:fs with a stub
const { existsSync, readdirSync, readFileSync } =
	process.getBuiltinModule('node:fs');

const root = `${import.meta.dirname}/../../tests/fixtures/pc`;

const listSaves = (game: Game) => {
	const dir = `${root}/${game}`;
	return existsSync(dir)
		? readdirSync(dir).map(name => `${dir}/${name}`)
		: [];
};

const load = (game: Game) =>
	Promise.all(
		listSaves(game).map(path =>
			unpack(new Uint8Array(readFileSync(path)), 'pc'),
		),
	);

const isSlot = (data: Data): data is Master => 'userData' in data;

const isBestiary = (data: Data): data is Bestiary => 'monsterDefeats' in data;

const slotWith = (items: number[], equipped: number[] = []) =>
	({
		userData: {
			normalOwnedItemList: {
				target: items.map(contentId => ({ contentId, count: 1 })),
			},
			importantOwendItemList: { target: [] },
			ownedCharacterList: {
				target: [
					{
						equipmentList: {
							values: equipped.map(contentId => ({ contentId })),
						},
					},
				],
			},
		},
	}) as unknown as Master;

const bestiaryWith = (keys: number[]) =>
	({ monsterDefeats: { keys, values: [] } }) as unknown as Bestiary;

const markers = (game: Game) => Object.keys(tables[game].empty).map(Number);

describe.each(games)('Final Fantasy %s', game => {
	const hasSaves = listSaves(game).length > 0;

	test.skipIf(!hasSaves)('its saves are recognized', async () => {
		const saves = await load(game);
		for (const data of saves.filter(isSlot)) {
			expect(gamesOfSlot(data)).toEqual([game]);
		}
		// the first two games have the same monster IDs
		const expected = game === 'I' || game === 'II' ? ['I', 'II'] : [game];
		for (const data of saves.filter(isBestiary)) {
			expect(gamesOfBestiary(data)).toEqual(expected);
		}
	});

	test.skipIf(!hasSaves)('everything in its saves has a name', async () => {
		const saves = await load(game);
		const names = tables[game];
		for (const { userData } of saves.filter(isSlot)) {
			for (const { contentId } of userData.normalOwnedItemList.target) {
				expect(itemName(names, contentId)).not.toBe('Unknown');
			}
			for (const item of userData.importantOwendItemList.target) {
				expect(names.keyItems[item.contentId]).toBeDefined();
			}
		}
		for (const { monsterDefeats } of saves.filter(isBestiary)) {
			for (const id of monsterDefeats.keys) {
				expect(names.monsters[id]).toBeDefined();
			}
		}
	});

	test('empty equipment slots tell the game', () => {
		expect(gamesOfSlot(slotWith([], markers(game)))).toEqual([game]);
	});

	test('markers among the items tell the game', () => {
		expect(gamesOfSlot(slotWith(markers(game)))).toEqual([game]);
	});

	test('the tables do not overlap and have no blank names', () => {
		const { items, keyItems, empty, monsters } = tables[game];
		for (const table of [items, keyItems, empty, monsters]) {
			expect(Object.values(table).every(name => name !== '')).toBe(true);
		}
		const ids = [items, keyItems, empty].flatMap(table =>
			Object.keys(table),
		);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('slots', () => {
	test('an item that is not in the tables does not hide the game', () => {
		expect(gamesOfSlot(slotWith([...markers('V'), 9999]))).toEqual(['V']);
	});

	test('items of the game win if they look like markers of another', () => {
		const items = [...markers('I'), ...markers('II')];
		expect(gamesOfSlot(slotWith(items))).toEqual(['II']);
	});

	test('a single marker does not settle the game', () => {
		const found = gamesOfSlot(slotWith([2], [135]));
		expect(found.length).toBeGreaterThan(1);
		expect(found).toContain('II');
		expect(found).toContain('III');
	});

	test('the game of a slot without markers is left open', () => {
		expect(gamesOfSlot(slotWith([2, 3])).length).toBeGreaterThan(1);
	});
});

describe('bestiaries', () => {
	test('defeated monsters fit several games', () => {
		expect(gamesOfBestiary(bestiaryWith([1, 2, 3]))).toEqual(games);
	});

	test('a monster that is missing from a game rules it out', () => {
		const found = gamesOfBestiary(bestiaryWith([1, 328]));
		expect(found).toContain('V');
		expect(found).not.toContain('I');
		expect(found).not.toContain('IV');
	});

	test('the game with most of the monsters is chosen', () => {
		expect(gamesOfBestiary(bestiaryWith([1, 391, 99_999]))).toEqual(
			gamesOfBestiary(bestiaryWith([1, 391])),
		);
	});
});

describe('the choice of a game', () => {
	test('the only candidate is taken', () => {
		expect(pickGame(['V'], 'IV')).toBe('V');
	});

	test('the last game settles an ambiguous save', () => {
		expect(pickGame(['I', 'II'], 'II')).toBe('II');
		expect(pickGame(['I', 'II'], 'IV')).toBeUndefined();
	});
});

describe('names', () => {
	test('items, key items and markers share the numbering', () => {
		const names = tables.I;
		expect(itemName(names, 2)).toBe('Potion');
		expect(itemName(names, 45)).toBe('Lute');
		expect(itemName(names, 62)).toBe('Empty');
		expect(itemName(names, 9999)).toBe('Unknown');
		expect(itemName(undefined, 2)).toBe('Unknown');
	});

	test('an item is found by its name or ID', () => {
		const { items } = tables.I;
		expect(findId(items, 'Potion', () => false)).toBe(2);
		expect(findId(items, ' hi-potion ', () => false)).toBe(3);
		expect(findId(items, '123', () => false)).toBe(123);
		expect(findId(items, 'Excalipoor', () => false)).toBeUndefined();
		expect(findId(items, '', () => false)).toBeUndefined();
	});

	test('of items with the same name a free one is chosen', () => {
		const { keyItems } = tables.V;
		expect(findId(keyItems, 'Pendant', () => false)).toBe(42);
		expect(findId(keyItems, 'Pendant', id => id === 42)).toBe(43);
		expect(findId(keyItems, 'Pendant', () => true)).toBe(42);
	});
});
