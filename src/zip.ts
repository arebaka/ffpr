import { Buffer } from 'node:buffer';

import { decompressSync, deflateSync } from 'fflate';

/**
 * Compresses data with raw deflate.
 *
 * @param {Buffer} input Data to compress.
 * @returns {Buffer} Compressed data.
 */
export function compress(input: Buffer): Buffer {
	return Buffer.from(deflateSync(input));
}

/**
 * Decompresses raw deflate or zlib data. Bytes after the end of the stream,
 * such as the cipher padding, are ignored.
 *
 * @param {Buffer} input Data compressed with {@linkcode compress} or zlib.
 * @returns {Buffer} Decompressed data.
 * @throws {Error} If the data is not compressed or is truncated.
 */
export function decompress(input: Buffer): Buffer {
	return Buffer.from(decompressSync(input));
}
