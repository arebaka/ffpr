import {
	createRoute,
	Link,
	Outlet,
	redirect,
	useNavigate,
} from '@tanstack/solid-router';
import type { Type } from 'ffpr';
import { createSignal, For, Show } from 'solid-js';

import { platformLabels, platformOptions } from '../schemas';
import {
	close,
	download,
	type Kind,
	kindLabels,
	message,
	type Opened,
	opened,
} from '../store';
import { Panel, Select } from '../ui';
import { rootRoute } from './root';

export const fileRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: 'file',
	beforeLoad: () => {
		if (!opened()) {
			redirect({ to: '/', throw: true });
		}
	},
	component: FileLayout,
});

function FileLayout() {
	return (
		<Show when={opened()}>
			{file => (
				<>
					<FileHeader file={file()} />
					<Tabs kind={file().kind} />
					<Outlet />
				</>
			)}
		</Show>
	);
}

function FileHeader(props: { file: Opened }) {
	const navigate = useNavigate();

	async function closeFile() {
		if (
			props.file.modified &&
			!confirm('Close the save and lose the changes?')
		) {
			return;
		}
		await navigate({ to: '/' });
		close();
	}

	return (
		<Panel title={props.file.name} heading='h2' class='file'>
			<p>
				{kindLabels[props.file.kind]} from{' '}
				{platformLabels[props.file.platform]}
				<Show when={props.file.modified}>
					, <span class='nes-text is-warning'>changed</span>
				</Show>
			</p>
			<div class='file-actions'>
				<Download platform={props.file.platform} />
				<button
					type='button'
					class='nes-btn is-error'
					onClick={() => {
						void closeFile();
					}}
				>
					Close
				</button>
			</div>
		</Panel>
	);
}

type Tab = {
	to:
		| '/slot'
		| '/slot/party'
		| '/slot/items'
		| '/slot/booster'
		| '/bestiary'
		| '/json';
	label: string;
	exact?: boolean;
};

const tabs: Record<Kind, Tab[]> = {
	slot: [
		{ to: '/slot', label: 'Overview', exact: true },
		{ to: '/slot/party', label: 'Party' },
		{ to: '/slot/items', label: 'Items' },
		{ to: '/slot/booster', label: 'Booster' },
	],
	bestiary: [{ to: '/bestiary', label: 'Bestiary' }],
	settings: [],
	other: [],
};

const jsonTab: Tab = { to: '/json', label: 'JSON' };

function Tabs(props: { kind: Kind }) {
	return (
		<nav class='tabs' aria-label='Sections'>
			<For each={[...tabs[props.kind], jsonTab]}>
				{tab => (
					<Link
						to={tab.to}
						class='nes-btn'
						activeProps={{ class: 'is-primary' }}
						activeOptions={{ exact: tab.exact === true }}
					>
						{tab.label}
					</Link>
				)}
			</For>
		</nav>
	);
}

function Download(props: { platform: Type }) {
	const [target, setTarget] = createSignal(props.platform);
	const [error, setError] = createSignal('');

	async function save() {
		setError('');
		try {
			await download(target());
		} catch (reason) {
			setError(message(reason));
		}
	}

	return (
		<div class='download'>
			<Select
				label='Platform to download for'
				value={target()}
				options={platformOptions}
				onChange={platform => {
					setTarget(platform);
				}}
			/>
			<button
				type='button'
				class='nes-btn is-success'
				onClick={() => {
					void save();
				}}
			>
				Download
			</button>
			<Show when={error() !== ''}>
				<p class='nes-text is-error' role='alert'>
					{error()}
				</p>
			</Show>
		</div>
	);
}
