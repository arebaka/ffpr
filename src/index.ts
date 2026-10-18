import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Data, Type } from './types'
import { serialize, deserialize } from './serialization'
import { compress, decompress } from './zip'
import { encrypt, decrypt } from './crypt'

export type * from './types'

export async function unpack(source: Buffer, type: Type='switch'): Promise<Data> {
	if (type === 'playstation') {
		const data = await deserialize(source.toString('utf8'))
		return data
	}

	if (type === 'pc') {
		// remove UTF-8 BOM
		let trimmed = source
		if (source[0] === 239 && source[1] === 187 && source[2] === 191) {
			trimmed = trimmed.slice(3)
		}
		trimmed = Buffer.concat([trimmed, Buffer.alloc((4 - trimmed.length % 4) % 4, '=')])
		source = Buffer.from(trimmed.toString('utf8'), 'base64')
	}

	// Switch
	const decrypted = await decrypt(source)
	const decompressed = await decompress(decrypted)
	const data = await deserialize(decompressed.toString('utf8'))

	return data
}

export async function pack(data: Data, type: Type='switch'): Promise<Buffer> {
	const serialized = Buffer.from(await serialize(data), 'utf8')
	if (type === 'playstation') {
		return serialized
	}

	const compressed = await compress(serialized)
	const encrypted = await encrypt(compressed)
	if (type === 'switch') {
		return encrypted
	}

	// PC
	const based = encrypted.toString('base64')
	const buffer = Buffer.from(based, 'utf8')

	// add UTF-8 BOM
	const bom = Buffer.from([0xef, 0xbb, 0xbf])
	return Buffer.concat([bom, buffer])
}

export async function load(filename: string, type: Type='switch'): Promise<Data> {
	const source = readFileSync(resolve(filename))
	const data = await unpack(source, type)

	return data
}

export async function save(filename: string, data: Data, type: Type='switch'): Promise<void> {
	const content = await pack(data, type)
	writeFileSync(resolve(filename), content)
}
