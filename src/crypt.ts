import { Buffer } from 'node:buffer';
import { pbkdf2Sync } from 'node:crypto';

import Rijndael from 'rijndael-js';

const PASSWORD = 'TKX73OHHK1qMonoICbpVT0hIDGe7SkW0';
const SALT = '71Ba2p0ULBGaE6oJ7TjCqwsls1jBKmRL';

const generator = pbkdf2Sync(PASSWORD, SALT, 10, 64, 'sha1');
const key = generator.subarray(0, 32);
const iv = generator.subarray(32, 64);

/**
 * Encrypts data with Rijndael-256-CBC and the game's key, padding it with zeros
 * to the block size.
 *
 * @param {Buffer} input Data to encrypt.
 * @returns {Buffer} Encrypted data.
 */
export function encrypt(input: Buffer): Buffer {
	const cipher = new Rijndael(key, 'cbc');

	const blockSize = 32;
	const padLength = blockSize - (input.length % blockSize);

	const padded = Buffer.concat([input, Buffer.alloc(padLength)]);
	const encrypted = cipher.encrypt(padded, '256', iv);

	return Buffer.from(encrypted);
}

/**
 * Decrypts data encrypted with {@linkcode encrypt}. Trailing zero padding is
 * trimmed, leaving one zero byte.
 *
 * @param {Buffer} input Data to decrypt.
 * @returns {Buffer} Decrypted data.
 */
export function decrypt(input: Buffer): Buffer {
	const cipher = new Rijndael(key, 'cbc');
	const decrypted = Buffer.from(cipher.decrypt(input, '256', iv));

	// remove extra zero padding
	let end = decrypted.length;
	while (end > 0 && decrypted[end - 1] === 0) {
		--end;
	}
	const unpadded = decrypted.subarray(0, end + 1);

	return unpadded;
}
