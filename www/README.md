# ffpr

> Browser editor for
> [Final Fantasy Pixel Remaster](https://finalfantasypixelremaster.square-enix-games.com/)
> saves from Nintendo Switch, PC and PlayStation,
> built on [ffpr](https://github.com/arebaka/ffpr).

Saves are decoded in the browser and are not uploaded anywhere.

- Save slots: gil, play time, statistics, party, characters, items,
  key items and Game Booster settings.
- Bestiary: defeated monsters.
- Any save as JSON, settings included.
- A save can be downloaded for another platform.

Built with Vite, SolidJS, NES.css, Sass, TanStack Router, Form and Table, and Zod.

## Development

The editor is a workspace of the ffpr repository, run from the root:

```bash
bun install
bun run www:dev
```

In `www` itself:

- `bun run dev` starts the editor, `bun run start` builds and serves it.
- `bun run build` builds the site into `dist`.
- `bun run test` runs the unit tests with vitest and jsdom,
  `bun run test:watch` reruns them on changes.
- `bun run test:ui` opens the built site in a headless Chrome,
  edits a save and reads the download back with the library.
  Chrome is looked up in `PATH`, `CHROME_PATH` sets another one.
- `bun run check` runs all of it, together with the type check, the linter
  and the formatter.

`bun run www:check` in the root runs the same checks,
publishing the library runs them too.

The library is imported from `../src` through the `paths` of `tsconfig.json`.
It is written for Node.js, `vite.config.ts` replaces its built-in modules:
`node:buffer` with the `buffer` package, `node:crypto` with
`src/shims/crypto.ts`, `node:fs` and `node:path`,
used only by `load` and `save`, with `src/shims/unavailable.ts`.

## Deployment

`.github/workflows/pages.yaml` of the repository builds the site,
adds the API reference under `docs/`
and publishes it to GitHub Pages when the editor or the library changes.
Pages have to be enabled in the repository settings
with GitHub Actions as the source.
