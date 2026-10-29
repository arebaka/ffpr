import { RouterProvider } from '@tanstack/solid-router';
import { render } from 'solid-js/web';

import { router } from './router';

const root = document.getElementById('root');
if (root) {
	render(() => <RouterProvider router={router} />, root);
}
