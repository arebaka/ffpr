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

- `bun run check` type-checks, lints, checks formatting and runs the tests.
- `bun run lint` runs oxlint, `bun run lint:fix` fixes what it can.
- `bun run format` checks formatting with oxfmt, `bun run format:write` formats the files.
- `bun run test` runs the tests.
- `bun run build` compiles `src` into `dist`.
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
Exported functions and types need JSDoc: JSR builds the documentation from it.

## Pull requests

- One pull request per change.
- A bug fix or a new feature comes with a test.
- `bun run check` passes.
- Commit messages are short and lowercase, with a type where it fits:
  `fix: keep pc padding`, `docs: describe bestiary`.

Contributions are accepted under the [MIT License](LICENSE).
