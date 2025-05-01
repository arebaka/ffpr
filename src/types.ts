export namespace save {
	export type Type = 'Switch'|'PC'|'PlayStation'
	export type Keys = number[]
	export type Value = string|number|boolean|Buffer|Array<Value>|{[key: string]: Value}

	export namespace master {
		export type Picture = Buffer
		export type User = {[key: string]: Value} & {
			corpsList: {
				target: {
					id: number
					characterId: number
				}[]
			}
			corpsSlots: {
				keys: Keys
				values: {
					target: {
						id: number
						characterId: number
					}[]
				}[]
			}
			ownedCharacterList: {
				target: {
					id: number
					characterStatusId: number
					isEnableCorps: boolean
					jobId: number
					name: string
					currentExp: number
					parameter: {
						currentHP: number
						currentMP: number
						currentMpCountList: {
							keys: Keys
							values: number[]
						}
						addtionalMaxMpCountList: {
							keys: Keys
							values: number[]
						}
						addtionalLevel: number
						addtionalMaxHp: number
						addtionalMaxMp: number
						addtionalPower: number
						addtionalVitality: number
						addtionalAgility: number
						addionalWeight: number
						addtionalIntelligence: number
						addtionalSpirit: number
						addtionalAttack: number
						addtionalDefense: number
						addtionalAbilityDefense: number
						addtionalAbilityEvasionRate: number
						addtionalMagic: number
						addtionalLuck: number
						addtionalAccuracyRate: number
						addtionalEvasionRate: number
						addtionalAbilityDisturbedRate: number
						addtionalCriticalRate: number
						addtionalDamageDirmeter: number
						addtionalAbilityDefenseRate: number
						addtionalAccuracyCount: number
						addtionalEvasionCount: number
						addtionalDefenseCount: number
						addtionalMagicDefenseCount: number
						currentConditionList: {
							target: number[]
						}
					}
					commandList: {
						target: number[]
					}
					abilityList: {
						target: {
							abilityId: number
							contentId: number
							skillLevel: number
							abilityName?: string
						}[]
					}
					abilitySlotDataList: {
						target: {
							level: number
							slotInfo: {
								keys: Keys
								values: (''|{
									abilityId: number
									contentId: number
									skillLevel: number
								})[]
							}
						}[]
					}
					jobList: {
						target: {
							id: number
							level: number
							currentProficiency: number
						}[]
					}
					equipmentList: {
						keys: Keys
						values: {
							contentId: number
							count: number
						}[]
					}
					additionOrderOwnedAbilityIds: {
						target: number[]
					}
					sortOrderOwnedAbilityIds: {
						target: number[]
					}
					abilityDictionary: {
						keys: Keys
						values: {
							target: {
								abilityId: number
								contentId: number
								skillLevel: number
							}[]
						}[]
					}
					skillLevelTargets: {
						keys: Keys
						values: number[]
					}
					learningAbilitys: {
						target: number[]
					}
					equipmentAbilitys: {
						target: number[]
					}
					numberOfButtles: number
					ownedMonsterId: number
					magicStoneId: number
					magicLearningValue: number
					isDefaultName?: boolean
					isJoiningDefaultName?: boolean
					defaultNameIndex?: number
				}[]
			}
			releasedJobs: {
				target: number[]
			}
			owendGil: number
			playTime: number
			normalOwnedItemList: {
				target: {
					contentId: number
					count: number
				}[]
			}
			importantOwendItemList: {
				target: {
					contentId: number
					count: number
				}[]
			}
			normalOwnedItemSortIdList: {
				target: unknown[]
			}
			currentArea: string
			currentLocation: string
			ownedTransportationList: {
				target: {
					position: {
						x: number
						y: number
						z: number
					}
					direction: number
					id: number
					mapId: number
					enable: boolean
					timeStampTicks: number
				}[]
			}
			owendCrystalFlags: {
				target: boolean[]
			}
			configData: string
			warehouseItemList: {
				target: unknown[]
			}
			ownedKeyWaordList: {
				target: number[]
			}
			ownedMagicList: {
				target: number[]
			}
			learnedAbilityList: {
				target: number[]
			}
			escapeCount: number
			battleCount: number
			winCount?: number
			corpsSlotIndex: number
			openChestCount: number
			ownedMagicStoneList: {
				target: unknown[]
			}
			steps: number
			saveCompleteCount: number
			monstersKilledCount: number
			totalGil: number
			wonderWandIndex?: number
			cheatSettingsData: {
				isEnableEncount: boolean
				expRate: number
				gilRate: number
				learningProficiencyRate: number
				isHpIncreaseByFightCount: boolean
				abpRate: number
				magicProficiencyRate: number
				parameterUpRate: number
				magicLearningProficiencyRate: number
			}
			isOpenedGameBoosterWindow: boolean
			braveBladeReliefCount?: number
			braveBladeEscapeCount?: number
			isTakeOverBraveBladeEscapeCount?: boolean
		}
		export type Config = {[key: string]: Value} & {
			buttonType: number
			battleModeIndex: number
			battleSpeedIndex: number
			battleMessageSpeedIndex: number
			isCursorMemory: boolean
			isKeepAutoBattle: boolean
			messageSpeed: number
			isLeftActionIcon: boolean
			isLeftVirtualPad: boolean
			isLeftMenuCommand: boolean
			isLeftBattleCommand: boolean
			reequipIndex: number
			analogModeIndex: number
			isAutoDash: number
		}
		export type Storage = {[key: string]: Value} & {
			scenario: number[]
			treasure: number[]
			global: number[]
			area: number[]
			map: number[]
			selected: number
			itemSelected: number
			transportation: unknown[]
		}
		export type Map = {[key: string]: Value} & {
			mapId: number
			pointIn: number
			transportationId: number
			carryingHoverShip: boolean
			playerEntity: {
				position: {
					x: number
					y: number
					z: number
				}
				direction: number
			}
			companionEntity: string
			gpsData: {
				transportationId?: number
				mapId: number
				areaId: number
				gpsId: number
				width: number
				height: number
			}
			moveCount: number
			subtractSteps: number
			telepoCacheData: string
			playableCharacterCorpsId: number
			currentSelectedPartyId?: number
			timerData: string
			viewType?: number
			encountEnable: boolean
			otherPartyDataList?: {
				mapId: number
				pointIn: number
				playerEntity: string
				playableCharacterCorpsId: number
			}[]
			partyPlayableCharacterCorpsId?: number[]
			fieldDefenseNpcEntityIDList?: unknown[]
			beastFieldEncountExchangeFlags?: number[]
			beastFieldEncountSeekGroupId?: number
			rtsData?: string
		}
	}

	export type Master = {[key: string]: Value} & {
		id: number
		pictureData?: master.Picture
		userData: master.User
		configData: master.Config
		dataStorage: master.Storage
		mapData: master.Map
		timeStamp: string
		playTime: number
		clearFlag: number
		isCompleteFlag: number
	}

	export type Bestiary = {[key: string]: Value} & {
		scenarioFlags: {
			target: number[]
		}
		monsterDefeats: {
			keys: Keys
			values: number[]
		}
		totalSubjugationCount: number
	}

	export namespace config {
		export type GamepadKeySettings = {[key: string]: Value} & {
			keys: Keys
			values: {
				keys: Keys
				values: number[]
			}[]
		}
		export type KeyboardKeySettings = {[key: string]: Value} & {
			keys: Keys
			values: {
				target: {
					inputType: number
					deviceType: number
					keyName: string
					axesName: string
					keyCode: number
					direction: number
				}[]
			}[]
		}
		export type MouseKeySettings = {[key: string]: Value} & {
			keys: Keys
			values: {
				target: {
					inputType: number
					deviceType: number
					keyName: string
					axesName: string
					keyCode: number
					direction: number
				}[]
			}[]
		}
	}

	export type Config = {[key: string]: Value} & {
		language: number
		fontType: number
		gamePadKeySettings: config.GamepadKeySettings
		keyboardKeySettings: config.KeyboardKeySettings
		mouseKeySettings: config.MouseKeySettings
		screenMode: number
		resolutionWidth: number
		resolutionHight: number
		isLeftActionIcon: number
		isLeftVirtualPad: number
		isLeftMenuCommand: number
		isLeftBattleCommand: number
		isAnalogMode: boolean
		brightness: number
		masterVolume: number
		bgmVolume: number
		seVolume: number
		bgmType: number
	}

	export type Data = Master|Bestiary|Config
}
