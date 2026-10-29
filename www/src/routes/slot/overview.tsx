import { createForm } from '@tanstack/solid-form';
import { createRoute } from '@tanstack/solid-router';
import type { Master, master } from 'ffpr';
import { For, onCleanup, Show } from 'solid-js';

import { formatDuration, parseDuration } from '../../format';
import { overviewSchema } from '../../schemas';
import { editSlot } from '../../store';
import { actionState, EditForm, NumberField, Panel, TextField } from '../../ui';
import { slotRoute, useSlot } from './slot';

export const overviewRoute = createRoute({
	getParentRoute: () => slotRoute,
	path: '/',
	component: Overview,
});

const counters = [
	['owendGil', 'Gil'],
	['steps', 'Steps'],
	['battleCount', 'Battles'],
	['escapeCount', 'Escapes'],
	['monstersKilledCount', 'Monsters defeated'],
	['openChestCount', 'Chests opened'],
	['saveCompleteCount', 'Times saved'],
] as const;

const values = (user: master.User) => ({
	owendGil: user.owendGil,
	playTime: formatDuration(user.playTime),
	steps: user.steps,
	battleCount: user.battleCount,
	escapeCount: user.escapeCount,
	monstersKilledCount: user.monstersKilledCount,
	openChestCount: user.openChestCount,
	saveCompleteCount: user.saveCompleteCount,
});

function createOverviewForm(data: Master) {
	return createForm(() => ({
		defaultValues: values(data.userData),
		validators: { onChange: overviewSchema },
		onSubmit: ({ value, formApi }) => {
			const { playTime, ...rest } = value;
			// the time is stored with fractions of a second
			const timeChanged =
				playTime !== formApi.options.defaultValues?.playTime;
			editSlot(draft => {
				Object.assign(draft.userData, rest);
				if (timeChanged) {
					draft.userData.playTime = parseDuration(playTime);
					draft.playTime = parseDuration(playTime);
				}
			});
			formApi.reset(value);
		},
	}));
}

function Overview() {
	const data = useSlot();
	const form = createOverviewForm(data);
	return (
		<Panel title='Overview'>
			<Summary data={data} />
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
							<form.Field name='playTime'>
								{field => (
									<TextField
										field={field}
										label='Play time'
										placeholder='H:MM:SS'
									/>
								)}
							</form.Field>
							<For each={counters}>
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
		</Panel>
	);
}

function Summary(props: { data: Master }) {
	return (
		<div class='summary'>
			<Show when={props.data.pictureData}>
				{picture => <Picture data={picture()} />}
			</Show>
			<dl>
				<dt>Saved</dt>
				<dd>{props.data.timeStamp}</dd>
			</dl>
		</div>
	);
}

function Picture(props: { data: Uint8Array }) {
	const url = URL.createObjectURL(new Blob([new Uint8Array(props.data)]));
	onCleanup(() => {
		URL.revokeObjectURL(url);
	});
	return <img class='picture' src={url} alt='Screenshot of the save' />;
}
