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

	await step('items and key items are listed', async () => {
		await page.click('nav a[href$="/slot/items"]');
		await page.waitForSelector('tbody tr');
		assert((await page.$$('tbody tr')).length === 2, 'items');
		await page.click('section .tabs a:last-child');
		await page.waitForFunction(
			() => document.querySelectorAll('tbody tr').length === 1,
		);
	});

	await step('a PC bestiary opens', async () => {
		await openSave(page, url, join(dir, 'bestiary'), '#/bestiary');
		const summary = await text(page, 'nav + section p');
		assert(summary.startsWith('3 monsters'), `summary: ${summary}`);
		assert((await page.$$('tbody tr')).length === 3, 'monsters');
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
