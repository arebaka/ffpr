# ffpr

> Browser editor for
> [Final Fantasy Pixel Remaster](https://finalfantasypixelremaster.square-enix-games.com/)
> saves from Nintendo Switch, PC and PlayStation,
> built on [ffpr](https://github.com/arebaka/ffpr).

Saves are decoded in the browser and are not uploaded anywhere.

- Save slots: gil, play time, statistics, party, characters, items,
  key items and Game Booster settings.
- Bestiary: defeated monsters.
- Names of items and monsters in English for all six games.
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

## Names

`res/names/<game>.yaml` in the root of the repository give English names
to the IDs of a save: `items`, `keyItems`, `monsters` and `empty`,
the markers of empty equipment slots that the game keeps among the items.
Their IDs are different in each game, so a slot is recognized by them.
A bestiary is recognized if it lists all monsters of a game or fits only one,
otherwise the last game is kept if it fits.
If nothing settles the game, the editor asks for it and shows `Unknown`.
[vite-plugin-yaml](https://github.com/Modyfi/vite-plugin-yaml) turns the files
into modules at build time, the site does not parse YAML.

Items come from
[FFPRSaveEditorGUI](https://github.com/rickparrish/FFPRSaveEditorGUI),
monsters from
[final-fantasy-pr-save-editor](https://github.com/KiameV/final-fantasy-pr-save-editor)
(MIT). The tables were checked against:

- the tables of the game in
  [FF1-PR-Rando](https://github.com/gameboy9/FF1-PR-Rando) and
  [FF4FalconDive](https://github.com/gameboy9/FF4FalconDive) (MIT),
- [FF5Rando](https://github.com/sorlok/FF5Rando) (MIT) and
  [Job-Fair](https://github.com/IXTLIA/Job-Fair) (MIT) for Final Fantasy V,
- [ff3-pixel-remaster-onion-ct](https://github.com/shawnjohnjr/ff3-pixel-remaster-onion-ct)
  for Final Fantasy III,
- [AnotherFFVIPRSaveEditor](https://github.com/GiulioSamp/AnotherFFVIPRSaveEditor)
  (MIT) for Final Fantasy VI,
- real saves: `tests/names.test.ts` fails if an ID in the fixtures of the
  library has no name.

Final Fantasy II has no independent source: only a part of its items is in
final-fantasy-pr-save-editor, the rest fits the order of items in a real save.
The names belong to Square Enix.

The game keeps the originals in `Assets/GameAssets/Serial/Data`:
`Master/content.csv` links item IDs to message keys, `Master/monster.csv`
does the same for monsters, and `Message/system_<language>.txt` has the texts.

## Deployment

`.github/workflows/pages.yaml` of the repository builds the site,
adds the API reference under `docs/`
and publishes it to GitHub Pages when the editor or the library changes.
Pages have to be enabled in the repository settings
with GitHub Actions as the source.
