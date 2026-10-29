# Contributing

Bug reports, fixes and descriptions of new save data are welcome.
By taking part in the project you agree to follow the
[Code of Conduct](CODE-OF-CONDUCT.md).

## Setup

The project uses [Bun](https://bun.sh/) for dependencies, scripts and tests.

```bash
git clone https://github.com/arebaka/ffpr.git
cd ffpr
bun install
```

[Deno](https://deno.com/) is needed only to check the JSR package.

## Scripts

- `bun run check` type-checks and tests the library,
  lints and checks formatting of the whole repository.
- `bun run lint` runs oxlint, `bun run lint:fix` fixes what it can.
- `bun run format` checks formatting with oxfmt, `bun run format:write` formats the files.
- `bun run test` runs the tests of the library.
- `bun run build` compiles `src` into `dist`.
- `bun run www:dev` starts the editor, `bun run www:build` builds it into `www/dist`.
- `bun run www:check` checks the editor, the test in a headless Chrome included.
  Publishing runs it together with `bun run check`.
- `deno task jsr:dry-run` checks the package for JSR without publishing it.
- `deno doc --lint src/index.ts` checks that exported symbols have JSDoc.

## Tests

Tests are in `tests` and use `bun:test`.

To test on real saves, put them into
`tests/fixtures/switch`, `tests/fixtures/pc` or `tests/fixtures/playstation`.
Each save is decoded, encoded back and compared with the JSON the game wrote,
nested JSON strings included.
Without saves these tests are skipped.

## Save format

- Key names contain typos made by the game developers:
  `owendGil`, `numberOfButtles` and others.
  Keep them as they are, the game does not recognize renamed keys.
- The save structure is described in `src/types.ts`.
  A new field gets the exact key and value type that the game writes.
- Nested objects are stored as JSON strings.
  Objects that the game keeps as objects are listed
  in `doNotSerializeKeys` in `src/serialization.ts`.

## Code style

Formatting and lint rules are in
`.oxfmtrc.json`, `.oxlintrc.json` and `.editorconfig`,
`deno fmt` gives the same result as oxfmt.
They disagree only on an arrow function with one untyped parameter,
in `src` give such a parameter a type.
Exported functions and types need JSDoc: JSR builds the documentation from it.

## Web editor

The editor in `www` is a workspace of its own.
It is not published, npm and JSR get only the library.
It imports `ffpr` from `src` through the `paths` of `www/tsconfig.json`,
so the library does not have to be built first.
In the browser `node:buffer` is replaced with the `buffer` package,
`node:crypto` with `www/src/shims/crypto.ts`,
`node:fs` and `node:path`, used only by `load` and `save`,
with `www/src/shims/unavailable.ts`, see `www/vite.config.ts`.
Its unit tests in `www/tests` use vitest,
`www/tests/ui.ts` drives the built site in Chrome, see `www/README.md`.

## Pull requests

- One pull request per change.
- A bug fix or a new feature comes with a test.
- `bun run check` passes.
- Commit messages are short and lowercase, with a type where it fits:
  `fix: keep pc padding`, `docs: describe bestiary`.

Contributions are accepted under the [MIT License](LICENSE).
