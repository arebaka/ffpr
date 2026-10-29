import { Buffer } from 'node:buffer';

import type { Data, Record, Value } from './types.js';

const doNotSerializeKeys = new Set([
	'.userData.ownedTransportationList.target[].position',
	'.userData.cheatSettingsData',
	'.mapData.playerEntity.position',
	'.mapData.otherPartyDataList[]',
	'.mapData.otherPartyDataList[].playerEntity.position',
]);

function mapItems<T>(
	items: readonly T[],
	rootKey: string,
	iterate: (value: T, key: string) => Promise<Value>,
): Promise<Value[]> {
	return Promise.all(items.map((item: T) => iterate(item, `${rootKey}[]`)));
}

async function mapEntries<T>(
	entries: readonly (readonly [string, T])[],
	rootKey: string,
	iterate: (value: T, key: string) => Promise<Value>,
): Promise<Record> {
	const mapped = await Promise.all(
		entries.map(
			async ([key, value]) =>
				[key, await iterate(value, `${rootKey}.${key}`)] as const,
		),
	);
	return Object.fromEntries(mapped);
}

async function iterSerialize(data: Value, rootKey: string): Promise<Value> {
	if (rootKey === '.pictureData') {
		if (typeof data === 'string') {
			return data;
		}
		if (data instanceof Uint8Array) {
			return Buffer.from(data).toString('base64');
		}
		throw new Error('serialize: Invalid picture data');
	}

	if (Buffer.isBuffer(data)) {
		return data.toString('base64');
	}
	if (typeof data !== 'object' || data === null) {
		return data;
	}

	if (Array.isArray(data)) {
		return mapItems(data, rootKey, iterSerialize);
	}
	const output = await mapEntries(
		Object.entries(data),
		rootKey,
		iterSerialize,
	);
	return doNotSerializeKeys.has(rootKey) ? output : JSON.stringify(output);
}

/**
 * Converts save data into the game's JSON. Nested objects are stored as JSON
 * strings, except the ones the game keeps as objects, and `Buffer` values as
 * base64.
 *
 * @param {Data} data Save data.
 * @returns {Promise<string>} JSON text of the save.
 */
export async function serialize(data: Data): Promise<string> {
	const output = await mapEntries(Object.entries(data), '', iterSerialize);
	return JSON.stringify(output);
}

function isNested(input: unknown): input is string {
	return typeof input === 'string' && input.trimStart().startsWith('{');
}

function isPrimitive(
	input: unknown,
): input is string | number | boolean | null {
	return (
		input === null ||
		typeof input === 'string' ||
		typeof input === 'number' ||
		typeof input === 'boolean'
	);
}

function tryParse(input: string): unknown {
	try {
		return JSON.parse(input);
	} catch {
		// if the string is not JSON
		return undefined;
	}
}

async function iterDeserialize(
	input: unknown,
	rootKey: string,
): Promise<Value> {
	if (rootKey === '.pictureData' && typeof input === 'string') {
		return Buffer.from(input, 'base64');
	}

	if (isNested(input)) {
		const data = tryParse(input);
		return data === undefined ? input : iterDeserialize(data, rootKey);
	}
	if (Array.isArray(input)) {
		return mapItems(input, rootKey, iterDeserialize);
	}
	if (typeof input === 'object' && input !== null) {
		const data = await mapEntries(
			Object.entries(input),
			rootKey,
			iterDeserialize,
		);
		return data;
	}
	if (isPrimitive(input)) {
		return input;
	}
	throw new Error(`deserialize: Invalid value at ${rootKey}`);
}

function isData(value: Value): value is Data {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		!Buffer.isBuffer(value)
	);
}

/**
 * Parses the game's JSON, including objects nested as JSON strings.
 * `pictureData` is decoded from base64 into a `Buffer`.
 *
 * @param {string} input JSON text of the save.
 * @returns {Promise<Data>} Save data.
 * @throws {Error} If the JSON is not an object.
 */
export async function deserialize(input: string): Promise<Data> {
	const data = await iterDeserialize(input, '');
	if (!isData(data)) {
		throw new Error('deserialize: Save data is not an object');
	}
	return data;
}
