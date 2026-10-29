import { Buffer } from 'node:buffer';

import { sha1 } from '@noble/hashes/legacy.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';

// pbkdf2Sync of node:crypto for the browser, the library derives its key with it
export function pbkdf2Sync(
	password: string,
	salt: string,
	iterations: number,
	keylen: number,
	digest: string,
): Buffer {
	if (digest !== 'sha1') {
		throw new Error(`Unsupported digest: ${digest}`);
	}
	const key = pbkdf2(sha1, password, salt, { c: iterations, dkLen: keylen });
	return Buffer.from(key);
}
