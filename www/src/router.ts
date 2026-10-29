import { createHashHistory, createRouter } from '@tanstack/solid-router';

import { bestiaryRoute } from './routes/bestiary';
import { fileRoute } from './routes/file';
import { jsonRoute } from './routes/json';
import { openRoute } from './routes/open';
import { rootRoute } from './routes/root';
import { slotTree } from './routes/slot';

const routeTree = rootRoute.addChildren([
	openRoute,
	fileRoute.addChildren([slotTree, bestiaryRoute, jsonRoute]),
]);

// hash history works on static hosting without a fallback page
export const router = createRouter({
	routeTree,
	history: createHashHistory(),
	scrollRestoration: true,
});

declare module '@tanstack/solid-router' {
	interface Register {
		router: typeof router;
	}
}
