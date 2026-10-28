import { describe, expect, test } from 'bun:test';

import { decrypt, encrypt } from '../src/crypt.js';

const data = Buffer.from('{"owendGil":500}');

describe('crypt', () => {
	test('encrypted data is padded to 256-bit blocks', () => {
		expect(encrypt(data).length).toBe(32);
	});

	test('decrypt keeps one byte of the padding', () => {
		expect(decrypt(encrypt(data))).toEqual(
			Buffer.concat([data, Buffer.alloc(1)]),
		);
	});
});
