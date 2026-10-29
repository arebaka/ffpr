# Security Policy

## Supported versions

Fixes are released for the latest version only.

| Version | Supported |
| ------- | --------- |
| 0.6.x   | yes       |
| < 0.6   | no        |

## Reporting a vulnerability

Do not report vulnerabilities in public issues.
Send them through
[private vulnerability reporting](https://github.com/arebaka/ffpr/security/advisories/new)
on GitHub or write [@arelive](https://t.me/arelive) on Telegram.

Describe the problem, the affected version and how to reproduce it.
If the problem shows up with a particular save file, attach it.

## Scope

ffpr reads save files that may come from untrusted sources.
A crafted save that makes `load` or `unpack` hang, run out of memory
or change anything outside the returned data is a vulnerability.

The key and IV for encryption are derived from constants built into the game.
They are public, so finding them in the code is not a vulnerability.
