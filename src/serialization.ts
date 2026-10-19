import type { Data, Value } from './types';

const doNotSerializeKeys = new Set([
	'.userData.ownedTransportationList.target[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
]);

async function iterSerialize(
	data: Value,
	rootKey: string,
): Promise<string | Value> {
	if (rootKey === '.pictureData') {
		if (typeof data === 'string') {
			return data;
		}
		if (Buffer.isBuffer(data)) {
			return data.toString('base64');
		}
		if (data instanceof Uint8Array) {
			return Buffer.from(data).toString('base64');
		}
		throw new Error('serialize: Invalid picture data');
	}

	if (Buffer.isBuffer(data)) {
		return data.toString('base64');
	}
	if (
		!(typeof data === 'object') ||
		doNotSerializeKeys.has(rootKey) ||
		data === null
	) {
		return data;
	}

	const output = structuredClone(data);
	if (Array.isArray(output)) {
		await Promise.all(
			output.map(
				async (v, i, a) =>
					(a[i] = await iterSerialize(v, `${rootKey}[]`)),
			),
		);
		return output;
	}
	// not array
	await Promise.all(
		Object.entries(output).map(
			async ([k, v]) =>
				(output[k] = await iterSerialize(v, `${rootKey}.${k}`)),
		),
	);
	return JSON.stringify(output);
}

export function serialize(data: Data): Promise<string> {
	return iterSerialize(data, '') as Promise<string>;
}

async function iterDeserialize(
	input: string | Value,
	rootKey: string,
): Promise<Value> {
	try {
		if (rootKey === '.pictureData' && typeof input === 'string') {
			return Buffer.from(input, 'base64');
		}

		if (Buffer.isBuffer(input)) {
			const data = JSON.parse(input.toString('utf8')) as Value;
			return await iterDeserialize(data, rootKey);
		}
		if (typeof input === 'string') {
			const data = JSON.parse(input) as Value;
			return await iterDeserialize(data, rootKey);
		}

		if (typeof input === 'object' && input !== null) {
			const data = structuredClone(input);
			if (Array.isArray(data)) {
				await Promise.all(
					data.map(
						async (v, i, a) =>
							(a[i] = await iterDeserialize(v, `${rootKey}[]`)),
					),
				);
			} else {
				await Promise.all(
					Object.entries(data).map(
						async ([k, v]) =>
							(data[k] = await iterDeserialize(
								v,
								`${rootKey}.${k}`,
							)),
					),
				);
			}
			return data;
		}

		return input;
	} catch (e) {
		// if the string is not JSON
		if (typeof input === 'string') {
			return input;
		}
		throw e;
	}
}

export function deserialize(input: string): Promise<Data> {
	return iterDeserialize(input, '') as Promise<Data>;
}
