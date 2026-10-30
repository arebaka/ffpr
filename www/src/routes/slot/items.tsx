import { createForm } from '@tanstack/solid-form';
import { createRoute, Link } from '@tanstack/solid-router';
import { createColumnHelper, createTable } from '@tanstack/solid-table';
import type { Master } from 'ffpr';
import { createMemo, createSignal, createUniqueId, For, Show } from 'solid-js';

import { findId, itemName } from '../../names';
import { itemCount, itemsSearchSchema, newItemSchema } from '../../schemas';
import { editSlot, names } from '../../store';
import { CountInput, features, Search, Table } from '../../table';
import { actionState, EditForm, NumberField, Panel, TextField } from '../../ui';
import { slotRoute, useSlot } from './slot';

export const itemsRoute = createRoute({
	getParentRoute: () => slotRoute,
	path: 'items',
	validateSearch: itemsSearchSchema,
	component: Items,
});

const lists = {
	normal: { key: 'normalOwnedItemList', title: 'Items' },
	important: { key: 'importantOwendItemList', title: 'Key items' },
} as const;

type List = keyof typeof lists;
type Item = { contentId: number; count: number };
type Row = Item & { name: string };

const itemsOf = (data: Master, list: List): Item[] =>
	data.userData[lists[list].key].target;

function Items() {
	const search = itemsRoute.useSearch();
	return (
		<Panel title={lists[search().list].title}>
			<nav class='tabs' aria-label='Lists'>
				<For each={['normal', 'important'] as const}>
					{list => (
						<Link
							to='/slot/items'
							search={{ list }}
							class={
								search().list === list
									? 'nes-btn is-primary'
									: 'nes-btn'
							}
						>
							{lists[list].title}
						</Link>
					)}
				</For>
			</nav>
			<Show when={search().list} keyed>
				{list => <ItemList list={list} />}
			</Show>
		</Panel>
	);
}

const helper = createColumnHelper<typeof features, Row>();

const columns = (list: List) =>
	helper.columns([
		helper.accessor('name', { header: 'Name', sortFn: 'basic' }),
		helper.accessor('contentId', { header: 'ID', sortFn: 'basic' }),
		helper.accessor('count', {
			header: 'Count',
			sortFn: 'basic',
			enableGlobalFilter: false,
			cell: info => (
				<CountInput
					value={info.row.original.count}
					label={`Count of ${info.row.original.name}, ID ${info.row.original.contentId}`}
					schema={itemCount}
					onChange={count => {
						editSlot(draft => {
							const item = itemsOf(draft, list)[info.row.index];
							if (item) {
								item.count = count;
							}
						});
					}}
				/>
			),
		}),
		helper.display({
			id: 'remove',
			header: '',
			cell: info => (
				<button
					type='button'
					class='nes-btn is-error'
					aria-label={`Remove ${info.row.original.name}, ID ${info.row.original.contentId}`}
					onClick={() => {
						editSlot(draft => {
							itemsOf(draft, list).splice(info.row.index, 1);
						});
					}}
				>
					x
				</button>
			),
		}),
	]);

function ItemList(props: { list: List }) {
	const data = useSlot();
	// counts are read lazily, so that editing one does not rebuild the rows
	const rows = createMemo(() =>
		itemsOf(data, props.list).map(item => ({
			contentId: item.contentId,
			name: itemName(names(), item.contentId),
			get count() {
				return item.count;
			},
		})),
	);
	const [query, setQuery] = createSignal('');

	const table = createTable({
		features,
		columns: columns(props.list),
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
		<>
			<Search
				value={query()}
				label='Find'
				onInput={value => {
					setQuery(value);
				}}
			/>
			<Table table={table} empty='No items.' />
			<AddItem
				list={props.list}
				taken={id => rows().some(row => row.contentId === id)}
			/>
		</>
	);
}

const choices = (list: List) =>
	(list === 'normal' ? names()?.items : names()?.keyItems) ?? {};

function AddItem(props: { list: List; taken: (contentId: number) => boolean }) {
	const suggestions = createUniqueId();
	const resolve = (text: string) =>
		findId(choices(props.list), text, props.taken);
	const form = createForm(() => ({
		defaultValues: { item: '', count: 1 },
		validators: { onChange: newItemSchema(resolve, props.taken) },
		onSubmit: ({ value, formApi }) => {
			const contentId = resolve(value.item);
			if (contentId === undefined) {
				return;
			}
			editSlot(draft => {
				itemsOf(draft, props.list).push({
					contentId,
					count: value.count,
				});
			});
			formApi.reset();
		},
	}));

	return (
		<form.Subscribe selector={actionState}>
			{state => (
				<EditForm
					class='add'
					state={state}
					submit='Add'
					onSubmit={() => form.handleSubmit()}
					onReset={() => {
						form.reset();
					}}
				>
					<h4>Add an item</h4>
					<div class='fields'>
						<form.Field name='item'>
							{field => (
								<TextField
									field={field}
									label='Name or ID'
									list={suggestions}
								/>
							)}
						</form.Field>
						<form.Field name='count'>
							{field => (
								<NumberField field={field} label='Count' />
							)}
						</form.Field>
					</div>
					<datalist id={suggestions}>
						<For
							each={[
								...new Set(Object.values(choices(props.list))),
							]}
						>
							{name => <option>{name}</option>}
						</For>
					</datalist>
				</EditForm>
			)}
		</form.Subscribe>
	);
}
