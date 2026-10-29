import type { Bestiary, Config, Data, Master, Type } from 'ffpr';
import { z } from 'zod';

export const platformLabels: Record<Type, string> = {
	switch: 'Nintendo Switch',
	pc: 'PC',
	playstation: 'PlayStation',
};

export const platformOptions = (['switch', 'pc', 'playstation'] as const).map(
	platform => [platform, platformLabels[platform]] as const,
);

const list = <T extends z.ZodType>(item: T) =>
	z.looseObject({ target: z.array(item) });

const items = list(z.looseObject({ contentId: z.number(), count: z.number() }));

// containers that the save slot pages read, scalar values are checked by forms
const slotShape = z.looseObject({
	userData: z.looseObject({
		ownedCharacterList: list(
			z.looseObject({
				id: z.number(),
				parameter: z.looseObject({}),
			}),
		),
		normalOwnedItemList: items,
		importantOwendItemList: items,
		cheatSettingsData: z.looseObject({}),
		corpsList: list(z.looseObject({ characterId: z.number() })),
	}),
});

const bestiaryShape = z.looseObject({
	monsterDefeats: z.looseObject({
		keys: z.array(z.number()),
		values: z.array(z.number()),
	}),
});

const settingsShape = z.looseObject({
	language: z.number(),
	gamePadKeySettings: z.looseObject({}),
});

export const dataSchema = z.custom<Data>(
	value =>
		typeof value === 'object' && value !== null && !Array.isArray(value),
	'Must be a JSON object',
);

export const slotSchema = z.custom<Master>(
	value => slotShape.safeParse(value).success,
);
export const bestiarySchema = z.custom<Bestiary>(
	value => bestiaryShape.safeParse(value).success,
);
export const settingsSchema = z.custom<Config>(
	value => settingsShape.safeParse(value).success,
);

const INT32 = 2_147_483_647;

const whole = 'Enter a whole number';

export const amount = z
	.int(whole)
	.min(0, 'Enter 0 or more')
	.max(INT32, 'Too large');
export const itemCount = z
	.int(whole)
	.min(1, 'Enter 1 to 99')
	.max(99, 'Enter 1 to 99');

export const duration = z
	.string()
	.regex(/^\d+:[0-5]\d:[0-5]\d$/u, 'Use the H:MM:SS format');

export const overviewSchema = z.object({
	owendGil: amount,
	playTime: duration,
	steps: amount,
	battleCount: amount,
	escapeCount: amount,
	monstersKilledCount: amount,
	openChestCount: amount,
	saveCompleteCount: amount,
});

export const characterSchema = z.object({
	name: z.string().min(1, 'Enter a name'),
	currentExp: amount,
	parameter: z.object({
		currentHP: amount,
		currentMP: amount,
		addtionalLevel: amount,
		addtionalMaxHp: amount,
		addtionalMaxMp: amount,
		addtionalPower: amount,
		addtionalVitality: amount,
		addtionalAgility: amount,
		addtionalIntelligence: amount,
		addtionalSpirit: amount,
		addtionalMagic: amount,
		addtionalLuck: amount,
	}),
});

const rate = z.number('Enter a number').min(0, 'Enter 0 or more');

export const boosterSchema = z.object({
	isEnableEncount: z.boolean(),
	isHpIncreaseByFightCount: z.boolean(),
	expRate: rate,
	gilRate: rate,
	abpRate: rate,
	learningProficiencyRate: rate,
	magicProficiencyRate: rate,
	magicLearningProficiencyRate: rate,
	parameterUpRate: rate,
});

export const itemSchema = z.object({
	contentId: z.int(whole).min(1, 'Enter 1 or more').max(INT32, 'Too large'),
	count: itemCount,
});

export const jsonSchema = z.object({
	text: z.string().refine(text => {
		try {
			return dataSchema.safeParse(JSON.parse(text)).success;
		} catch {
			return false;
		}
	}, 'Must be a JSON object'),
});

export const itemsSearchSchema = z.object({
	list: z.enum(['normal', 'important']).default('normal').catch('normal'),
});
