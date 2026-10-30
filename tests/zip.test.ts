import { describe, expect, test } from 'bun:test';
import { deflateSync } from 'node:zlib';

import { compress, decompress } from '@/zip.js';

const data = Buffer.from('{"owendGil":500}');

describe('zip', () => {
	test('round-trip with raw deflate', () => {
		expect(decompress(compress(data))).toEqual(data);
	});

	test('decompress reads the zlib format', () => {
		expect(decompress(deflateSync(data))).toEqual(data);
	});

	test('decompress ignores padding after the stream', () => {
		const padded = Buffer.concat([compress(data), Buffer.alloc(31)]);
		expect(decompress(padded)).toEqual(data);
	});

	test('decompress rejects data that is not compressed', () => {
		expect(() => decompress(data)).toThrow();
	});

	test('decompress rejects truncated data', () => {
		expect(() => decompress(compress(data).subarray(0, -2))).toThrow();
	});
});
