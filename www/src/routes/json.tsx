import { createForm } from '@tanstack/solid-form';
import { createRoute } from '@tanstack/solid-router';
import { Show } from 'solid-js';

import { jsonSchema } from '../schemas';
import { type Opened, opened, replace, saveAs, toJson } from '../store';
import { actionState, EditForm, errorText, type FieldLike, Panel } from '../ui';
import { fileRoute } from './file';

export const jsonRoute = createRoute({
	getParentRoute: () => fileRoute,
	path: 'json',
	component: JsonPage,
});

function JsonPage() {
	return (
		<Show when={opened()} keyed>
			{file => <JsonEditor file={file} />}
		</Show>
	);
}

function JsonEditor(props: { file: Opened }) {
	const form = createForm(() => ({
		defaultValues: { text: toJson(props.file.data) },
		validators: { onChange: jsonSchema },
		onSubmit: ({ value }) => {
			replace(JSON.parse(value.text));
		},
	}));

	return (
		<Panel title='JSON'>
			<form.Subscribe selector={actionState}>
				{state => (
					<EditForm
						state={state}
						onSubmit={() => form.handleSubmit()}
						onReset={() => {
							form.reset();
						}}
					>
						<form.Field name='text'>
							{field => <JsonField field={field} />}
						</form.Field>
					</EditForm>
				)}
			</form.Subscribe>
			<button
				type='button'
				class='nes-btn download-json'
				onClick={() => {
					saveAs(
						toJson(props.file.data),
						`${props.file.name}.json`,
						'application/json',
					);
				}}
			>
				Download JSON
			</button>
		</Panel>
	);
}

function JsonField(props: { field: () => FieldLike<string> }) {
	const error = () => errorText(props.field().state.meta.errors);
	return (
		<div class='nes-field'>
			<label for='json'>Decoded save</label>
			<textarea
				id='json'
				class='nes-textarea is-dark json'
				classList={{ 'is-error': error() !== '' }}
				spellcheck={false}
				value={props.field().state.value}
				aria-invalid={error() !== ''}
				aria-describedby='json-hint'
				onInput={event => {
					props.field().handleChange(event.currentTarget.value);
				}}
			/>
			<Show when={error() !== ''}>
				<p class='nes-text is-error field-error'>{error()}</p>
			</Show>
			<p id='json-hint' class='hint'>
				Keys are spelled as in the game. The picture of a save slot is
				not shown and stays as it is.
			</p>
		</div>
	);
}
