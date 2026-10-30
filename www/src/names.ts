import I from '@names/I.yaml';
import II from '@names/II.yaml';
import III from '@names/III.yaml';
import IV from '@names/IV.yaml';
import V from '@names/V.yaml';
import VI from '@names/VI.yaml';
import type { Bestiary, Master } from 'ffpr';

import { equipmentSchema, namesSchema } from './schemas';

type Table = Readonly<Record<string, string>>;

export type Names = {
	readonly items: Table;
	readonly keyItems: Table;
	// markers of empty equipment slots, the game keeps them among the items
	readonly empty: Table;
	readonly monsters: Table;
};

export const games = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

export type Game = (typeof games)[number];

export const tables: Record<Game, Names> = {
	I: namesSchema.parse(I),
	II: namesSchema.parse(II),
	III: namesSchema.parse(III),
	IV: namesSchema.parse(IV),
	V: namesSchema.parse(V),
	VI: namesSchema.parse(VI),
};

export const gameOptions = [
	['', 'Unknown game'],
	...games.map(game => [game, `Final Fantasy ${game}`] as const),
] as const;

const closest = (
	candidates: readonly Game[],
	distance: (names: Names) => number,
): Game[] => {
	const distances = candidates.map(game => distance(tables[game]));
	const best = Math.min(...distances);
	return candidates.filter((_, index) => distances[index] === best);
};

export function gamesOfSlot(data: Master): Game[] {
	const user = data.userData;
	const ids = [
		...user.normalOwnedItemList.target,
		...user.ownedCharacterList.target.flatMap(character =>
			equipmentSchema.parse(character),
		),
	].map(item => item.contentId);
	const keyIds = user.importantOwendItemList.target.map(
		item => item.contentId,
	);

	// a marker alone proves nothing, in other games its ID is a real item
	const marked = games.filter(game =>
		Object.keys(tables[game].empty).every(id => ids.includes(Number(id))),
	);
	return closest(
		marked.length > 0 ? marked : games,
		({ items, keyItems, empty }) =>
			ids.filter(id => !(id in items || id in keyItems || id in empty))
				.length + keyIds.filter(id => !(id in keyItems)).length,
	);
}

// a bestiary lists either all monsters of the game or the defeated ones
export function gamesOfBestiary(data: Bestiary): Game[] {
	const { keys } = data.monsterDefeats;
	const fitting = closest(
		games,
		({ monsters }) => keys.filter(id => !(id in monsters)).length,
	);
	const complete = fitting.filter(
		game => Object.keys(tables[game].monsters).length === keys.length,
	);
	return complete.length > 0 ? complete : fitting;
}

export const pickGame = (found: readonly Game[], last: Game | undefined) =>
	found.length === 1 ? found[0] : found.find(game => game === last);

export const itemName = (names: Names | undefined, id: number) =>
	names?.items[id] ?? names?.keyItems[id] ?? names?.empty[id] ?? 'Unknown';

// several items may share a name
export function findId(
	table: Table,
	text: string,
	taken: (id: number) => boolean,
): number | undefined {
	const query = text.trim().toLowerCase();
	if (/^\d+$/u.test(query)) {
		return Number(query);
	}
	const ids = Object.keys(table)
		.filter(id => table[id]?.toLowerCase() === query)
		.map(Number);
	return ids.find(id => !taken(id)) ?? ids[0];
}
