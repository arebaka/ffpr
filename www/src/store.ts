import { pack, unpack } from 'ffpr';
import type { Bestiary, Config, Data, Master, Type } from 'ffpr';
import { createStore, produce, unwrap } from 'solid-js/store';

import {
	bestiarySchema,
	dataSchema,
	platformLabels,
	settingsSchema,
	slotSchema,
} from './schemas';

type Contents =
	| { kind: 'slot'; data: Master }
	| { kind: 'bestiary'; data: Bestiary }
	| { kind: 'settings'; data: Config }
	| { kind: 'other'; data: Data };

export type Kind = Contents['kind'];

export type Opened = Contents & {
	name: string;
	platform: Type;
	modified: boolean;
};

export const kindLabels: Record<Kind, string> = {
	slot: 'Save slot',
	bestiary: 'Bestiary',
	settings: 'Settings',
	other: 'Save data',
};

const [state, setState] = createStore<{ file: Opened | undefined }>({
	file: undefined,
});

export const opened = () => state.file;

export const slot = () =>
	state.file?.kind === 'slot' ? state.file.data : undefined;

export const bestiary = () =>
	state.file?.kind === 'bestiary' ? state.file.data : undefined;

function identify(data: Data): Contents {
	const slotData = slotSchema.safeParse(data);
	if (slotData.success) {
		return { kind: 'slot', data: slotData.data };
	}
	const bestiaryData = bestiarySchema.safeParse(data);
	if (bestiaryData.success) {
		return { kind: 'bestiary', data: bestiaryData.data };
	}
	const settingsData = settingsSchema.safeParse(data);
	if (settingsData.success) {
		return { kind: 'settings', data: settingsData.data };
	}
	return { kind: 'other', data };
}

const BASE64 = /^[\d+/=A-Za-z]+$/u;

export function detect(bytes: Uint8Array): Type {
	if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
		return 'pc';
	}
	const head = new TextDecoder().decode(bytes.subarray(0, 64));
	if (head.trimStart().startsWith('{')) {
		return 'playstation';
	}
	return BASE64.test(head) ? 'pc' : 'switch';
}

export const message = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

export async function open(file: File, platform?: Type): Promise<Kind> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const type = platform ?? detect(bytes);

	let data: Data;
	try {
		data = await unpack(bytes, type);
	} catch (error) {
		throw new Error(
			`${file.name} is not a ${platformLabels[type]} save: ${message(error)}`,
			{ cause: error },
		);
	}

	const contents = identify(data);
	setState({
		file: { ...contents, name: file.name, platform: type, modified: false },
	});
	return contents.kind;
}

export function close() {
	setState({ file: undefined });
}

export function editSlot(edit: (data: Master) => void) {
	setState(
		produce(draft => {
			if (draft.file?.kind === 'slot') {
				edit(draft.file.data);
				draft.file.modified = true;
			}
		}),
	);
}

export function editBestiary(edit: (data: Bestiary) => void) {
	setState(
		produce(draft => {
			if (draft.file?.kind === 'bestiary') {
				edit(draft.file.data);
				draft.file.modified = true;
			}
		}),
	);
}

// the picture is left out, replace keeps it
export function toJson(data: Data): string {
	const { pictureData, ...rest } = unwrap(data);
	return JSON.stringify(rest, null, 2);
}

export function replace(value: unknown) {
	const file = state.file;
	if (!file) {
		return;
	}
	const data = dataSchema.parse(value);
	const { pictureData } = unwrap(file.data);
	if (pictureData instanceof Uint8Array) {
		data.pictureData = pictureData;
	}
	setState({
		file: {
			...identify(data),
			name: file.name,
			platform: file.platform,
			modified: true,
		},
	});
}

// without a type Chrome adds .txt to names without an extension, like saves
export function saveAs(content: BlobPart, name: string, type: string) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = name;
	link.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
	});
}

export async function download(platform: Type) {
	const file = state.file;
	if (!file) {
		return;
	}
	const bytes = await pack(unwrap(file).data, platform);
	saveAs(new Uint8Array(bytes), file.name, 'application/octet-stream');
	setState('file', 'modified', false);
}
