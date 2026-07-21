# "code-field" family — CodeFieldBase, InputVatComponent, InputIbanComponent, InputEmailComponent, VatDisplayComponent, IbanDisplayComponent, CodeGlyphComponent, CodeStatusComponent, CodeValueComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/code-field/` · standalone components (the input fields are ControlValueAccessors)

Component family for entering and reviewing normalized identifiers: intra-community VAT number, IBAN, email address. All share the same contract: **the model only sees the canonical value** ("BE0690614660"), **the DOM only shows the formatted value** ("BE 0690.614.660"). Export entry point: `lib/inputs/code-field/index.ts` (re-exported by `public-api.ts`).

## Architecture

```
core/utils/                          inputs/code-field/
├── code-format.ts   ← types & splitting   ├── code-field.base.ts   (CodeFieldBase, abstract CVA foundation)
├── vat-utils.ts     ← VAT rules           ├── input-vat/           (billy-input-vat      = base + VatUtils)
├── iban-utils.ts    ← IBAN rules          ├── input-iban/          (billy-input-iban     = base + IbanUtils)
└── email-utils.ts   ← email rules         ├── input-email/         (billy-input-email    = base + EmailUtils)
                                           ├── vat-display/         (billy-vat-display    = VatUtils → billy-code-value)
                                           ├── iban-display/        (billy-iban-display   = IbanUtils → billy-code-value)
                                           ├── code-value/          (read-only segment rendering + copy)
                                           ├── code-glyph/          (SVG symbol vat/iban/email)
                                           └── code-status/         (status badge + progress ring)
```

- **`code-format.ts`** (see [../core/code-utils.md](../core/code-utils.md)) defines the shared vocabulary: `CodeSegment` (`{ text, muted }` — separators and country prefixes are `muted`, hence grayed out), `CodeStatus` (`'empty' | 'partial' | 'invalid' | 'unverified' | 'valid'`), `CodeInfo` (status + country + message + 0→1 progress) and the splitters `groupBySizes` / `groupByChunks` / `keepAlnum` / `segmentsToText`.
- **`VatUtils` / `IbanUtils` / `EmailUtils`** carry all the domain knowledge (per-country rules, modulo 97 check digits, common email domains) under an identical API: `sanitize` (canonical form), `formatText`/`format` (mask / segments), `normalize` (blur-time touch-ups), `describe` (→ `CodeInfo`).
- **`CodeFieldBase`** (abstract directive) is the CVA foundation: it handles masking while typing, cursor repositioning, deletion across a separator, the `focused`/`touched` states and the cleanup of dirty values coming from the backend. Each concrete field only provides 3-4 methods (`sanitize`, `formatText`, `normalize`, possibly `isSignificant`) and an `info` computed.
- The read-only displays (`billy-vat-display`, `billy-iban-display`) merely wire the utils onto the pure presentation brick `billy-code-value`.

## CodeFieldBase (abstract foundation)

> Abstract `@Directive()`, `implements ControlValueAccessor` — never instantiated on its own.

### Principle

A masked field: on each keystroke, the input is cleaned (`sanitize` — disallowed characters never get in), reformatted (`formatText`) and the cursor is repositioned **by counting the significant characters** preceding it (not its raw position, which separators would shift). The DOM value is driven by hand (no `[value]` binding): rewriting the input on every keystroke would send the cursor to the end.

### Inputs shared by all fields

| Input | Type | Default | Description |
|---|---|---|---|
| `inputId` | `string` | `''` | `id` set on the inner `<input>` (for `<label for>`). Falls back to a generated `billy-code-N` uid. |
| `placeholder` | `string` | `''` | Placeholder (each field has its own default: "BE 0690.614.660", etc.). |
| `hint` | `string` | `''` | Text displayed under the field while nothing is typed (replaces the `empty` state message). |
| `forceDisabled` | `boolean` (`booleanAttribute`) | `false` | Static disabling, on top of the form's. **Deliberately not named `disabled`**: signal-forms reserves that name and would overwrite it. |

### Signals / derived API

`value` (canonical), `display` (formatted), `focused`, `touched`, `isDisabled`, `status` (`CodeStatus`), `progress` (0→1), `showError` (error **only after blur**: while typing, an incomplete number is not an error — the badge, however, tracks input live), `message` (the `hint` when empty, otherwise the diagnostic message).

### Subclass contract

| Abstract method | Role |
|---|---|
| `sanitize(raw)` | Canonical form: every disallowed character disappears. |
| `formatText(value)` | Mask: flat rendering of the canonical value. |
| `normalize(value)` | Blur-time touch-ups (country prefix, leading zero…). |
| `info` (computed) | Full `CodeInfo` diagnostic. |
| `isSignificant(char)` (overridable) | Significant/filler boundary for the cursor — alphanumeric by default. |

The concrete fields compute their `info` diagnostic by passing the active i18n locale to the utils (e.g. `VatUtils.describe(value, i18n.locale())`): field messages follow the configured language automatically. Built-in strings are localizable — see [i18n](../core/i18n.md).

### ControlValueAccessor

- **Model value**: canonical `string` (never any separators). A written `null`/`undefined` becomes `''`.
- **Dirty value from the backend**: cleaned for display then **sent back clean to the model** asynchronously (`queueMicrotask`) — writing while the form is writing would loop.
- On blur: `normalize` then re-`sanitize` (the added country prefix must not overflow the max length), reformatting, `onTouched`.
- No `NG_VALIDATORS`: visual validity (badge, message, border) is carried by the component; form validity remains the parent validators' business.
- Compatible with `[ngModel]`, `formControlName` **and** the signal-forms `[formField]` directive (dominant usage in `src/app`).

## billy-input-vat — InputVatComponent

Entry of an intra-community VAT number. Model "BE0690614660", display "BE 0690.614.660". The Belgian number is verified (modulo 97); other known countries are length-checked (`unverified` if conforming); unknown countries are never declared wrong.

| Specific input | Type | Default | Description |
|---|---|---|---|
| `defaultCountry` | `string` | `'BE'` | Assumed country when only digits are typed: on blur, `VatUtils.normalize` adds the prefix (and restores the leading zero of a legacy 9-digit Belgian number). |

**Projection slot**: `<ng-content select="[codeAction]">` — optional action attached to the field. Used by `client-form` for `<app-bce-search codeAction>` (Crossroads Bank search shown only on a valid Belgian number). Without projection, the field is unchanged.

Usage in `src/app`: `client-form`, `compte-form`.

## billy-input-iban — InputIbanComponent

Entry of an IBAN bank account. Model "BE68539007547034", display "BE 68 5390 0754 7034". The check digits (ISO 7064, modulo 97) are universal: verified as soon as the IBAN is complete, whatever the country. No specific input; `normalize` boils down to `sanitize` (nothing to complete on an IBAN).

Usage in `src/app`: `client-form`, `compte-form`.

## billy-input-email — InputEmailComponent

Same shell, same badge and same states as VAT/IBAN, **without a mask** (`formatText` and `normalize` = identity): an address doesn't split into groups. Spaces (common when copy-pasting) and disallowed characters are removed while typing as well as on load; case is left untouched (RFC 5321).

Specifics:

- `domain` (computed): typed domain, shown as a badge like a VAT number's country — hidden when the address is invalid.
- `suggestion` (computed): correction proposed by `EmailUtils.suggest` for domain typos ("gmial.com" → "gmail.com") — that's what the blue `unverified` state is for. A "Did you mean …?" button replaces the message; `applySuggestion()` writes the correction into the field.
- `isSignificant` is overridden (every allowed character is significant): the base's "delete across a separator" branches never trigger.
- The `<input>` is `type="text" inputmode="email"` and not `type="email"`: the base positions the cursor with `setSelectionRange()`, which the spec forbids on an email field (`InvalidStateError`). `inputmode` still brings up the "@" keyboard on mobile.

Usage in `src/app`: `client-form`.

## billy-vat-display — VatDisplayComponent / billy-iban-display — IbanDisplayComponent

Read-only display of an already-saved number: the value (even dirty) is cleaned then split by `VatUtils.format` / `IbanUtils.format`, and rendered by `billy-code-value`. Robust by construction: a country without a splitting rule is displayed as-is behind its prefix.

| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null \| undefined` | `''` | Raw value (canonical or not). |
| `empty` | `string` | i18n `codeDisplay.empty` (EN `'Not provided'`) | Text displayed when there is no value. When the input is not set, the default comes from the i18n dictionary. |
| `glyph` | `boolean` (`booleanAttribute`) | `false` | Shows the SVG symbol before the value. |
| `copyable` | `boolean` (`booleanAttribute`) | `true` | Shows the copy button. |

Usage in `src/app`: `client-fiche` (client consultation), `compte-document`, `peppol-facture-status-info` (VAT).

```html
<billy-vat-display class="cc-value" [value]="c.tva"></billy-vat-display>
<billy-iban-display class="cc-value" [value]="c.compte"></billy-iban-display>
```

## billy-code-glyph — CodeGlyphComponent

SVG symbol of a "code" field: perforated tax stamp (VAT), bank card (IBAN) or envelope (email). Hand-drawn (at 26 px, two crisp strokes beat a font glyph) and tinted by `currentColor`: the glyph follows the field's state (accent, `--cfd-ok` green, danger red).

| Input | Type | Description |
|---|---|---|
| `kind` | `CodeGlyphKind` = `'vat' \| 'iban' \| 'email'` (**required**) | Choice of drawing. |

## billy-code-status — CodeStatusComponent

Status badge (22 px, `role="img"` + English `aria-label`):

- `partial` → progress ring filling while typing (`pathLength="1"` circle, driven by `stroke-dashoffset = 1 - progress`);
- `valid` → green disc, self-drawing check mark (`stroke-dashoffset` animation);
- `unverified` → accent disc with "i" (conforming structure, no known check digit);
- `invalid` → red disc with "!".

| Input | Type | Default | Description |
|---|---|---|---|
| `status` | `CodeStatus` (**required**) | — | Displayed state (host class `cs--<status>`). |
| `progress` | `number` | `0` | 0→1 progress of the ring (`partial` state). |

## billy-code-value — CodeValueComponent

Read-only rendering of an already-split code: pure presentation, the splitting is the utils' business. `muted` segments turn gray, digits keep the text color. Discreet copy button (revealed on row hover, always visible to keyboard users) which copies the **canonical value** `raw` — not the rendering with separators — and only shows the "copied" check (1.8 s) once `navigator.clipboard.writeText` has actually resolved.

| Input | Type | Default | Description |
|---|---|---|---|
| `segments` | `CodeSegment[]` (**required**) | — | Fragments to display. |
| `kind` | `CodeGlyphKind` (**required**) | — | Symbol to display if `glyph`. |
| `raw` | `string` | `''` | Canonical value being copied. |
| `empty` | `string` | i18n `codeDisplay.empty` (EN `'Not provided'`) | Text when there is no value. |
| `glyph` / `copyable` | `boolean` (`booleanAttribute`) | `true` / `true` | Display of the symbol / of the copy button. |

## Usage example

Real excerpt from `src/app/auth/pages/client/client-form/client-form.component.html` (signal-forms `[formField]`):

```html
<billy-input-email inputId="cf-email"
  hint="Address the invoices will be sent to"
  [formField]="formClient.email">
</billy-input-email>

<billy-input-vat inputId="cf-tva"
  hint="Company number or intra-community VAT"
  [formField]="formClient.tva">
  <!-- Only appears on a valid Belgian number -->
  <app-bce-search codeAction
    [tva]="formClient.tva().value()"
    (found)="applyBce($event)">
  </app-bce-search>
</billy-input-vat>

<billy-input-iban inputId="cf-compte"
  hint="IBAN of the account to credit"
  [formField]="formClient.compte">
</billy-input-iban>
```

The fields can also be used with `formControlName` / `[ngModel]` (standard CVA).

## Styles & theming

- The shell of the three fields comes from the shared **`billy-code-field`** mixin (`lib/styles/_billy-code-field.scss`, included by each field's `.scss`), itself built on the `billy-forms` mixins (`billy-input`, `billy-focus`, `billy-input-invalid`). A single set of `.cfd-*` classes for all three fields.
- Tokens: `--billy-input-*`, `--billy-accent(-soft/-strong)`, `--billy-danger`, `--billy-text-muted`, `--billy-divider`, `--billy-section-*`. The **validation green does not exist in the design language**: it is defined locally (`--cfd-ok`/`--cs-ok`: `#16a34a`, `#4ade80` in dark) and readjusted via `body.dark-mode`.
- Deliberate choice: a **valid field keeps its neutral border** (validity reads through the check, the glyph and the message); only an error colors the frame.
- Fixed-pitch digits (`font-variant-numeric: tabular-nums`, widened letter-spacing) on VAT/IBAN so groups stay aligned; cancelled for email (`.cfd-input--text`: "rn" and "m" must remain distinguishable).
- The `.cfd-meta` info line has reserved height (`min-height: 17px`): the message appears/disappears without pushing the next field. Country badge `.cfd-country` animated on appearance.
- In `billy-code-value`, each segment is a flex item: a long IBAN wraps **between** two groups, never in the middle. `prefers-reduced-motion` respected everywhere.

## Pitfalls & notes

- **Zoneless/signals**: all state is in signals; the DOM ← `display` synchronization goes through an `effect` that only rewrites the input **when** the DOM diverges from the model (load, reset) — while typing it is left alone, so the cursor doesn't move.
- **`forceDisabled` and not `disabled`**: signal-forms writes the field state into the host's `disabled` input *after* the template bindings; a static `disabled` would be overwritten.
- **Backspace/Delete against a separator**: the base deletes the targeted significant character on the other side of the separator (otherwise the mask would immediately put the dot back and nothing would disappear). Word deletions (Ctrl/Alt/Cmd) are left to the browser.
- **Writing dirty values**: `writeValue('be 0690.614.660')` will send `BE0690614660` back to the model via `queueMicrotask` — the form will thus see an asynchronous write right after loading (one tick, then stable).
- Details of the utils (per-country rules, checksums, email suggestions): see [../core/code-utils.md](../core/code-utils.md).
