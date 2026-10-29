import { createRoute, Outlet, redirect } from '@tanstack/solid-router';
import type { Master } from 'ffpr';
import { createContext, Show, useContext } from 'solid-js';

import { opened, slot } from '../../store';
import { fileRoute } from '../file';

export const slotRoute = createRoute({
	getParentRoute: () => fileRoute,
	path: 'slot',
	beforeLoad: () => {
		if (opened()?.kind !== 'slot') {
			redirect({ to: '/json', throw: true });
		}
	},
	component: SlotLayout,
});

const SlotContext = createContext<Master>();

// pages of a save slot are remounted when its data is replaced
export function useSlot(): Master {
	const data = useContext(SlotContext);
	if (!data) {
		throw new Error('useSlot is called outside of a save slot');
	}
	return data;
}

function SlotLayout() {
	return (
		<Show when={slot()} keyed>
			{data => (
				<SlotContext.Provider value={data}>
					<Outlet />
				</SlotContext.Provider>
			)}
		</Show>
	);
}
