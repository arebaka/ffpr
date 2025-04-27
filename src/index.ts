import path from 'path'
import fs from 'fs'

import { save } from './types'
import { serialize, deserialize } from './serialization'
import { compress, decompress } from './zip'
import { encrypt, decrypt } from './crypt'

export async function unpack(source: Buffer): Promise<save.Data> {
	return new Promise(async (resolve, reject) => {
		try {
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

export async function pack(data: save.Data): Promise<Buffer> {
	return new Promise(async (resolve, reject) => {
		try {
			const serialized = await serialize(data)
			const compressed = await compress(Buffer.from(serialized, 'utf8'))
			const encrypted = await encrypt(compressed)

			return resolve(encrypted)
		}
		catch (e) {
			return reject(e)
		}
	})
}

export async function load(filename: string): Promise<save.Data> {
	return new Promise(async (resolve, reject) => {
		try {
			const source = fs.readFileSync(path.resolve(filename))
			const data = await unpack(source)

			return resolve(data)
		}
		catch (e) {
			return reject(e)
		}
	})
}

export async function save(filename: string, data: save.Data): Promise<void> {
	return new Promise(async (resolve, reject) => {
		try {
			const content = await pack(data)
			fs.writeFileSync(path.resolve(filename), content)

			return resolve()
		}
		catch (e) {
			return reject(e)
		}
	})
}

