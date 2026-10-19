# ffpr

> Библиотека для Node.js, которая раскодирует и кодирует сохранения Final Fantasy Pixel Remaster с Nintendo Switch, PC и PlayStation.

## Установка

```sh
npm i ffpr
```

## Использование

```ts
import { load, save } from 'ffpr';

const data = await load('path/to/save', 'pc');
data.userData.owendGil = 9999999;
await save('path/to/save', data, 'pc');
```

## API

Все функции асинхронные. `type` — платформа:
`'switch'`, `'pc'` или `'playstation'`,
по умолчанию `'switch'`.

- `load(filename, type?)` читает и раскодирует файл сохранения.
- `save(filename, data, type?)` кодирует данные и записывает их в файл.
- `unpack(buffer, type?)` раскодирует содержимое файла из `Buffer`.
- `pack(data, type?)` кодирует данные в `Buffer`.

## Данные

Сохранение — это JSON, в котором вложенные объекты хранятся как JSON-строки, на несколько уровней в глубину.
`load` и `unpack` разбирают их все в единое дерево объектов,
`save` и `pack` кодируют обратно.
`pictureData` раскодируется из base64 в `Buffer`.

Ключи названы ровно так, как их записывает игра, вместе с опечатками разработчиков:
`owendGil`, `importantOwendItemList`, `owendCrystalFlags`, `ownedKeyWaordList`,
`numberOfButtles`, `resolutionHight` и другие.
Это не ошибки библиотеки, исправлять их не нужно:
переименованные ключи игра не распознает.

Структура описана типами TypeScript:
`Master` (слот сохранения), `Bestiary` (бестиарий) и `Config` (настройки).
`load` возвращает их объединение, поэтому результат нужно привести к нужному типу:

```ts
import { load } from 'ffpr';
import type { Master } from 'ffpr';

const data = (await load('path/to/save', 'pc')) as Master;
```

## Форматы

- Switch: JSON, сжатый raw deflate и зашифрованный Rijndael-256-CBC.
- PC: то же самое, закодированное в base64.
- PlayStation: обычный JSON.
