import zlib from 'zlib'

export async function compress(input: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		zlib.deflateRaw(input, (error, result) => {
			if (error) {
				return reject(error)
			}
			return resolve(result)
		})
	})
}

export async function decompress(input: Buffer): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		zlib.inflateRaw(input, (error, result) => {
			if (error) {
				zlib.inflate(input, (error, result) => {
					if (error) {
						return reject(error)
					}
					return resolve(result)
				})
			}
			else {
				return resolve(result)
			}
		})
	})
}
