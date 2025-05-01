import { save } from './types'

const doNotSerializeKeys = [
	'.userData.ownedTransportationList.target[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
]

async function iterSerialize(data: save.Value, rootKey: string): Promise<string|save.Value> {
	if (rootKey == '.pictureData') {
		if (typeof data == 'string') {
			return data
		}
		if (Buffer.isBuffer(data)) {
			return data.toString('base64')
		}
		if (data instanceof Uint8Array) {
			return Buffer.from(data).toString('base64')
		}
		throw new Error("serialize: Invalid picture data")
	}
	if (Buffer.isBuffer(data)) {
		return data.toString('base64')
	}

	if (!(typeof data == 'object') || doNotSerializeKeys.includes(rootKey) || data == null) {
		return data as save.Value
	}

	data = structuredClone(data)
	if (Array.isArray(data)) {
		await Promise.all(data.map(async (v, i, a) => {
			const newRootKey = rootKey + '[]'
			a[i] = await iterSerialize(v, newRootKey)
		}))
		return data
	}

	for (let key in data) {
		const newRootKey = rootKey + '.' + key
		data[key] = await iterSerialize(data[key], newRootKey)
	}
	return JSON.stringify(data)
}

export async function serialize(data: save.Data): Promise<string> {
	return iterSerialize(data, '') as Promise<string>
}

async function iterDeserialize(input: string|save.Value, rootKey: string): Promise<save.Value> {
	try {
		if (rootKey == '.pictureData' && typeof input == 'string') {
			const picture = Buffer.from(input, 'base64')
			return picture
		}

		if (Buffer.isBuffer(input)) {
			const data: save.Value = JSON.parse(input.toString('utf8'))
			return iterDeserialize(data, rootKey)
		}
		if (typeof input == 'string') {
			const data: save.Value = JSON.parse(input)
			return iterDeserialize(data, rootKey)
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
			return data
		}

		return input
	}
	catch (e) {
		// if the string is not JSON
		if (typeof input == 'string') {
			return input
		}
		throw e
	}
}

export async function deserialize(input: string): Promise<save.Data> {
	return iterDeserialize(input, '') as Promise<save.Data>
}
