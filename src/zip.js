const zlib = require('zlib')

async function compress(input) {
	return new Promise((resolve, reject) => {
		zlib.deflateRaw(Buffer.from(input, 'utf8'), (error, result) => {
			if (error) {
				return reject(error)
			}
			return resolve(result)
		})
	})
}

async function decompress(input) {
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

module.exports = {
	compress,
	decompress,
}