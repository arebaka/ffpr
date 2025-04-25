const path = require('path')
const fs = require('fs')

const { serialize, deserialize } = require("./serialization")
const { compress, decompress } = require("./zip")
const { encrypt, decrypt } = require("./crypt")

async function unpack(source) {
	return new Promise(async (resolve, reject) => {
		try {
			const decrypted = await decrypt(source)
			const decompressed = await decompress(decrypted)
			const data = await deserialize(decompressed)

			return resolve(data)
		}
		catch (e) {
			return reject(e)
		}
	})
}

async function pack(data) {
	return new Promise(async (resolve, reject) => {
		try {
			const serialized = await serialize(data)
			const compressed = await compress(serialized)
			const encrypted = await encrypt(compressed)

			return resolve(encrypted)
		}
		catch (e) {
			return reject(e)
		}
	})
}

async function load(filename) {
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

async function save(filename, data) {
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

module.exports = {
	pack,
	unpack,
	load,
	save,
}