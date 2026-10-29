import { createForm } from '@tanstack/solid-form';
import { createRoute } from '@tanstack/solid-router';
import type { master } from 'ffpr';
import { For } from 'solid-js';

import { boosterSchema } from '../../schemas';
import { editSlot } from '../../store';
import {
	actionState,
	CheckboxField,
	EditForm,
	NumberField,
	Panel,
} from '../../ui';
import { slotRoute, useSlot } from './slot';

export const boosterRoute = createRoute({
	getParentRoute: () => slotRoute,
	path: 'booster',
	component: Booster,
});

const switches = [
	['isEnableEncount', 'Random encounters'],
	['isHpIncreaseByFightCount', 'HP grows with battles'],
] as const;

const rates = [
	['expRate', 'Experience'],
	['gilRate', 'Gil'],
	['abpRate', 'ABP'],
	['learningProficiencyRate', 'Proficiency'],
	['magicProficiencyRate', 'Magic proficiency'],
	['magicLearningProficiencyRate', 'Magic learning'],
	['parameterUpRate', 'Stat growth'],
] as const;

const values = (settings: master.User['cheatSettingsData']) => ({
	isEnableEncount: settings.isEnableEncount,
	isHpIncreaseByFightCount: settings.isHpIncreaseByFightCount,
	expRate: settings.expRate,
	gilRate: settings.gilRate,
	abpRate: settings.abpRate,
	learningProficiencyRate: settings.learningProficiencyRate,
	magicProficiencyRate: settings.magicProficiencyRate,
	magicLearningProficiencyRate: settings.magicLearningProficiencyRate,
	parameterUpRate: settings.parameterUpRate,
});

function createBoosterForm(settings: master.User['cheatSettingsData']) {
	return createForm(() => ({
		defaultValues: values(settings),
		validators: { onChange: boosterSchema },
		onSubmit: ({ value, formApi }) => {
			editSlot(draft => {
				Object.assign(draft.userData.cheatSettingsData, value);
			});
			formApi.reset(value);
		},
	}));
}

function Booster() {
	const form = createBoosterForm(useSlot().userData.cheatSettingsData);
	return (
		<Panel title='Game Booster'>
			<form.Subscribe selector={actionState}>
				{state => (
					<EditForm
						state={state}
						onSubmit={() => form.handleSubmit()}
						onReset={() => {
							form.reset();
						}}
					>
						<div class='checkboxes'>
							<For each={switches}>
								{([name, label]) => (
									<form.Field name={name}>
										{field => (
											<CheckboxField
												field={field}
												label={label}
											/>
										)}
									</form.Field>
								)}
							</For>
						</div>
						<h4>Rates</h4>
						<div class='fields'>
							<For each={rates}>
								{([name, label]) => (
									<form.Field name={name}>
										{field => (
											<NumberField
												field={field}
												label={label}
												step='any'
											/>
										)}
									</form.Field>
								)}
							</For>
						</div>
					</EditForm>
				)}
			</form.Subscribe>
		</Panel>
	);
}
