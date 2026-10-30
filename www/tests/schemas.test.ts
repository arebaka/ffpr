import { describe, expect, test } from 'vitest';

import {
	itemsSearchSchema,
	jsonSchema,
	namesSchema,
	newItemSchema,
	overviewSchema,
} from '@/schemas';

const overview = {
	owendGil: 12_345,
	playTime: '3:00:30',
	steps: 20_480,
	battleCount: 128,
	escapeCount: 3,
	monstersKilledCount: 402,
	openChestCount: 41,
	saveCompleteCount: 17,
};

describe('overview', () => {
	test('numbers are whole and not negative whole non-negative numbers', () => {
		expect(overviewSchema.safeParse(overview).success).toBe(true);
		expect(
			overviewSchema.safeParse({ ...overview, owendGil: -1 }).success,
		).toBe(false);
		expect(
			overviewSchema.safeParse({ ...overview, steps: 1.5 }).success,
		).toBe(false);
		expect(
			overviewSchema.safeParse({ ...overview, owendGil: Number.NaN })
				.success,
		).toBe(false);
	});

	test('play time must be H:MM:SS', () => {
		expect(
			overviewSchema.safeParse({ ...overview, playTime: '3:60:00' })
				.success,
		).toBe(false);
		expect(
			overviewSchema.safeParse({ ...overview, playTime: '3h' }).success,
		).toBe(false);
	});
});

describe('other forms', () => {
	test('a new item is known, free and its stack holds 1 to 99', () => {
		const resolve = (text: string) =>
			text === 'Potion' ? 2 : text === 'Unused' ? 0 : undefined;
		const schema = newItemSchema(resolve, id => id === 3);
		const accepted = (item: string, count: number) =>
			schema.safeParse({ item, count }).success;

		expect(accepted('Potion', 99)).toBe(true);
		expect(accepted('Potion', 100)).toBe(false);
		expect(accepted('Unused', 1)).toBe(false);
		expect(accepted('Excalipoor', 1)).toBe(false);
		expect(
			newItemSchema(
				() => 3,
				id => id === 3,
			).safeParse({
				item: 'Tent',
				count: 1,
			}).success,
		).toBe(false);
	});

	test('a table of names has all sections and only strings', () => {
		const section = { 2: 'Potion' };
		const table = {
			items: section,
			keyItems: section,
			empty: section,
			monsters: section,
		};
		expect(namesSchema.safeParse(table).success).toBe(true);
		expect(
			namesSchema.safeParse({ ...table, monsters: undefined }).success,
		).toBe(false);
		expect(
			namesSchema.safeParse({ ...table, items: { 2: 7 } }).success,
		).toBe(false);
	});

	test('JSON must be an object', () => {
		expect(jsonSchema.safeParse({ text: '{"a":1}' }).success).toBe(true);
		expect(jsonSchema.safeParse({ text: '[1]' }).success).toBe(false);
		expect(jsonSchema.safeParse({ text: '{ broken' }).success).toBe(false);
	});

	test('an unknown item list falls back to the normal one', () => {
		expect(itemsSearchSchema.parse({ list: 'important' }).list).toBe(
			'important',
		);
		expect(itemsSearchSchema.parse({ list: 'other' }).list).toBe('normal');
		expect(itemsSearchSchema.parse({}).list).toBe('normal');
	});
});
