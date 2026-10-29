import { createRoute, Link, useNavigate } from '@tanstack/solid-router';
import type { Type } from 'ffpr';
import { createSignal, Show } from 'solid-js';

import { platformOptions } from '../schemas';
import { type Kind, kindLabels, message, open, opened } from '../store';
import { Panel, Select } from '../ui';
import { rootRoute } from './root';

export const openRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: OpenPage,
});

const home = {
	slot: '/slot',
	bestiary: '/bestiary',
	settings: '/json',
	other: '/json',
} as const satisfies Record<Kind, string>;

const choices = [['auto', 'Detect'], ...platformOptions] as const;

const canReplace = () => {
	const current = opened();
	return (
		current?.modified !== true ||
		confirm(`Discard the changes in ${current.name}?`)
	);
};

function OpenPage() {
	const navigate = useNavigate();
	const [choice, setChoice] = createSignal<'auto' | Type>('auto');
	const [error, setError] = createSignal('');
	const [busy, setBusy] = createSignal(false);

	async function load(file: File) {
		if (!canReplace()) {
			return;
		}
		setError('');
		setBusy(true);
		try {
			const platform = choice();
			const kind = await open(
				file,
				platform === 'auto' ? undefined : platform,
			);
			await navigate({ to: home[kind] });
		} catch (reason) {
			setError(message(reason));
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<Panel title='Open a save' heading='h2'>
				<DropZone busy={busy()} onFile={load} />
				<PlatformField
					value={choice()}
					onChange={value => {
						setChoice(value);
					}}
				/>
				<Show when={error() !== ''}>
					<p class='nes-text is-error' role='alert'>
						{error()}
					</p>
				</Show>
			</Panel>
			<StillOpen />
			<About />
		</>
	);
}

function PlatformField(props: {
	value: 'auto' | Type;
	onChange: (value: 'auto' | Type) => void;
}) {
	return (
		<div class='nes-field is-inline'>
			<label for='platform'>Platform</label>
			<Select
				id='platform'
				value={props.value}
				options={choices}
				onChange={value => {
					props.onChange(value);
				}}
			/>
		</div>
	);
}

function StillOpen() {
	return (
		<Show when={opened()}>
			{file => (
				<p class='continue'>
					{kindLabels[file().kind]}{' '}
					<Link to={home[file().kind]}>{file().name}</Link> is still
					open.
				</p>
			)}
		</Show>
	);
}

function DropZone(props: {
	busy: boolean;
	onFile: (file: File) => Promise<void>;
}) {
	const [over, setOver] = createSignal(false);
	const take = (files: FileList | null | undefined) => {
		const file = files?.[0];
		if (file !== undefined && !props.busy) {
			void props.onFile(file);
		}
	};

	return (
		<div
			class='dropzone'
			classList={{ 'is-over': over() }}
			onDragOver={event => {
				event.preventDefault();
				setOver(true);
			}}
			onDragLeave={() => {
				setOver(false);
			}}
			onDrop={event => {
				event.preventDefault();
				setOver(false);
				take(event.dataTransfer?.files);
			}}
		>
			<p>Drop a save file here or</p>
			<label
				class='nes-btn is-primary'
				classList={{ 'is-disabled': props.busy }}
			>
				{props.busy ? 'Reading...' : 'Choose a file'}
				<input
					type='file'
					class='visually-hidden'
					disabled={props.busy}
					onChange={event => {
						take(event.currentTarget.files);
						event.currentTarget.value = '';
					}}
				/>
			</label>
		</div>
	);
}

function About() {
	return (
		<Panel title='Saves' heading='h2'>
			<ul class='nes-list is-disc'>
				<li>
					Save slots, the bestiary and the settings of all six games.
				</li>
				<li>
					Nintendo Switch, PC and PlayStation. A save can be
					downloaded for another platform.
				</li>
				<li>Keep a copy of the original file before editing.</li>
			</ul>
		</Panel>
	);
}
