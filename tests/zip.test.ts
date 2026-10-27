import { describe, expect, test } from 'bun:test';
import { deflateSync } from 'node:zlib';

import { compress, decompress } from '../src/zip.js';

const data = Buffer.from('{"owendGil":500}');

describe('zip', () => {
	test('round-trip with raw deflate', async () => {
		expect(await decompress(await compress(data))).toEqual(data);
	});

	test('decompress falls back to the zlib format', async () => {
		expect(await decompress(deflateSync(data))).toEqual(data);
	});

	test('decompress rejects data that is not compressed', async () => {
		const error = await decompress(data).catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(Error);
	});
});
