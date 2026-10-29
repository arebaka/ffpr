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
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { pack, unpack } from './codec.js';
import type { Data, Type } from './types.js';

export type * from './types.js';
export { pack, unpack };

/**
 * Reads and decodes a save file.
 *
 * @param {string} filename Path to the save file.
 * @param {Type} type Platform the save file comes from.
 * @returns {Promise<Data>} Save data as a plain object tree.
 * @throws {Error} If the file cannot be read or is not a save file of this
 *   platform.
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
