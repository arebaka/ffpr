// the real module, node:crypto is replaced with the shim in the tests too
import { pbkdf2Sync } from 'crypto';

import { describe, expect, test } from 'vitest';

import { pbkdf2Sync as shim } from '@/shims/crypto';

describe('node:crypto shim', () => {
	test('pbkdf2Sync gives the same key as node:crypto', () => {
		const args = ['password', 'salt', 10, 64, 'sha1'] as const;
		expect([...shim(...args)]).toEqual([...pbkdf2Sync(...args)]);
	});

	test('pbkdf2Sync supports only SHA-1', () => {
		expect(() => shim('password', 'salt', 10, 64, 'sha256')).toThrow(
			'Unsupported digest',
		);
	});
});
