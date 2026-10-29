import { describe, expect, test } from 'vitest';

import { formatDuration, formatNumber, parseDuration } from '../src/format';

describe('format', () => {
	test('play time is shown as H:MM:SS without fractions', () => {
		expect(formatDuration(10_830.75)).toBe('3:00:30');
		expect(formatDuration(0)).toBe('0:00:00');
		expect(formatDuration(360_000)).toBe('100:00:00');
	});

	test('H:MM:SS is parsed into seconds', () => {
		expect(parseDuration('3:00:30')).toBe(10_830);
		expect(parseDuration(formatDuration(45_296))).toBe(45_296);
	});

	test('numbers are grouped by thousands', () => {
		expect(formatNumber(1_234_567)).toBe('1,234,567');
	});
});
