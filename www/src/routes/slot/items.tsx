import { createForm } from '@tanstack/solid-form';
import { createRoute, Link } from '@tanstack/solid-router';
import { createColumnHelper, createTable } from '@tanstack/solid-table';
import type { Master } from 'ffpr';
import { createMemo, createSignal, For, Show } from 'solid-js';

import { itemCount, itemSchema, itemsSearchSchema } from '../../schemas';
import { editSlot } from '../../store';
import { CountInput, features, Search, Table } from '../../table';
import { actionState, EditForm, NumberField, Panel } from '../../ui';
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

const helper = createColumnHelper<typeof features, Item>();

const columns = (list: List) =>
	helper.columns([
		helper.accessor('contentId', { header: 'ID', sortFn: 'basic' }),
		helper.accessor('count', {
			header: 'Count',
			sortFn: 'basic',
			enableGlobalFilter: false,
			cell: info => (
				<CountInput
					value={info.row.original.count}
					label={`Count of item ${info.row.original.contentId}`}
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
					aria-label={`Remove item ${info.row.original.contentId}`}
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
	// a new array when items are added or removed, counts are tracked by cells
	const items = createMemo(() => [...itemsOf(data, props.list)]);
	const [query, setQuery] = createSignal('');

	const table = createTable({
		features,
		columns: columns(props.list),
		get data() {
			return items();
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
				label='Find ID'
				onInput={value => {
					setQuery(value);
				}}
			/>
			<Table table={table} empty='No items.' />
			<AddItem
				list={props.list}
				taken={id => items().some(item => item.contentId === id)}
			/>
		</>
	);
}

function AddItem(props: { list: List; taken: (contentId: number) => boolean }) {
	const form = createForm(() => ({
		defaultValues: { contentId: Number.NaN, count: 1 },
		validators: {
			onChange: itemSchema.refine(item => !props.taken(item.contentId), {
				message: 'The item is already in the list',
				path: ['contentId'],
			}),
		},
		onSubmit: ({ value, formApi }) => {
			editSlot(draft => {
				itemsOf(draft, props.list).push(value);
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
						<form.Field name='contentId'>
							{field => <NumberField field={field} label='ID' />}
						</form.Field>
						<form.Field name='count'>
							{field => (
								<NumberField field={field} label='Count' />
							)}
						</form.Field>
					</div>
				</EditForm>
			)}
		</form.Subscribe>
	);
}
