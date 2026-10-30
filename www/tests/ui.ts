// Checks the built editor in a headless Chrome: opens saves made by the library,
// edits a slot and reads the downloaded file back. Run after `bun run build`.
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pack, unpack } from 'ffpr';
import type { Master } from 'ffpr';
import { launch, type Page } from 'puppeteer-core';
import { preview } from 'vite';

import { bestiary, slot } from './saves';

const root = fileURLToPath(new URL('..', import.meta.url));

function findChrome(): string {
	const names = [
		'google-chrome-stable',
		'google-chrome',
		'chromium',
		'chromium-browser',
	];
	for (const name of names) {
		const path = Bun.which(name);
		if (path !== null) {
			return path;
		}
	}
	throw new Error('Chrome is not found, set CHROME_PATH');
}

function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

const failures: string[] = [];

async function step(name: string, run: () => Promise<void>) {
	try {
		await run();
		console.log(`✓ ${name}`);
	} catch (error) {
		failures.push(name);
		console.error(
			`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

const fieldValue = (page: Page, label: string) =>
	page.evaluate(
		text =>
			[...document.querySelectorAll('.nes-field')]
				.find(
					field => field.querySelector('label')?.textContent === text,
				)
				?.querySelector('input')?.value,
		label,
	);

const text = (page: Page, selector: string) =>
	page.$eval(selector, element => element.textContent);

const column = (page: Page, index: number) =>
	page.$$eval(
		'tbody tr',
		(rows, cell) =>
			rows.map(row => row.children[cell]?.textContent ?? '').join(),
		index,
	);

const waitForColumn = (
	page: Page,
	index: number,
	selector: string,
	expected: string,
) =>
	page.waitForFunction(
		(cell, value, input) =>
			[...document.querySelectorAll('tbody tr')]
				.map(row => row.children[cell]?.textContent ?? '')
				.join() === value && document.querySelector(input) !== null,
		{},
		index,
		expected,
		selector,
	);

async function openSave(page: Page, url: string, file: string, hash: string) {
	await page.goto(`${url}#/`);
	const input = await page.waitForSelector('input[type=file]');
	assert(input !== null, 'no file input');
	await input.uploadFile(file);
	if (hash !== '#/') {
		await page.waitForFunction(
			expected => location.hash === expected,
			{},
			hash,
		);
	}
}

async function waitForFile(path: string, attempts = 50): Promise<Buffer> {
	if (existsSync(path)) {
		return readFile(path);
	}
	if (attempts === 0) {
		throw new Error(`${path} is not downloaded`);
	}
	await Bun.sleep(100);
	return waitForFile(path, attempts - 1);
}

if (!existsSync(join(root, 'dist/index.html'))) {
	throw new Error('dist is not built, run bun run build');
}

const dir = await mkdtemp(join(tmpdir(), 'ffpr-ui-'));
const downloads = join(dir, 'downloads');
await mkdir(downloads);
await writeFile(join(dir, 'slot'), await pack(slot, 'switch'));
await writeFile(join(dir, 'bestiary'), await pack(bestiary, 'pc'));
await writeFile(join(dir, 'garbage'), 'not a save');

const server = await preview({
	root,
	logLevel: 'warn',
	preview: { port: 4180 },
});
const browser = await launch({
	executablePath: process.env.CHROME_PATH ?? findChrome(),
	// the sandbox needs user namespaces that CI runners may not allow
	args: process.env.CI === undefined ? [] : ['--no-sandbox'],
});

try {
	const url = server.resolvedUrls?.local[0];
	assert(url !== undefined, 'the preview server has no URL');

	const session = await browser.target().createCDPSession();
	await session.send('Browser.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath: downloads,
	});
	const page = await browser.newPage();
	page.setDefaultTimeout(10_000);
	page.on('dialog', dialog => void dialog.accept());

	await step('a Switch save slot opens', async () => {
		await openSave(page, url, join(dir, 'slot'), '#/slot');
		const header = await text(page, 'section p');
		assert(header.includes('Nintendo Switch'), `header: ${header}`);
		assert((await fieldValue(page, 'Gil')) === '12345', 'gil');
		assert(
			(await fieldValue(page, 'Play time')) === '3:00:30',
			'play time',
		);
	});

	await step('gil is changed', async () => {
		await page.evaluate(() => {
			const gil = [...document.querySelectorAll('.nes-field')]
				.find(
					field =>
						field.querySelector('label')?.textContent === 'Gil',
				)
				?.querySelector('input');
			gil?.focus();
			gil?.select();
		});
		await page.keyboard.type('999');
		await page.click('button[type=submit]');
		const header = await text(page, 'section p');
		assert(header.includes('changed'), `header: ${header}`);
	});

	await step('the slot is downloaded for PC', async () => {
		await page.select('.download select', 'pc');
		await page.click('.download button');
		const data = (await unpack(
			await waitForFile(join(downloads, 'slot')),
			'pc',
		)) as Master;
		assert(
			data.userData.owendGil === 999,
			`gil: ${data.userData.owendGil}`,
		);
		const header = await text(page, 'section p');
		assert(!header.includes('changed'), `header: ${header}`);
	});

	await step('the party lists the characters', async () => {
		await page.click('nav a[href$="/slot/party"]');
		await page.waitForSelector('.card');
		const names = await page.$$eval('.card h4', cards =>
			cards.map(card => card.textContent),
		);
		assert(names.join() === 'Luneth,Arc', `names: ${names.join()}`);
	});

	await step('the game is recognized and items have names', async () => {
		await page.click('nav a[href$="/slot/items"]');
		await page.waitForSelector('tbody tr');
		const chosen = await page.$eval('.game select', select => select.value);
		assert(chosen === 'III', `game: ${chosen}`);
		const names = await column(page, 0);
		assert(names === 'Potion,Hi-Potion', `names: ${names}`);
	});

	await step('the search finds items by name and ID', async () => {
		await page.type('#search', 'hi-p');
		await waitForColumn(page, 1, '#search', '3');
		await page.$eval('#search', input => {
			const search = input as HTMLInputElement;
			search.value = '';
			search.dispatchEvent(new Event('input', { bubbles: true }));
		});
		await waitForColumn(page, 1, '#search', '2,3');
	});

	await step('an item is added by its name', async () => {
		const options = await page.$$eval('.add datalist option', list =>
			list.map(option => option.value),
		);
		assert(options.includes('Antidote'), 'no suggestions');
		await page.type('.add input[type=text]', 'antidote');
		await page.click('.add button[type=submit]');
		await waitForColumn(page, 0, '.add', 'Potion,Hi-Potion,Antidote');
		const ids = await column(page, 1);
		assert(ids === '2,3,4', `ids: ${ids}`);
	});

	await step('an item in the list is not added twice', async () => {
		await page.type('.add input[type=text]', 'potion');
		await page.waitForSelector('.add .field-error');
		const error = await text(page, '.add .field-error');
		assert(error.includes('already'), `error: ${error}`);
		await page.click('.add button[type=button]');
	});

	await step('key items have names', async () => {
		await page.click('section .tabs a:last-child');
		await waitForColumn(page, 0, '.add', 'Canoe');
	});

	await step('another game changes the names', async () => {
		await page.select('.game select', 'I');
		await waitForColumn(page, 0, '.add', 'Unknown');
		await page.select('.game select', 'III');
		await waitForColumn(page, 0, '.add', 'Canoe');
	});

	await step('a PC bestiary opens with the last game', async () => {
		await openSave(page, url, join(dir, 'bestiary'), '#/bestiary');
		const summary = await text(page, 'nav + section p');
		assert(summary.startsWith('3 monsters'), `summary: ${summary}`);
		assert((await page.$$('tbody tr')).length === 3, 'monsters');
		const chosen = await page.$eval('.game select', select => select.value);
		assert(chosen === 'III', `game: ${chosen}`);
	});

	await step('without a game the names are unknown', async () => {
		await page.select('.game select', '');
		await waitForColumn(page, 0, '.game p', 'Unknown,Unknown,Unknown');
	});

	await step('the chosen game names the monsters', async () => {
		await page.select('.game select', 'I');
		await waitForColumn(
			page,
			0,
			'.game select',
			'Goblin,Goblin Guard,Wolf',
		);
		assert((await page.$('.game p')) === null, 'the hint stays');
		await page.type('#search', 'wolf');
		await waitForColumn(page, 1, '#search', '3');
	});

	await step('a file that is not a save is rejected', async () => {
		await openSave(page, url, join(dir, 'garbage'), '#/');
		await page.waitForSelector('[role=alert]');
		const message = await text(page, '[role=alert]');
		assert(message.includes('is not a'), `alert: ${message}`);
	});
} finally {
	await browser.close();
	await server.close();
	await rm(dir, { recursive: true, force: true });
}

process.exitCode = failures.length > 0 ? 1 : 0;
