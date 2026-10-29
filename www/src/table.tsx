import {
	columnFilteringFeature,
	createFilteredRowModel,
	createSortedRowModel,
	filterFn_includesString,
	flexRender,
	globalFilteringFeature,
	type Header,
	type RowData,
	rowSortingFeature,
	type SolidTable,
	type SortDirection,
	sortFn_basic,
	tableFeatures,
} from '@tanstack/solid-table';
import { createSignal, For } from 'solid-js';
import type { z } from 'zod';

// sorting and search for the tables of counts
export const features = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: { includesString: filterFn_includesString },
	sortFns: { basic: sortFn_basic },
});

type Features = typeof features;

const sortNames = { asc: 'ascending', desc: 'descending' } as const;
const sortArrows = { asc: ' ▲', desc: ' ▼' } as const;

const ariaSort = (direction: false | SortDirection) =>
	direction === false ? undefined : sortNames[direction];
const arrow = (direction: false | SortDirection) =>
	direction === false ? '' : sortArrows[direction];

function HeaderCell<T extends RowData>(props: {
	table: SolidTable<Features, T>;
	header: Header<Features, T>;
}) {
	const direction = () => props.header.column.getIsSorted();
	return (
		<th aria-sort={ariaSort(direction())}>
			{props.header.column.getCanSort() ? (
				<button
					type='button'
					class='sort'
					onClick={props.header.column.getToggleSortingHandler()}
				>
					<props.table.FlexRender header={props.header} />
					{arrow(direction())}
				</button>
			) : (
				<props.table.FlexRender header={props.header} />
			)}
		</th>
	);
}

function Rows<T extends RowData>(props: {
	table: SolidTable<Features, T>;
	empty: string;
}) {
	return (
		<For
			each={props.table.getRowModel().rows}
			fallback={
				<tr>
					<td colSpan={props.table.getAllLeafColumns().length}>
						{props.empty}
					</td>
				</tr>
			}
		>
			{row => (
				<tr>
					<For each={row.getAllCells()}>
						{cell => (
							<td>
								{flexRender(
									cell.column.columnDef.cell,
									cell.getContext(),
								)}
							</td>
						)}
					</For>
				</tr>
			)}
		</For>
	);
}

export function Table<T extends RowData>(props: {
	table: SolidTable<Features, T>;
	empty: string;
}) {
	return (
		<div class='nes-table-responsive'>
			<table class='nes-table is-bordered is-dark'>
				<thead>
					<For each={props.table.getHeaderGroups()}>
						{group => (
							<tr>
								<For each={group.headers}>
									{header => (
										<HeaderCell
											table={props.table}
											header={header}
										/>
									)}
								</For>
							</tr>
						)}
					</For>
				</thead>
				<tbody>
					<Rows table={props.table} empty={props.empty} />
				</tbody>
			</table>
		</div>
	);
}

// writes only the values accepted by the schema
export function CountInput(props: {
	value: number;
	label: string;
	schema: z.ZodType<number>;
	onChange: (value: number) => void;
}) {
	const [invalid, setInvalid] = createSignal(false);
	return (
		<input
			type='number'
			class='nes-input is-dark count'
			classList={{ 'is-error': invalid() }}
			min='0'
			value={props.value}
			aria-label={props.label}
			aria-invalid={invalid()}
			onInput={event => {
				const result = props.schema.safeParse(
					event.currentTarget.valueAsNumber,
				);
				setInvalid(!result.success);
				if (result.success) {
					props.onChange(result.data);
				}
			}}
		/>
	);
}

export function Search(props: {
	value: string;
	label: string;
	onInput: (value: string) => void;
}) {
	return (
		<div class='nes-field is-inline search'>
			<label for='search'>{props.label}</label>
			<input
				id='search'
				type='search'
				class='nes-input is-dark'
				value={props.value}
				onInput={event => {
					props.onInput(event.currentTarget.value);
				}}
			/>
		</div>
	);
}
