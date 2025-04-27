import { save } from './types'

const doNotSerializeKeys = [
	'.userData.ownedTransportationList.target[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
]

async function iterSerialize(data: save.Value, rootKey: string): Promise<string|save.Value> {
	return new Promise(async (resolve, reject) => {
		try {
			if (rootKey == '.pictureData' && Buffer.isBuffer(data)) {
				return resolve(data.toString('base64'))
			}
			if (Buffer.isBuffer(data)) {
				return resolve(data.toString('base64'))
			}

			if (!(typeof data == 'object') || doNotSerializeKeys.includes(rootKey) || data == null) {
				return resolve(data as save.Value)
			}

			data = structuredClone(data)
			if (Array.isArray(data)) {
				await Promise.all(data.map(async (v, i, a) => {
					const newRootKey = rootKey + '[]'
					a[i] = await iterSerialize(v, newRootKey)
				}))
				return resolve(data)
			}

			for (let key in data) {
				const newRootKey = rootKey + '.' + key
				data[key] = await iterSerialize(data[key], newRootKey)
			}
			return resolve(JSON.stringify(data))
		}
		catch (e) {
			return reject(e)
		}
	})
}

export async function serialize(data: save.Data): Promise<string> {
	return iterSerialize(data, '') as Promise<string>
}

async function iterDeserialize(input: string|save.Value, rootKey: string): Promise<save.Value> {
	return new Promise(async (resolve, reject) => {
		try {
			if (rootKey == '.pictureData' && typeof input == 'string') {
				const picture = Buffer.from(input, 'base64')
				return resolve(picture)
			}

			if (Buffer.isBuffer(input)) {
				const data: save.Value = JSON.parse(input.toString('utf8'))
				return resolve(iterDeserialize(data, rootKey))
			}
			if (typeof input == 'string') {
				const data: save.Value = JSON.parse(input)
				return resolve(iterDeserialize(data, rootKey))
			}

			if (typeof input == 'object' && input != null) {
				const data = structuredClone(input)
				if (Array.isArray(data)) {
					await Promise.all(data.map(
						async (v, i, a) => a[i] = await iterDeserialize(v, rootKey + '[]')
					))
				}
				else {
					for (let key in data) {
						data[key] = await iterDeserialize(data[key], rootKey + '.' + key)
					}
				}
				return resolve(data)
			}

			return resolve(input)
		}
		catch (e) {
			// if the string is not JSON
			if (typeof input == 'string') {
				return resolve(input)
			}
			return reject(e)
		}
	})
}

export async function deserialize(input: string): Promise<save.Data> {
	return iterDeserialize(input, '') as Promise<save.Data>
}
