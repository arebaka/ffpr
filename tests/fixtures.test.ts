// Round-trip of real saves from tests/fixtures/<type>/, subdirectories allowed.
// The JSON written by pack is compared with the JSON written by the game,
// nested JSON strings included, so any change of a value or of its
// representation (string to number, nested string to object) fails the test.
import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

import { decrypt } from '../src/crypt.js';
import { pack, unpack } from '../src/index.js';
import type { Type } from '../src/index.js';
import { decompress } from '../src/zip.js';

const TYPES: Type[] = ['switch', 'pc', 'playstation'];
const ROOT = join(import.meta.dirname, 'fixtures');

// JSON as stored in the file, nested strings are left as is
function readJson(file: Buffer, type: Type): unknown {
	if (type === 'playstation') {
		return JSON.parse(file.toString('utf8'));
	}

	let encrypted = file;
	if (type === 'pc') {
		const bom = file[0] === 0xef && file[1] === 0xbb && file[2] === 0xbf;
		const base64 = file.subarray(bom ? 3 : 0).toString('utf8');
		encrypted = Buffer.from(base64, 'base64');
	}
	const json = decompress(decrypt(encrypted));
	return JSON.parse(json.toString('utf8'));
}

function parseNested(value: string): object | undefined {
	if (!/^\s*[[{]/u.test(value)) {
		return undefined;
	}
	try {
		const parsed: unknown = JSON.parse(value);
		return typeof parsed === 'object' && parsed !== null
			? parsed
			: undefined;
	} catch {
		return undefined;
	}
}

function show(value: unknown): string {
	const json = value === undefined ? 'undefined' : JSON.stringify(value);
	return json.length > 60 ? `${json.slice(0, 60)}...` : json;
}

// paths where two saves differ
function diff(a: unknown, b: unknown, path = '', out: string[] = []): string[] {
	if (typeof a === 'string' && typeof b === 'string') {
		const nestedA = parseNested(a);
		const nestedB = parseNested(b);
		if (nestedA && nestedB) {
			return diff(nestedA, nestedB, path, out);
		}
	} else if (
		typeof a === 'object' &&
		typeof b === 'object' &&
		a !== null &&
		b !== null &&
		Array.isArray(a) === Array.isArray(b)
	) {
		const objA = a as Record<string, unknown>;
		const objB = b as Record<string, unknown>;
		const keys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
		for (const key of keys) {
			diff(objA[key], objB[key], `${path}.${key}`, out);
		}
		return out;
	}

	if (a !== b) {
		out.push(`${path}: ${show(a)} -> ${show(b)}`);
	}
	return out;
}

function listFiles(dir: string): string[] {
	if (!existsSync(dir)) {
		return [];
	}
	return readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter(name => !basename(name).startsWith('.'))
		.filter(name => statSync(join(dir, name)).isFile())
		.toSorted();
}

for (const type of TYPES) {
	const dir = join(ROOT, type);
	const files = listFiles(dir);

	describe(type, () => {
		if (files.length === 0) {
			test.skip(`no saves in tests/fixtures/${type}`, () => {});
		}

		for (const name of files) {
			test(name, async () => {
				const source = readFileSync(join(dir, name));
				const output = await pack(await unpack(source, type), type);
				expect(
					diff(readJson(source, type), readJson(output, type)),
				).toEqual([]);
			});
		}
	});
}
