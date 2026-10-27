# ffpr

> Node.js library for decoding and encoding
> [Final Fantasy Pixel Remaster](https://finalfantasypixelremaster.square-enix-games.com/)
> save files from Nintendo Switch, PC and PlayStation.

![GitHub License](https://img.shields.io/github/license/arebaka/ffpr?style=flat)
![GitHub Created At](https://img.shields.io/github/created-at/arebaka/ffpr?style=flat)
[![Lines of code](https://img.shields.io/endpoint?url=https%3A%2F%2Fghloc.dev%2Fapi%2Farebaka%2Fffpr%2Fbadge&style=flat&label=lines%20of%20code&color=blue)](https://ghloc.dev/arebaka/ffpr)
![NPM Version](https://img.shields.io/npm/v/ffpr?style=flat)
![NPM Downloads](https://img.shields.io/npm/d18m/ffpr?style=flat)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/ffpr?style=flat)

- All six games: Final Fantasy I–VI.
- Saves from Nintendo Switch, PC and PlayStation through one API.
- Save slots, bestiary and game settings.
- Nested JSON strings are unpacked into a plain object tree and packed back.
- TypeScript types for the save structure: characters, jobs, abilities, items, party, map, story flags and more.
- Works with files or with buffers.
- One runtime dependency, no native addons.

## Usage

```javascript
import { load, save } from 'ffpr';

const data = await load('path/to/save', 'pc');
data.userData.owendGil = 9999999;
await save('path/to/save', data, 'pc');
```

All functions are async. `type` is the platform:
`'switch'`, `'pc'` or `'playstation'`,
`'switch'` by default.

- `load(filename, type?)` reads and decodes a save file.
- `save(filename, data, type?)` encodes data and writes it to a file.
- `unpack(buffer, type?)` decodes file contents from a `Buffer`.
- `pack(data, type?)` encodes data into a `Buffer`.

## Installation

```bash
npm i ffpr
```

or

```bash
pnpm add ffpr
```

or

```bash
yarn add ffpr
```

or

```bash
bun add ffpr
```

## Data

A save file is JSON in which nested objects are stored as JSON strings, several levels deep.
`load` and `unpack` parse them all into a single object tree,
`save` and `pack` encode them back.
`pictureData` is decoded from base64 into a `Buffer`.

Key names are exactly as the game writes them, including the developers' typos:
`owendGil`, `importantOwendItemList`, `owendCrystalFlags`, `ownedKeyWaordList`,
`numberOfButtles`, `resolutionHight` and others.
These are not mistakes in the library, do not "fix" them:
the game will not recognize renamed keys.

The structure is described by TypeScript types:
`Master` (save slot), `Bestiary` and `Config` (settings).
`load` returns their union, so cast the result:

```typescript
import { load } from 'ffpr';
import type { Master } from 'ffpr';

const data = (await load('path/to/save', 'pc')) as Master;
```

## Formats

- Switch: JSON compressed with raw deflate and encrypted with Rijndael-256-CBC.
- PC: the same, encoded in base64.
- PlayStation: plain JSON.

## Support

If something doesnt work, or you just wanna talk to the creator or his mom,
write [@arelive](https://t.me/arelive).
There also accepted kicks from volunteer project managers.

[https://github.com/arebaka/ffpr/issues](https://github.com/arebaka/ffpr/issues)

[![Patreon](https://img.shields.io/badge/Patreon-arelive-%23ff5900?style=flat&logo=patreon&labelColor=%23000000)](https://www.patreon.com/cw/arelive)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-arelive-%23ff6433?style=flat&logo=kofi&labelColor=%23000000)](https://ko-fi.com/arelive)
[![Telegram](https://img.shields.io/badge/Telegram-ciirno-%23ffffff?style=flat&logo=telegram&logoColor=%23ffffff&labelColor=%2326a5e4)](https://t.me/govnodev)
