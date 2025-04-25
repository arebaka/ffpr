const doNotSerializeKeys = [
	'.userData.ownedTransportationList.target.[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
]

async function serialize(data, rootKey='') {
	return new Promise(async (resolve, reject) => {
		try {
			if (!(typeof data == 'object') || doNotSerializeKeys.includes(rootKey)) {
				return resolve(data)
			}

			data = structuredClone(data)
			for (let key in data) {
				const newRootKey = rootKey + '.' + (Array.isArray(data) ? '[]' : key)
				data[key] = await serialize(data[key], newRootKey)
			}

			if (Array.isArray(data)) {
				return resolve(data)
			}
			return resolve(JSON.stringify(data))
		}
		catch (e) {
			return reject(e)
		}
	})
}

async function deserialize(input) {
	return new Promise(async (resolve, reject) => {
		try {
			let data
			if (typeof input == 'string' || Buffer.isBuffer(input)) {
				data = JSON.parse(input)
			} else if (typeof input == 'object') {
				data = structuredClone(input)
			} else {
				data = input
			}

			if (typeof data == 'object') {
				for (let key in data) {
					data[key] = await deserialize(data[key])
				}
			}
			return resolve(data)
		}
		catch (e) {
			return resolve(input.toString('utf8'))
		}
	})
}

module.exports = {
	serialize,
	deserialize,
}