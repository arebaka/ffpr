import zlib from 'zlib'

import { promisify } from 'util'

const deflateRaw = promisify(zlib.deflateRaw)
const inflateRaw = promisify(zlib.inflateRaw)
const inflate = promisify(zlib.inflate)

export async function compress(input: Buffer): Promise<Buffer> {
	return deflateRaw(input)
}

export async function decompress(input: Buffer): Promise<Buffer> {
	try {
		return inflateRaw(input)
	} catch (error) {
		return inflate(input)
	}
}
