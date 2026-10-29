import type { Buffer } from 'node:buffer';

/** Platform a save file comes from. */
export type Type = 'switch' | 'pc' | 'playstation';
/**
 * Keys of a dictionary that the game stores as parallel `keys` and `values`
 * arrays.
 */
export type Keys = number[];
/** Value in decoded save data: plain JSON or a `Buffer` for pictures. */
export type Value =
	| string
	| number
	| boolean
	| null
	| Buffer
	| Array<Value>
	| { [key: string]: Value };

/** Object in decoded save data. */
export type Record = { [key: string]: Value };

/** Parts of a save slot, see {@linkcode Master}. */
export namespace master {
	/** Picture of a save slot, decoded from base64. */
	export type Picture = Buffer;
	/** Ability of a character. */
	export type Ability = {
		abilityId: number;
		contentId: number;
		skillLevel: number;
	};
	/**
	 * Progress: party, characters, items, gil, statistics and Game Booster
	 * settings.
	 */
	export type User = Record & {
		corpsList: {
			target: {
				id: number;
				characterId: number;
			}[];
		};
		corpsSlots: {
			keys: Keys;
			values: {
				target: {
					id: number;
					characterId: number;
				}[];
			}[];
		};
		ownedCharacterList: {
			target: {
				id: number;
				characterStatusId: number;
				isEnableCorps: boolean;
				jobId: number;
				name: string;
				currentExp: number;
				parameter: {
					currentHP: number;
					currentMP: number;
					currentMpCountList: {
						keys: Keys;
						values: number[];
					};
					addtionalMaxMpCountList: {
						keys: Keys;
						values: number[];
					};
					addtionalLevel: number;
					addtionalMaxHp: number;
					addtionalMaxMp: number;
					addtionalPower: number;
					addtionalVitality: number;
					addtionalAgility: number;
					addionalWeight: number;
					addtionalIntelligence: number;
					addtionalSpirit: number;
					addtionalAttack: number;
					addtionalDefense: number;
					addtionalAbilityDefense: number;
					addtionalAbilityEvasionRate: number;
					addtionalMagic: number;
					addtionalLuck: number;
					addtionalAccuracyRate: number;
					addtionalEvasionRate: number;
					addtionalAbilityDisturbedRate: number;
					addtionalCriticalRate: number;
					addtionalDamageDirmeter: number;
					addtionalAbilityDefenseRate: number;
					addtionalAccuracyCount: number;
					addtionalEvasionCount: number;
					addtionalDefenseCount: number;
					addtionalMagicDefenseCount: number;
					currentConditionList: {
						target: number[];
					};
				};
				commandList: {
					target: number[];
				};
				abilityList: {
					target: (Ability & { abilityName?: string })[];
				};
				abilitySlotDataList: {
					target: {
						level: number;
						slotInfo: {
							keys: Keys;
							values: ('' | Ability)[];
						};
					}[];
				};
				jobList: {
					target: {
						id: number;
						level: number;
						currentProficiency: number;
					}[];
				};
				equipmentList: {
					keys: Keys;
					values: {
						contentId: number;
						count: number;
					}[];
				};
				additionOrderOwnedAbilityIds: {
					target: number[];
				};
				sortOrderOwnedAbilityIds: {
					target: number[];
				};
				abilityDictionary: {
					keys: Keys;
					values: {
						target: Ability[];
					}[];
				};
				skillLevelTargets: {
					keys: Keys;
					values: number[];
				};
				learningAbilitys: {
					target: number[];
				};
				equipmentAbilitys: {
					target: number[];
				};
				numberOfButtles: number;
				ownedMonsterId: number;
				magicStoneId: number;
				magicLearningValue: number;
				isDefaultName?: boolean;
				isJoiningDefaultName?: boolean;
				defaultNameIndex?: number;
			}[];
		};
		releasedJobs: {
			target: number[];
		};
		owendGil: number;
		playTime: number;
		normalOwnedItemList: {
			target: {
				contentId: number;
				count: number;
			}[];
		};
		importantOwendItemList: {
			target: {
				contentId: number;
				count: number;
			}[];
		};
		normalOwnedItemSortIdList: {
			target: unknown[];
		};
		currentArea: string;
		currentLocation: string;
		ownedTransportationList: {
			target: {
				position: {
					x: number;
					y: number;
					z: number;
				};
				direction: number;
				id: number;
				mapId: number;
				enable: boolean;
				timeStampTicks: number;
			}[];
		};
		owendCrystalFlags: {
			target: boolean[];
		};
		configData: string;
		warehouseItemList: {
			target: unknown[];
		};
		ownedKeyWaordList: {
			target: number[];
		};
		ownedMagicList: {
			target: number[];
		};
		learnedAbilityList: {
			target: number[];
		};
		escapeCount: number;
		battleCount: number;
		winCount?: number;
		corpsSlotIndex: number;
		openChestCount: number;
		ownedMagicStoneList: {
			target: unknown[];
		};
		steps: number;
		saveCompleteCount: number;
		monstersKilledCount: number;
		totalGil: number;
		wonderWandIndex?: number;
		cheatSettingsData: {
			isEnableEncount: boolean;
			expRate: number;
			gilRate: number;
			learningProficiencyRate: number;
			isHpIncreaseByFightCount: boolean;
			abpRate: number;
			magicProficiencyRate: number;
			parameterUpRate: number;
			magicLearningProficiencyRate: number;
		};
		isOpenedGameBoosterWindow: boolean;
		braveBladeReliefCount?: number;
		braveBladeEscapeCount?: number;
		isTakeOverBraveBladeEscapeCount?: boolean;
	};
	/** In-game settings saved with the slot: battles, messages and controls. */
	export type Config = Record & {
		buttonType: number;
		battleModeIndex: number;
		battleSpeedIndex: number;
		battleMessageSpeedIndex: number;
		isCursorMemory: boolean;
		isKeepAutoBattle: boolean;
		messageSpeed: number;
		isLeftActionIcon: boolean;
		isLeftVirtualPad: boolean;
		isLeftMenuCommand: boolean;
		isLeftBattleCommand: boolean;
		reequipIndex: number;
		analogModeIndex: number;
		isAutoDash: number;
	};
	/** Story, treasure, area and map flags. */
	export type Storage = Record & {
		scenario: number[];
		treasure: number[];
		global: number[];
		area: number[];
		map: number[];
		selected: number;
		itemSelected: number;
		transportation: unknown[];
	};
	/** Current map and position of the party. */
	export type Map = Record & {
		mapId: number;
		pointIn: number;
		transportationId: number;
		carryingHoverShip: boolean;
		playerEntity: {
			position: {
				x: number;
				y: number;
				z: number;
			};
			direction: number;
		};
		companionEntity: string;
		gpsData: {
			transportationId?: number;
			mapId: number;
			areaId: number;
			gpsId: number;
			width: number;
			height: number;
		};
		moveCount: number;
		subtractSteps: number;
		telepoCacheData: string;
		playableCharacterCorpsId: number;
		currentSelectedPartyId?: number;
		timerData: string;
		viewType?: number;
		encountEnable: boolean;
		otherPartyDataList?: {
			mapId: number;
			pointIn: number;
			playerEntity: string;
			playableCharacterCorpsId: number;
		}[];
		partyPlayableCharacterCorpsId?: number[];
		fieldDefenseNpcEntityIDList?: unknown[];
		beastFieldEncountExchangeFlags?: number[];
		beastFieldEncountSeekGroupId?: number;
		rtsData?: string;
	};
}

/** Save slot: progress, settings, flags and location of the party. */
export type Master = Record & {
	id: number;
	pictureData?: master.Picture;
	userData: master.User;
	configData: master.Config;
	dataStorage: master.Storage;
	mapData: master.Map;
	timeStamp: string;
	playTime: number;
	clearFlag: number;
	isCompleteFlag: number;
};

/** Bestiary: defeated monsters and kill counts. */
export type Bestiary = Record & {
	scenarioFlags: {
		target: number[];
	};
	monsterDefeats: {
		keys: Keys;
		values: number[];
	};
	totalSubjugationCount: number;
};

/** Parts of the game settings, see {@linkcode Config}. */
export namespace config {
	/** Gamepad bindings. */
	export type GamepadKeySettings = Record & {
		keys: Keys;
		values: {
			keys: Keys;
			values: number[];
		}[];
	};
	/** Keyboard bindings. */
	export type KeyboardKeySettings = Record & {
		keys: Keys;
		values: {
			target: {
				inputType: number;
				deviceType: number;
				keyName: string;
				axesName: string;
				keyCode: number;
				direction: number;
			}[];
		}[];
	};
	/** Mouse bindings. */
	export type MouseKeySettings = Record & {
		keys: Keys;
		values: {
			target: {
				inputType: number;
				deviceType: number;
				keyName: string;
				axesName: string;
				keyCode: number;
				direction: number;
			}[];
		}[];
	};
}

/** Game settings: language, controls, screen and sound. */
type Settings = Record & {
	language: number;
	fontType: number;
	gamePadKeySettings: config.GamepadKeySettings;
	keyboardKeySettings: config.KeyboardKeySettings;
	mouseKeySettings: config.MouseKeySettings;
	screenMode: number;
	resolutionWidth: number;
	resolutionHight: number;
	isLeftActionIcon: number;
	isLeftVirtualPad: number;
	isLeftMenuCommand: number;
	isLeftBattleCommand: number;
	isAnalogMode: boolean;
	brightness: number;
	masterVolume: number;
	bgmVolume: number;
	seVolume: number;
	bgmType: number;
};

// declared under another name, master.Config would shadow it
export type { Settings as Config };

/**
 * Decoded contents of a save file: a save slot, the bestiary or the game
 * settings. Key names are kept as the game writes them, typos included.
 */
export type Data = Master | Bestiary | Settings;
