import { promisify } from 'node:util';
import { deflateRaw, inflate, inflateRaw } from 'node:zlib';

export function compress(input: Buffer): Promise<Buffer> {
	return promisify(deflateRaw)(input);
}

export function decompress(input: Buffer): Promise<Buffer> {
	try {
		return promisify(inflateRaw)(input);
	} catch {
		return promisify(inflate)(input);
	}
}
