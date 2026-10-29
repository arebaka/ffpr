import { createRoute, redirect } from '@tanstack/solid-router';
import { createColumnHelper, createTable } from '@tanstack/solid-table';
import type { Bestiary } from 'ffpr';
import { createMemo, createSignal, Show } from 'solid-js';

import { formatNumber } from '../format';
import { amount } from '../schemas';
import { bestiary, editBestiary, opened } from '../store';
import { CountInput, features, Search, Table } from '../table';
import { Panel } from '../ui';
import { fileRoute } from './file';

export const bestiaryRoute = createRoute({
	getParentRoute: () => fileRoute,
	path: 'bestiary',
	beforeLoad: () => {
		if (opened()?.kind !== 'bestiary') {
			redirect({ to: '/json', throw: true });
		}
	},
	component: BestiaryPage,
});

type Defeats = { index: number; monsterId: number; count: number };

const helper = createColumnHelper<typeof features, Defeats>();

const columns = helper.columns([
	helper.accessor('monsterId', { header: 'Monster ID', sortFn: 'basic' }),
	helper.accessor('count', {
		header: 'Defeated',
		sortFn: 'basic',
		enableGlobalFilter: false,
		cell: info => (
			<CountInput
				value={info.row.original.count}
				label={`Defeats of monster ${info.row.original.monsterId}`}
				schema={amount}
				onChange={count => {
					editBestiary(draft => {
						draft.monsterDefeats.values[info.row.original.index] =
							count;
					});
				}}
			/>
		),
	}),
]);

function BestiaryPage() {
	return (
		<Show when={bestiary()} keyed>
			{data => <DefeatsTable data={data} />}
		</Show>
	);
}

function DefeatsTable(props: { data: Bestiary }) {
	// counts are read lazily, so that editing one does not rebuild the rows
	const rows = createMemo(() => {
		const defeats = props.data.monsterDefeats;
		return defeats.keys.map((monsterId, index) => ({
			index,
			monsterId,
			get count() {
				return defeats.values[index] ?? 0;
			},
		}));
	});
	const [query, setQuery] = createSignal('');

	const table = createTable({
		features,
		columns,
		get data() {
			return rows();
		},
		state: {
			get globalFilter() {
				return query();
			},
		},
		globalFilterFn: 'includesString',
	});

	return (
		<Panel title='Bestiary'>
			<p>
				{formatNumber(rows().length)} monsters,{' '}
				{formatNumber(props.data.totalSubjugationCount)} defeated in
				total.
			</p>
			<Search
				value={query()}
				label='Find ID'
				onInput={value => {
					setQuery(value);
				}}
			/>
			<Table table={table} empty='No monsters.' />
		</Panel>
	);
}
