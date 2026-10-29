import { describe, expect, test } from 'vitest';

import {
	itemSchema,
	itemsSearchSchema,
	jsonSchema,
	overviewSchema,
} from '../src/schemas';

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
	test('an item stack holds 1 to 99', () => {
		expect(itemSchema.safeParse({ contentId: 1, count: 99 }).success).toBe(
			true,
		);
		expect(itemSchema.safeParse({ contentId: 1, count: 100 }).success).toBe(
			false,
		);
		expect(itemSchema.safeParse({ contentId: 0, count: 1 }).success).toBe(
			false,
		);
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
