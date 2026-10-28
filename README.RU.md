# ffpr

> Библиотека для Node.js, которая раскодирует и кодирует сохранения
> [Final Fantasy Pixel Remaster](https://finalfantasypixelremaster.square-enix-games.com/)
> с Nintendo Switch, PC и PlayStation.

![GitHub License](https://img.shields.io/github/license/arebaka/ffpr?style=flat)
![GitHub Created At](https://img.shields.io/github/created-at/arebaka/ffpr?style=flat)
[![Lines of code](https://img.shields.io/endpoint?url=https%3A%2F%2Fghloc.dev%2Fapi%2Farebaka%2Fffpr%2Fbadge&style=flat&label=lines%20of%20code&color=blue)](https://ghloc.dev/arebaka/ffpr)
![NPM Version](https://img.shields.io/npm/v/ffpr?style=flat)
![NPM Downloads](https://img.shields.io/npm/d18m/ffpr?style=flat)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/ffpr?style=flat)

- Все шесть игр: Final Fantasy I–VI.
- Сохранения с Nintendo Switch, PC и PlayStation через одно API.
- Слоты сохранений, бестиарий и настройки игры.
- Вложенные JSON-строки разворачиваются в обычное дерево объектов и собираются обратно.
- Типы TypeScript для структуры сохранения: персонажи, профессии, способности, предметы, отряд, карта, сюжетные флаги и не только.
- Работает с файлами или с буферами.
- Две зависимости в рантайме, без нативных модулей.

Сохранения можно редактировать и в браузере, в редакторе на этой библиотеке.
Файлы раскодируются локально и никуда не загружаются.

## Использование

```javascript
import { load, save } from 'ffpr';

const data = await load('path/to/save', 'pc');
data.userData.owendGil = 9999999;
await save('path/to/save', data, 'pc');
```

Все функции асинхронные. `type` - платформа:
`'switch'`, `'pc'` или `'playstation'`,
по умолчанию `'switch'`.

- `load(filename, type?)` читает и раскодирует файл сохранения.
- `save(filename, data, type?)` кодирует данные и записывает их в файл.
- `unpack(buffer, type?)` раскодирует содержимое файла из `Buffer` или `Uint8Array`.
- `pack(data, type?)` кодирует данные в `Buffer`.

## Установка

```bash
npm i ffpr
```

или

```bash
pnpm add ffpr
```

или

```bash
yarn add ffpr
```

или

```bash
bun add ffpr
```

## Данные

Сохранение - это JSON, в котором вложенные объекты хранятся как JSON-строки, на несколько уровней в глубину.
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

```typescript
import { load } from 'ffpr';
import type { Master } from 'ffpr';

const data = (await load('path/to/save', 'pc')) as Master;
```

## Форматы

- Switch: JSON, сжатый raw deflate и зашифрованный Rijndael-256-CBC.
- PC: то же самое, закодированное в base64.
- PlayStation: обычный JSON.

## Поддержка

Если что-то не работает или просто хочешь поболтать с создателем или его мамой,
пиши [@arelive](https://t.me/arelive).
Также принимаются пинки от добровольных проджект-менеджеров.

[https://github.com/arebaka/ffpr/issues](https://github.com/arebaka/ffpr/issues)

[![Patreon](https://img.shields.io/badge/Patreon-arelive-%23ff5900?style=flat&logo=patreon&labelColor=%23000000)](https://www.patreon.com/cw/arelive)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-arelive-%23ff6433?style=flat&logo=kofi&labelColor=%23000000)](https://ko-fi.com/arelive)
[![Telegram](https://img.shields.io/badge/Telegram-ciirno-%23ffffff?style=flat&logo=telegram&logoColor=%23ffffff&labelColor=%2326a5e4)](https://t.me/govnodev)
