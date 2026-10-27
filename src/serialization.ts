import { Buffer } from 'node:buffer';

import type { Data, Record, Value } from './types.js';

const doNotSerializeKeys = new Set([
	'.userData.ownedTransportationList.target[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
	'.mapData.otherPartyDataList[]',
	'.mapData.otherPartyDataList[].playerEntity.position',
]);

async function mapChildren(
	data: Value[] | Record,
	rootKey: string,
	iterate: (value: Value, key: string) => Promise<Value>,
): Promise<Value[] | Record> {
	const output = structuredClone(data);
	if (Array.isArray(output)) {
		await Promise.all(
			output.map(async (v, i, a) => {
				a[i] = await iterate(v, `${rootKey}[]`);
			}),
		);
	} else {
		await Promise.all(
			Object.entries(output).map(async ([k, v]) => {
				output[k] = await iterate(v, `${rootKey}.${k}`);
			}),
		);
	}
	return output;
}

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
	if (!(typeof data === 'object') || data === null) {
		return data;
	}

	const output = await mapChildren(data, rootKey, iterSerialize);
	if (Array.isArray(output) || doNotSerializeKeys.has(rootKey)) {
		return output;
	}
	return JSON.stringify(output);
}

export function serialize(data: Data): Promise<string> {
	return iterSerialize(data, '') as Promise<string>;
}

function isNested(input: unknown): input is string {
	return typeof input === 'string' && input.trimStart().startsWith('{');
}

function tryParse(input: string): Value | undefined {
	try {
		return JSON.parse(input) as Value;
	} catch {
		// if the string is not JSON
		return undefined;
	}
}

async function iterDeserialize(
	input: string | Value,
	rootKey: string,
): Promise<Value> {
	if (rootKey === '.pictureData' && typeof input === 'string') {
		return Buffer.from(input, 'base64');
	}

	if (Buffer.isBuffer(input)) {
		const data = JSON.parse(input.toString('utf8')) as Value;
		return iterDeserialize(data, rootKey);
	}
	if (isNested(input)) {
		const data = tryParse(input);
		return data === undefined ? input : iterDeserialize(data, rootKey);
	}

	if (typeof input === 'object' && input !== null) {
		const data = await mapChildren(input, rootKey, iterDeserialize);
		return data;
	}
	return input;
}

export function deserialize(input: string): Promise<Data> {
	return iterDeserialize(input, '') as Promise<Data>;
}
