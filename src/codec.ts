import { Buffer } from 'node:buffer';

import { decrypt, encrypt } from './crypt.js';
import { deserialize, serialize } from './serialization.js';
import type { Data, Type } from './types.js';
import { compress, decompress } from './zip.js';

/**
 * Decodes the contents of a save file.
 *
 * @param {Uint8Array} source Contents of the save file.
 * @param {Type} type Platform the save file comes from.
 * @returns {Promise<Data>} Save data as a plain object tree.
 * @throws {Error} If the contents are not a save file of this platform.
 */
export async function unpack(
	source: Uint8Array,
	type: Type = 'switch',
): Promise<Data> {
	let file = Buffer.from(source.buffer, source.byteOffset, source.byteLength);
	if (type === 'playstation') {
		const data = await deserialize(file.toString('utf8'));
		return data;
	}

	if (type === 'pc') {
		// remove UTF-8 BOM
		if (file[0] === 239 && file[1] === 187 && file[2] === 191) {
			file = file.subarray(3);
		}
		file = Buffer.concat([
			file,
			Buffer.alloc((4 - (file.length % 4)) % 4, '='),
		]);
		file = Buffer.from(file.toString('utf8'), 'base64');
	}

	// Switch
	const decrypted = decrypt(file);
	const decompressed = decompress(decrypted);
	const data = await deserialize(decompressed.toString('utf8'));

	return data;
}

/**
 * Encodes save data into the contents of a save file.
 *
 * @param {Data} data Save data, as returned by {@linkcode unpack}.
 * @param {Type} type Platform to encode the save file for.
 * @returns {Promise<Buffer>} Contents of the save file.
 * @throws {Error} If `pictureData` is not a `Buffer`, `Uint8Array` or base64
 *   string.
 */
export async function pack(data: Data, type: Type = 'switch'): Promise<Buffer> {
	const serialized = Buffer.from(await serialize(data), 'utf8');
	if (type === 'playstation') {
		return serialized;
	}

	const compressed = compress(serialized);
	const encrypted = encrypt(compressed);
	if (type === 'switch') {
		return encrypted;
	}

	// PC
	const based = encrypted.toString('base64');
	const buffer = Buffer.from(based, 'utf8');

	// add UTF-8 BOM
	const bom = Buffer.from([0xef, 0xbb, 0xbf]);
	return Buffer.concat([bom, buffer]);
}
