const crypto = require('crypto')
const Rijndael = require('rijndael-js')

const password = 'TKX73OHHK1qMonoICbpVT0hIDGe7SkW0'
const salt = '71Ba2p0ULBGaE6oJ7TjCqwsls1jBKmRL'

const generator = crypto.pbkdf2Sync(password, salt, 10, 64, 'sha1')
const key = generator.slice(0, 32)
const iv = generator.slice(32, 64)

async function encrypt(input) {
	return new Promise((resolve, reject) => {
		try {
			const cipher = new Rijndael(key, 'cbc')

			const blockSize = 32
			const padLength = blockSize - (input.length % blockSize)

			const padded = Buffer.concat([input, Buffer.alloc(padLength)])
			const encrypted = cipher.encrypt(padded, 256, iv)

			return resolve(Buffer.from(encrypted))
		}
		catch (e) {
			return reject(e)
		}
	})
}

async function decrypt(input) {
	return new Promise((resolve, reject) => {
		try {
			const cipher = new Rijndael(key, 'cbc')
			const decrypted = Buffer.from(cipher.decrypt(input, 256, iv))

			// remove extra zero padding
			let end = decrypted.length
			while (end > 0 && decrypted[end - 1] == 0) {
				--end
			}
			const unpadded = decrypted.slice(0, end + 1)

			return resolve(unpadded)

		}
		catch (e) {
			return reject(e)
		}
	})
}

module.exports = {
	encrypt,
	decrypt,
}