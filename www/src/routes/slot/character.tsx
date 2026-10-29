import { createForm } from '@tanstack/solid-form';
import { createRoute, Link } from '@tanstack/solid-router';
import type { master } from 'ffpr';
import { For, Show } from 'solid-js';
import { z } from 'zod';

import { characterSchema } from '../../schemas';
import { editSlot } from '../../store';
import { actionState, EditForm, NumberField, Panel, TextField } from '../../ui';
import { slotRoute, useSlot } from './slot';

type Character = master.User['ownedCharacterList']['target'][number];

const idSchema = z.coerce.number().pipe(z.int());

export const characterRoute = createRoute({
	getParentRoute: () => slotRoute,
	path: 'party/$id',
	params: {
		parse: params => ({ id: idSchema.parse(params.id) }),
		stringify: params => ({ id: String(params.id) }),
	},
	component: CharacterPage,
});

const stats = [
	['currentExp', 'Experience'],
	['parameter.currentHP', 'HP'],
	['parameter.currentMP', 'MP'],
] as const;

const bonuses = [
	['parameter.addtionalLevel', 'Level'],
	['parameter.addtionalMaxHp', 'Max HP'],
	['parameter.addtionalMaxMp', 'Max MP'],
	['parameter.addtionalPower', 'Strength'],
	['parameter.addtionalVitality', 'Vitality'],
	['parameter.addtionalAgility', 'Agility'],
	['parameter.addtionalIntelligence', 'Intelligence'],
	['parameter.addtionalSpirit', 'Spirit'],
	['parameter.addtionalMagic', 'Magic'],
	['parameter.addtionalLuck', 'Luck'],
] as const;

const values = ({ name, currentExp, parameter }: Character) => ({
	name,
	currentExp,
	parameter: {
		currentHP: parameter.currentHP,
		currentMP: parameter.currentMP,
		addtionalLevel: parameter.addtionalLevel,
		addtionalMaxHp: parameter.addtionalMaxHp,
		addtionalMaxMp: parameter.addtionalMaxMp,
		addtionalPower: parameter.addtionalPower,
		addtionalVitality: parameter.addtionalVitality,
		addtionalAgility: parameter.addtionalAgility,
		addtionalIntelligence: parameter.addtionalIntelligence,
		addtionalSpirit: parameter.addtionalSpirit,
		addtionalMagic: parameter.addtionalMagic,
		addtionalLuck: parameter.addtionalLuck,
	},
});

function CharacterPage() {
	const data = useSlot();
	const params = characterRoute.useParams();
	const character = () =>
		data.userData.ownedCharacterList.target.find(
			item => item.id === params().id,
		);

	return (
		<Panel title='Character'>
			<Link to='/slot/party' class='back'>
				&lt; Party
			</Link>
			<Show
				when={character()}
				keyed
				fallback={<p>There is no character {params().id}.</p>}
			>
				{item => <CharacterForm character={item} />}
			</Show>
		</Panel>
	);
}

function createCharacterForm(character: Character) {
	return createForm(() => ({
		defaultValues: values(character),
		validators: { onChange: characterSchema },
		onSubmit: ({ value, formApi }) => {
			const renamed = value.name !== formApi.options.defaultValues?.name;
			editSlot(draft => {
				const target = draft.userData.ownedCharacterList.target.find(
					item => item.id === character.id,
				);
				if (!target) {
					return;
				}
				Object.assign(target, {
					name: value.name,
					currentExp: value.currentExp,
				});
				Object.assign(target.parameter, value.parameter);
				// otherwise the game shows the default name of the language
				if (renamed && target.isDefaultName !== undefined) {
					target.isDefaultName = false;
				}
			});
			formApi.reset(value);
		},
	}));
}

function CharacterForm(props: { character: Character }) {
	const form = createCharacterForm(props.character);
	return (
		<form.Subscribe selector={actionState}>
			{state => (
				<EditForm
					state={state}
					onSubmit={() => form.handleSubmit()}
					onReset={() => {
						form.reset();
					}}
				>
					<div class='fields'>
						<form.Field name='name'>
							{field => <TextField field={field} label='Name' />}
						</form.Field>
						<For each={stats}>
							{([name, label]) => (
								<form.Field name={name}>
									{field => (
										<NumberField
											field={field}
											label={label}
										/>
									)}
								</form.Field>
							)}
						</For>
					</div>
					<h4>Bonuses</h4>
					<div class='fields'>
						<For each={bonuses}>
							{([name, label]) => (
								<form.Field name={name}>
									{field => (
										<NumberField
											field={field}
											label={label}
										/>
									)}
								</form.Field>
							)}
						</For>
					</div>
				</EditForm>
			)}
		</form.Subscribe>
	);
}
