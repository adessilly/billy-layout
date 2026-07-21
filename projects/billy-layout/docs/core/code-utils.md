# Code utils — code-format, VatUtils, IbanUtils, EmailUtils

> Category `core` · source `projects/billy-layout/src/lib/core/utils/{code-format,vat-utils,iban-utils,email-utils}.ts` · utility classes & functions (no Angular dependency)

## Purpose

Validation and formatting foundation for the "codes" typed and then displayed throughout Billy: VAT numbers, IBANs and email addresses. The contract is the same everywhere: a **canonical value** (compact, uppercase, no separators — the only form sent to the backend), a **segment rendering** (fragments flagged `muted` to gray out the country prefix and separators without each component redoing the splitting), and a **diagnostic** (`describe()` → `CodeInfo`) ready to display under the field. Consumers: the library's `code-field` components (`billy-input-vat`, `billy-input-iban`, `billy-input-email`, `billy-vat-display`, `billy-iban-display`, `billy-code-value`) and, on the app side, `bce-search`, `client-form`, `client-fiche`, `compte-document`.

```ts
import {
  CodeInfo, CodeSegment, CodeStatus,
  VatUtils, IbanUtils, EmailUtils,
  keepAlnum, groupBySizes, groupByChunks, segmentsToText, isAlnum, countAlnum,
} from 'billy-layout';
```

---

## code-format — shared foundation

### Exported types

```ts
/** Rendering fragment. `muted`: country prefix or separator → displayed in gray. */
interface CodeSegment { text: string; muted: boolean; }

type CodeStatus = 'empty' | 'partial' | 'invalid' | 'unverified' | 'valid';

/** Full diagnostic of a code, ready to be displayed under the field. */
interface CodeInfo {
  status: CodeStatus;
  country: string | null;       // detected ISO code ("BE"), or null
  countryLabel: string | null;  // country name (English by default, localized via `locale`), or null
  message: string;              // short message under the field
  progress: number;             // input progress 0 → 1 (progress ring)
}
```

`CodeStatus` semantics:

| Status | Meaning |
|---|---|
| `empty` | nothing typed |
| `partial` | input in progress, too short to be judged |
| `invalid` | structure or check digit fails |
| `unverified` | structure conforms but no known check digit for this country — we don't invent an error |
| `valid` | check digit verified |

### Functions

| Function | Signature | Semantics |
|---|---|---|
| `isAlnum` | `(char: string) => boolean` | True if the character is `[A-Z0-9]` (case-insensitive). |
| `keepAlnum` | `(raw, maxLength) => string` | Canonical form: uppercase, only `[A-Z0-9]`, truncated at `maxLength`. Dots, spaces, dashes, accents, symbols: ignored. |
| `countAlnum` | `(text: string) => number` | Number of alphanumeric characters in a text (useful for mapping a cursor position between raw value and mask). |
| `groupBySizes` | `(body, sizes: number[], separator) => CodeSegment[]` | Splits by variable group sizes (Belgian VAT: `[4, 3, 3]`). Tolerant: a value that is too short is split as far as it goes (format-as-you-type), any surplus is appended at the end rather than truncated. `muted` separators. |
| `groupByChunks` | `(value, size, separator, mutedHead = 0) => CodeSegment[]` | Splits into fixed-size groups (IBAN: by 4) while graying out the first `mutedHead` characters (country code). The separator grid follows the full code: "BE68 5390 0754 7034". |
| `segmentsToText` | `(segments) => string` | Flattens the segments to text — this is the input field's mask. |

Adjacent segments with the same tint are merged (via the internal `push`): the resulting DOM is minimal.

---

## VatUtils — intra-community VAT numbers

Canonical `BE0690614660` · display `BE 0690.614.660` (prefix and dots grayed out). Abstract class, static methods only. **Only Belgium has an implemented check digit** (modulo 97); for 8 countries (`BE FR LU NL DE ES IT PT`) the body length is known and verified, and ~30 countries have a label. A conforming foreign number is `unverified`, never over-optimistically "valid".

| Static method | Returns | Semantics |
|---|---|---|
| `sanitize(raw)` | `string` | Canonical: `keepAlnum` capped at 14 characters (2 letters + 12, EU max). |
| `country(raw)` | `string \| null` | Country code, or `null` until the 2 letters are present. |
| `countryLabel(raw, locale?)` | `string \| null` | Country name in English by default, or `null` if not listed. The optional `locale` parameter uses `Intl.DisplayNames` for localized names, falling back to the built-in English map for `XI`/`EL` or unknown locales. |
| `normalize(raw, defaultCountry = 'BE')` | `string` | Completion at the end of input: digits only → `BE` prefix added (and leading zero restored: 9-10 digits → `BE` + pad to 10); legacy format `BE` + 9 digits → `BE0…`. |
| `format(raw)` | `CodeSegment[]` | Display segments: country prefix + `muted` space, body grouped by country rule (BE `4.3.3` dots, FR `2 3 3 3` spaces, …). Without a country, digits are treated as a future Belgian number. |
| `formatText(raw)` | `string` | Flattened `format` — the field's mask. |
| `checksum(raw)` | `boolean \| null` | Check digit. `null` = country without a known check (non-BE) → no verdict. Belgium: `97 − (first 8 digits % 97) === last 2`. |
| `isStructureValid(raw)` | `boolean` | Plausible international structure: `^[A-Z]{2}[A-Z0-9]{8,12}$` (without judging the check digit). |
| `digits(raw)` | `string` | Digits only — the format expected by the BCE/KBO search (used by `bce-search`, `client-fiche`, `compte-document`). |
| `describe(raw, locale?)` | `CodeInfo` | Full diagnostic: country, contextual message ("Belgian number: 10 digits expected", "France — format conforms"…), progress toward the expected length (12 by default for a country without a rule). Optional `locale: 'en' \| 'fr'` (default `'en'`) localizes the messages and the country label. |

`describe` decision grid: complete BE → `valid`/`invalid` depending on the check digit; country with a rule → exact length required (`partial` below, `invalid` above, `unverified` exactly at it); country without a rule → `unverified` as soon as the international structure passes.

Real usage (`src/app/shared/components/bce-search/bce-search.component.ts`):

```ts
import { VatUtils } from 'billy-layout';
readonly canSearch = computed(() =>
  !!this.bce() && VatUtils.checksum(this.tva()) === true);
```

---

## IbanUtils — IBAN bank accounts

Canonical `BE68539007547034` · display `BE 68 5390 0754 7034` (country code and spaces grayed out). Unlike VAT, the **ISO 7064 check digit (modulo 97) is universal**: it can be verified for every country, including those whose length is unknown. 32 countries have their total length on record (BE: 16, FR: 27, LU: 20, …).

| Static method | Returns | Semantics |
|---|---|---|
| `sanitize(raw)` | `string` | Canonical: `keepAlnum` capped at 34 (ISO 13616 max). |
| `normalize(raw)` | `string` | Alias of `sanitize` — nothing to complete on an IBAN. |
| `country(raw)` / `countryLabel(raw, locale?)` | `string \| null` | Same as VatUtils. |
| `format(raw)` | `CodeSegment[]` | `groupByChunks(value, 4, ' ', 2)` — groups of 4, the 2 country letters grayed out. |
| `formatText(raw)` | `string` | The field's mask. |
| `isValid(raw)` | `boolean` | Structure `^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$` + country length if known + `mod97 === 1`. The modulo is computed digit by digit (letters → 10..35, first 4 characters moved to the end): an IBAN exceeds the precision of a `number`. |
| `describe(raw, locale?)` | `CodeInfo` | `partial` until the country length (or the plausible minimum of 15) is reached, `invalid` if too long or check digit wrong ("IBAN check digits are incorrect"), `valid` otherwise. Progress targets the country length. Optional `locale: 'en' \| 'fr'` (default `'en'`) localizes the messages. |

In practice there is no `unverified` status for IBAN: since the check is universal, a complete IBAN is either `valid` or `invalid`.

---

## EmailUtils — email addresses

No mask (an address doesn't split into groups), but the same contract: canonical value, `describe()`, and one specific added value — **domain typo detection** ("gmial.com" is structurally valid, but it's almost certainly a mistake that would send an invoice into the void). **Case is never touched**: the local part is not formally case-insensitive (RFC 5321).

| Static method | Returns | Semantics |
|---|---|---|
| `isAllowed(char)` | `boolean` | Allowed character: RFC 5322 `atext` + `@` + dot. |
| `sanitize(raw)` | `string` | Canonical: forbidden characters (including spaces) removed, capped at 254 (RFC 5321). |
| `isValid(raw)` | `boolean` | Structure: local part with dotted segments + domain with labels + alphabetic TLD ≥ 2. |
| `domain(raw)` | `string \| null` | Whatever follows the **last** `@`, or `null`. |
| `suggest(raw)` | `string \| null` | Corrected address if the domain is at a Damerau-Levenshtein distance ≤ 1 (≤ 2 if the domain is > 10 characters) from one of ~25 common Belgian/French domains (`gmail.com`, `skynet.be`, `telenet.be`, `proximus.be`, …) without being one. `null` if nothing to flag or too much doubt. |
| `describe(raw, locale?)` | `CodeInfo` | `country`/`countryLabel` always `null`. Milestone-based progress: local part 0.35 → `@` 0.7 → dotted domain 1. Targeted messages: missing `@`, missing name before `@`, double `@`, incomplete domain; a suggestion yields `unverified` with "Did you mean john@gmail.com?"; otherwise `valid`. Optional `locale: 'en' \| 'fr'` (default `'en'`) localizes the messages. |

The internal distance is **Damerau-Levenshtein** (insertion, deletion, substitution **and transposition**): "gmial" for "gmail" — two swapped letters, the most common typo — counts as 1, where plain Levenshtein would count it as 2 and let it through. Short-circuits when the length gap exceeds 2.

## Usage example

```ts
import { VatUtils } from 'billy-layout';

// Typical pipeline of a VAT field (see billy-input-vat):
const canon = VatUtils.sanitize(userInput);        // "be 0690.614.660" → "BE0690614660"
const mask = VatUtils.formatText(canon);           // "BE 0690.614.660" (shown in the input)
const info = VatUtils.describe(canon);             // { status: 'valid', message: 'Valid number', … }
const final = VatUtils.normalize('0690614660');    // "BE0690614660" on blur
```

## Styles & theming

Pure TypeScript modules, no styling. The visual rendering of `muted` segments and `CodeInfo` statuses is handled by the `billy-code-field` SCSS shell (see `docs/styles/styles.md`) and the `code-field` components.

## Pitfalls & notes

- No Angular dependency: usable in a `computed()`, a form validator or server-side code.
- `describe()` takes an optional `locale?: 'en' | 'fr'` (default `'en'`); the library's code fields pass `BillyI18nService.locale()` automatically, so field messages follow the configured language. Built-in strings are localizable — see [i18n](i18n.md).
- `VatUtils` and friends are **abstract classes with static methods** — do not instantiate.
- All entry points accept `string | null | undefined`: no upstream guard ever needed.
- `normalize` (VAT) is designed for **blur / end of input**, not for typing: applied on every keystroke, it would prefix `BE` too early.
- The "we don't invent an error" philosophy is structural: an unknown country never breaks rendering nor flips the status to `invalid` — it caps at `unverified`.
- `EmailUtils.suggest` never fixes anything on its own: it **proposes**; it's up to the component to display the suggestion and let the user accept it.
- The "known structure" validations have deliberate limits: non-Belgian VAT is only length-checked; email is not validated in the full RFC sense (no quoted-string, no IDN).
