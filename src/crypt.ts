import crypto from 'crypto'
import Rijndael from 'rijndael-js'

const password = 'TKX73OHHK1qMonoICbpVT0hIDGe7SkW0'
const salt = '71Ba2p0ULBGaE6oJ7TjCqwsls1jBKmRL'

const generator = crypto.pbkdf2Sync(password, salt, 10, 64, 'sha1')
const key = generator.slice(0, 32)
const iv = generator.slice(32, 64)

export async function encrypt(input: Buffer): Promise<Buffer> {
	const cipher = new Rijndael(key, 'cbc')

	const blockSize = 32
	const padLength = blockSize - (input.length % blockSize)

	const padded = Buffer.concat([input, Buffer.alloc(padLength)])
	const encrypted = cipher.encrypt(padded, '256', iv)

	return Buffer.from(encrypted)
}

export async function decrypt(input: Buffer): Promise<Buffer> {
	const cipher = new Rijndael(key, 'cbc')
	const decrypted = Buffer.from(cipher.decrypt(input, '256', iv))

	// remove extra zero padding
	let end = decrypted.length
	while (end > 0 && decrypted[end - 1] == 0) {
		--end
	}
	const unpadded = decrypted.slice(0, end + 1)

	return unpadded
}
