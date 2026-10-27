/**
 * Decoding and encoding of Final Fantasy Pixel Remaster save files from
 * Nintendo Switch, PC and PlayStation.
 *
 * Supports save slots, the bestiary and game settings of all six games. Objects
 * that the game nests as JSON strings are unpacked into a plain object tree and
 * packed back. Key names are kept as the game writes them, typos included
 * (`owendGil`, `numberOfButtles` and others).
 *
 * ```ts
 * import { load, save } from '@arelive/ffpr';
 * import type { Master } from '@arelive/ffpr';
 *
 * const data = (await load('path/to/save', 'pc')) as Master;
 * data.userData.owendGil = 9999999;
 * await save('path/to/save', data, 'pc');
 * ```
 *
 * @module
 */
import { Buffer } from 'node:buffer';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { decrypt, encrypt } from './crypt.js';
import { deserialize, serialize } from './serialization.js';
import type { Data, Type } from './types.js';
import { compress, decompress } from './zip.js';

export type * from './types.js';

/**
 * Decodes the contents of a save file.
 *
 * @param {Buffer} source Contents of the save file.
 * @param {Type} type Platform the save file comes from.
 * @returns {Promise<Data>} Save data as a plain object tree.
 */
export async function unpack(
	source: Buffer,
	type: Type = 'switch',
): Promise<Data> {
	if (type === 'playstation') {
		const data = await deserialize(source.toString('utf8'));
		return data;
	}

	if (type === 'pc') {
		// remove UTF-8 BOM
		let trimmed = source;
		if (source[0] === 239 && source[1] === 187 && source[2] === 191) {
			trimmed = trimmed.subarray(3);
		}
		trimmed = Buffer.concat([
			trimmed,
			Buffer.alloc((4 - (trimmed.length % 4)) % 4, '='),
		]);
		source = Buffer.from(trimmed.toString('utf8'), 'base64');
	}

	// Switch
	const decrypted = decrypt(source);
	const decompressed = await decompress(decrypted);
	const data = await deserialize(decompressed.toString('utf8'));

	return data;
}

/**
 * Encodes save data into the contents of a save file.
 *
 * @param {Data} data Save data, as returned by {@linkcode unpack} or
 *   {@linkcode load}.
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

	const compressed = await compress(serialized);
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

/**
 * Reads and decodes a save file.
 *
 * @param {string} filename Path to the save file.
 * @param {Type} type Platform the save file comes from.
 * @returns {Promise<Data>} Save data as a plain object tree.
 */
export async function load(
	filename: string,
	type: Type = 'switch',
): Promise<Data> {
	const source = readFileSync(resolve(filename));
	const data = await unpack(source, type);

	return data;
}

/**
 * Encodes save data and writes it to a file.
 *
 * @param {string} filename Path to the save file. An existing file is
 *   overwritten.
 * @param {Data} data Save data, as returned by {@linkcode unpack} or
 *   {@linkcode load}.
 * @param {Type} type Platform to encode the save file for.
 * @throws {Error} If `pictureData` is not a `Buffer`, `Uint8Array` or base64
 *   string.
 */
export async function save(
	filename: string,
	data: Data,
	type: Type = 'switch',
): Promise<void> {
	const content = await pack(data, type);
	writeFileSync(resolve(filename), content);
}
