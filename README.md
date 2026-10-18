# ffpr

> Node.js library for decoding and encoding Final Fantasy Pixel Remaster save files from Nintendo Switch, PC and PlayStation.

## Installation

```sh
npm i ffpr
```

## Usage

```ts
import { load, save } from 'ffpr';

const data = await load('path/to/save', 'pc');
data.userData.owendGil = 9999999;
await save('path/to/save', data, 'pc');
```

## API

All functions are async. `type` is the platform:
`'switch'`, `'pc'` or `'playstation'`,
`'switch'` by default.

- `load(filename, type?)` reads and decodes a save file.
- `save(filename, data, type?)` encodes data and writes it to a file.
- `unpack(buffer, type?)` decodes file contents from a `Buffer`.
- `pack(data, type?)` encodes data into a `Buffer`.

## Data

A save file is JSON in which nested objects are stored as JSON strings, several levels deep.
`load` and `unpack` parse them all into a single object tree,
`save` and `pack` encode them back.
`pictureData` is decoded from base64 into a `Buffer`.
Key names are the game's own, typos included (`owendGil` for example).

The structure is described by TypeScript types:
`Master` (save slot), `Bestiary` and `Config` (settings).
`load` returns their union, so cast the result:

```ts
import { load } from 'ffpr';
import type { Master } from 'ffpr';

const data = await load('path/to/save', 'pc') as Master;
```

## Formats

- Switch: JSON compressed with raw deflate and encrypted with Rijndael-256-CBC.
- PC: the same, encoded in base64.
- PlayStation: plain JSON.
