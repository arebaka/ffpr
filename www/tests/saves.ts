import type { Bestiary, Master } from 'ffpr';

// 1x1 PNG
const picture = Uint8Array.from(
	atob(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
	),
	char => char.codePointAt(0) ?? 0,
);

const character = (id: number, name: string) => ({
	id,
	name,
	currentExp: 12_800,
	parameter: { currentHP: 235, currentMP: 18, addtionalPower: 0 },
	equipmentList: {
		keys: [1, 2, 3, 4, 5],
		values: [50, 50, 136, 137, 138].map(contentId => ({
			contentId,
			count: 1,
		})),
	},
});

// the parts of a save slot of Final Fantasy III that the pages read
export const slot = {
	id: 1,
	pictureData: picture,
	timeStamp: '10/29/2026 12:00:00',
	playTime: 10_830.75,
	userData: {
		owendGil: 12_345,
		playTime: 10_830.75,
		steps: 20_480,
		battleCount: 128,
		escapeCount: 3,
		monstersKilledCount: 402,
		openChestCount: 41,
		saveCompleteCount: 17,
		ownedCharacterList: {
			target: [character(1, 'Luneth'), character(2, 'Arc')],
		},
		normalOwnedItemList: {
			target: [
				{ contentId: 2, count: 3 },
				{ contentId: 3, count: 99 },
			],
		},
		importantOwendItemList: { target: [{ contentId: 38, count: 1 }] },
		cheatSettingsData: {
			isEnableEncount: true,
			isHpIncreaseByFightCount: false,
			expRate: 1,
			gilRate: 1,
			abpRate: 1,
			learningProficiencyRate: 1,
			magicProficiencyRate: 1,
			magicLearningProficiencyRate: 1,
			parameterUpRate: 1,
		},
		corpsList: { target: [{ id: 1, characterId: 1 }] },
	},
} as unknown as Master;

export const bestiary = {
	scenarioFlags: { target: [] },
	monsterDefeats: { keys: [1, 2, 3], values: [5, 0, 7] },
	totalSubjugationCount: 12,
} as unknown as Bestiary;
