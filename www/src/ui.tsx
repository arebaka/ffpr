import { createUniqueId, For, type JSX, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

// the part of a TanStack Form field that the inputs use
export interface FieldLike<T> {
	readonly state: {
		readonly value: T;
		readonly meta: { readonly errors: readonly unknown[] };
	};
	handleChange: (value: T) => void;
	handleBlur: () => void;
}

export const errorText = (errors: readonly unknown[]) =>
	errors
		.flat()
		.map(error =>
			typeof error === 'object' && error !== null && 'message' in error
				? String(error.message)
				: String(error),
		)
		.join(', ');

function Field(props: {
	id: string;
	label: string;
	error: string;
	children: JSX.Element;
}) {
	return (
		<div class='nes-field'>
			<label for={props.id}>{props.label}</label>
			{props.children}
			<Show when={props.error !== ''}>
				<p
					id={`${props.id}-error`}
					class='nes-text is-error field-error'
				>
					{props.error}
				</p>
			</Show>
		</div>
	);
}

function Input<T extends number | string>(props: {
	field: () => FieldLike<T>;
	label: string;
	type: 'number' | 'text';
	parse: (input: HTMLInputElement) => T;
	step?: string;
	placeholder?: string | undefined;
	list?: string | undefined;
}) {
	const id = createUniqueId();
	const error = () => errorText(props.field().state.meta.errors);
	return (
		<Field id={id} label={props.label} error={error()}>
			<input
				id={id}
				type={props.type}
				class='nes-input is-dark'
				classList={{ 'is-error': error() !== '' }}
				min={props.type === 'number' ? '0' : undefined}
				step={props.step}
				placeholder={props.placeholder}
				list={props.list}
				autocomplete={props.list === undefined ? undefined : 'off'}
				value={props.field().state.value}
				aria-invalid={error() !== ''}
				aria-describedby={error() === '' ? undefined : `${id}-error`}
				onInput={event => {
					props
						.field()
						.handleChange(props.parse(event.currentTarget));
				}}
				onBlur={() => {
					props.field().handleBlur();
				}}
			/>
		</Field>
	);
}

export function NumberField(props: {
	field: () => FieldLike<number>;
	label: string;
	step?: string;
}) {
	return (
		<Input
			field={props.field}
			label={props.label}
			type='number'
			step={props.step ?? '1'}
			parse={input => input.valueAsNumber}
		/>
	);
}

export function TextField(props: {
	field: () => FieldLike<string>;
	label: string;
	placeholder?: string;
	list?: string;
}) {
	return (
		<Input
			field={props.field}
			label={props.label}
			type='text'
			placeholder={props.placeholder}
			list={props.list}
			parse={input => input.value}
		/>
	);
}

export function CheckboxField(props: {
	field: () => FieldLike<boolean>;
	label: string;
}) {
	return (
		<label class='checkbox'>
			<input
				type='checkbox'
				class='nes-checkbox is-dark'
				checked={props.field().state.value}
				onChange={event => {
					props.field().handleChange(event.currentTarget.checked);
				}}
				onBlur={() => {
					props.field().handleBlur();
				}}
			/>
			<span>{props.label}</span>
		</label>
	);
}

export const actionState = (
	state: Readonly<{ canSubmit: boolean; isDefaultValue: boolean }>,
) => ({ canSubmit: state.canSubmit, changed: !state.isDefaultValue });

// a form with apply and reset buttons
export function EditForm(props: {
	state: () => ReturnType<typeof actionState>;
	onSubmit: () => Promise<void>;
	onReset: () => void;
	submit?: string;
	class?: string;
	children: JSX.Element;
}) {
	const disabled = () => !props.state().canSubmit || !props.state().changed;
	return (
		<form
			class={props.class}
			onSubmit={event => {
				event.preventDefault();
				void props.onSubmit();
			}}
		>
			{props.children}
			<div class='actions'>
				<button
					type='submit'
					class='nes-btn is-primary'
					classList={{ 'is-disabled': disabled() }}
					disabled={disabled()}
				>
					{props.submit ?? 'Apply'}
				</button>
				<button
					type='button'
					class='nes-btn'
					classList={{ 'is-disabled': !props.state().changed }}
					disabled={!props.state().changed}
					onClick={() => {
						props.onReset();
					}}
				>
					Reset
				</button>
			</div>
		</form>
	);
}

export function Select<T extends string>(props: {
	value: T;
	options: readonly (readonly [T, string])[];
	onChange: (value: T) => void;
	id?: string;
	label?: string;
}) {
	return (
		<div class='nes-select is-dark'>
			<select
				id={props.id}
				aria-label={props.label}
				onChange={event => {
					const { value } = event.currentTarget;
					const option = props.options.find(([key]) => key === value);
					if (option) {
						props.onChange(option[0]);
					}
				}}
			>
				<For each={props.options}>
					{([value, text]) => (
						<option value={value} selected={value === props.value}>
							{text}
						</option>
					)}
				</For>
			</select>
		</div>
	);
}

// titled container of NES.css in the dark theme
export function Panel(props: {
	title: JSX.Element;
	heading?: 'h2' | 'h3';
	class?: string;
	children: JSX.Element;
}) {
	return (
		<section
			class={`nes-container is-dark with-title ${props.class ?? ''}`}
		>
			<Dynamic component={props.heading ?? 'h3'} class='title'>
				{props.title}
			</Dynamic>
			{props.children}
		</section>
	);
}
