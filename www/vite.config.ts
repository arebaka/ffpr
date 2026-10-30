/// <reference types="vitest/config" />
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import yaml from '@modyfi/vite-plugin-yaml';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const require = createRequire(import.meta.url);
const shim = (name: string) =>
	fileURLToPath(new URL(`src/shims/${name}.ts`, import.meta.url));

export default defineConfig({
	base: './',
	plugins: [solid(), yaml()],
	resolve: {
		tsconfigPaths: true,
		alias: {
			'node:buffer': require.resolve('buffer/'),
			'node:crypto': shim('crypto'),
			'node:fs': shim('unavailable'),
			'node:path': shim('unavailable'),
		},
	},
	devtools: false,
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.{ts,tsx}'],
	},
});
