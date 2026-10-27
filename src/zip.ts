import type { Buffer } from 'node:buffer';
import { promisify } from 'node:util';
import { deflateRaw, inflate, inflateRaw } from 'node:zlib';

/**
 * Compresses data with raw deflate.
 *
 * @param {Buffer} input Data to compress.
 * @returns {Promise<Buffer>} Compressed data.
 */
export function compress(input: Buffer): Promise<Buffer> {
	return promisify(deflateRaw)(input);
}

/**
 * Decompresses raw deflate data, falling back to the zlib format.
 *
 * @param {Buffer} input Data compressed with {@linkcode compress} or zlib.
 * @returns {Promise<Buffer>} Decompressed data.
 */
export async function decompress(input: Buffer): Promise<Buffer> {
	try {
		return await promisify(inflateRaw)(input);
	} catch {
		return promisify(inflate)(input);
	}
}
