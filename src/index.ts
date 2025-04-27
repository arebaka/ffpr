import path from 'path'
import fs from 'fs'

import { save } from './types'
import { serialize, deserialize } from './serialization'
import { compress, decompress } from './zip'
import { encrypt, decrypt } from './crypt'

export async function unpack(source: Buffer, type: save.Type='Switch'): Promise<save.Data> {
	return new Promise(async (resolve, reject) => {
		try {
			if (type == 'PlayStation') {
				const data = await deserialize(source.toString('utf8'))
				return resolve(data)
			}

			if (type == 'PC') {
				// remove UTF-8 BOM
				let trimmed = source
				if (source[0] == 239 && source[1] == 187 && source[2] == 191) {
					trimmed = trimmed.slice(3)
				}
				trimmed = Buffer.concat([trimmed, Buffer.alloc((4 - source.length % 4) % 4, '=')])
				source = Buffer.from(trimmed.toString('utf8'), 'base64')
			}

			const decrypted = await decrypt(source)
			const decompressed = await decompress(decrypted)
			const data = await deserialize(decompressed.toString('utf8'))

			return resolve(data)
		}
		catch (e) {
			return reject(e)
		}
	})
}

export async function pack(data: save.Data, type: save.Type='Switch'): Promise<Buffer> {
	return new Promise(async (resolve, reject) => {
		try {
			const serialized = Buffer.from(await serialize(data), 'utf8')
			if (type == 'PlayStation') {
				return resolve(serialized);
			}

			const compressed = await compress(serialized)
			const encrypted = await encrypt(compressed)
			if (type == 'Switch') {
				return resolve(encrypted)
			}

			const based = encrypted.toString('base64')
			return resolve(Buffer.from(based))
		}
		catch (e) {
			return reject(e)
		}
	})
}

export async function load(filename: string, type: save.Type='Switch'): Promise<save.Data> {
	return new Promise(async (resolve, reject) => {
		try {
			const source = fs.readFileSync(path.resolve(filename))
			const data = await unpack(source, type)

			return resolve(data)
		}
		catch (e) {
			console.log(filename, type)
			return reject(e)
		}
	})
}

export async function save(filename: string, data: save.Data, type: save.Type='Switch'): Promise<void> {
	return new Promise(async (resolve, reject) => {
		try {
			const content = await pack(data, type)
			fs.writeFileSync(path.resolve(filename), content)

			return resolve()
		}
		catch (e) {
			return reject(e)
		}
	})
}

export default {
	pack,
	unpack,
	load,
	save,
}
