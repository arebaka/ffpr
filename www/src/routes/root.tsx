import {
	createRootRoute,
	type ErrorComponentProps,
	Link,
	Outlet,
} from '@tanstack/solid-router';
import { onCleanup, onMount } from 'solid-js';

import { message, opened } from '../store';

export const rootRoute = createRootRoute({
	component: Root,
	errorComponent: ErrorPage,
	notFoundComponent: NotFound,
});

const warnBeforeUnload = (event: BeforeUnloadEvent) => {
	if (opened()?.modified === true) {
		event.preventDefault();
	}
};

function Root() {
	onMount(() => {
		window.addEventListener('beforeunload', warnBeforeUnload);
	});
	onCleanup(() => {
		window.removeEventListener('beforeunload', warnBeforeUnload);
	});

	return (
		<div class='app'>
			<header>
				<Link to='/' class='app-title'>
					<img src='./favicon.svg' alt='' width='32' height='32' />
					Final Fantasy Pixel Remaster save editor
				</Link>
			</header>
			<main>
				<Outlet />
			</main>
			<footer class='app-footer'>
				<p>Saves are decoded in your browser and never leave it.</p>
				<p>
					<a href='https://github.com/arebaka/ffpr'>GitHub</a>
					{' · '}
					<a href='https://www.npmjs.com/package/ffpr'>npm</a>
					{' · '}
					<a href='https://jsr.io/@arelive/ffpr'>JSR</a>
				</p>
			</footer>
		</div>
	);
}

function ErrorPage(props: ErrorComponentProps) {
	return (
		<section class='nes-container is-rounded is-dark'>
			<p class='nes-text is-error'>{message(props.error)}</p>
			<Link to='/' class='nes-btn'>
				Back
			</Link>
		</section>
	);
}

function NotFound() {
	return (
		<section class='nes-container is-rounded is-dark'>
			<p>There is no such page.</p>
			<Link to='/' class='nes-btn'>
				Back
			</Link>
		</section>
	);
}
