# Changelog

Notable changes of each release.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0]

### Added

- `unpack` accepts any `Uint8Array`, not only a `Buffer`.

### Changed

- Deflate is done by [fflate](https://github.com/101arrowz/fflate)
  instead of `node:zlib`, which is not available in browsers.
  The package has two runtime dependencies now.

## [0.4.2] - 2026-10-27

### Added

- Changelog, contributing guide, code of conduct, security policy, support page,
  issue and pull request templates.
- Releases are published to npm and JSR from GitHub Actions with provenance.

## [0.4.1] - 2026-10-27

### Added

- Deno support and the JSR package
  [`@arelive/ffpr`](https://jsr.io/@arelive/ffpr).
- JSDoc for all exported functions and types.
- `master.Ability` type.

### Fixed

- Saves compressed in the zlib format failed to load:
  the fallback from raw deflate had not worked since 0.3.1.
- Test files are no longer published to npm.

## [0.4.0] - 2026-10-25

### Added

- Types are exported from the package root:
  `import type { Master } from 'ffpr'`.
- README in English and Russian.

### Changed

- **Breaking:** the package is ESM-only.
- **Breaking:** platform names are lowercase:
  `'switch'`, `'pc'`, `'playstation'`.
- **Breaking:** the `save` namespace is removed, its types are top-level:
  `save.Master` is now `Master`, `save.master.User` is `master.User`.
- **Breaking:** the default export is removed, use named imports.

### Fixed

- PC saves are written with a UTF-8 BOM, like the files the game writes.
- Strings that are valid JSON, such as `"1"` or `"true"`,
  were turned into numbers and booleans on load.
  Now only nested objects are parsed.
- Entries of `mapData.otherPartyDataList` were packed into JSON strings,
  while the game stores them as objects.

## [0.3.1] - 2025-05-01

### Fixed

- `load` printed the file name and platform to the console on errors.
- Type of `abilityDictionary` values.

## [0.3.0] - 2025-04-27

### Added

- PC and PlayStation saves: all functions take an optional platform,
  `'Switch'`, `'PC'` or `'PlayStation'`, `'Switch'` by default.
- `pictureData` can also be a `Uint8Array`.
  Values other than a `Buffer`, a `Uint8Array` or a base64 string
  throw an error.
- Default export with all functions.

### Changed

- **Breaking:** `save.Stats` is renamed to `save.Bestiary`.

## [0.2.0] - 2025-04-27

### Added

- TypeScript types for the save structure.
- `pictureData` is decoded from base64 into a `Buffer`.

### Changed

- Rewritten in TypeScript, the package ships compiled code from `dist`.

## [0.1.0] - 2025-04-25

First release: `load`, `save`, `unpack` and `pack` for Nintendo Switch saves.

[0.5.0]: https://github.com/arebaka/ffpr/compare/v0.4.2...HEAD
[0.4.2]: https://github.com/arebaka/ffpr/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/arebaka/ffpr/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/arebaka/ffpr/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/arebaka/ffpr/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/arebaka/ffpr/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/arebaka/ffpr/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/arebaka/ffpr/releases/tag/v0.1.0
