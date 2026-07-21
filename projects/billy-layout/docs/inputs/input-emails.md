# billy-input-emails — InputEmailsComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/input-emails/` · standalone component (ControlValueAccessor + Validator)

## Purpose

Tag-based multi-email field: each typed address becomes a removable tag (`billy-input-email-tag`), with popup autocompletion (`billy-input-emails-popup-suggestion`) from 2 typed characters. The whole behaves as a single form control whose value is the list joined into a string. It also validates the control (`NG_VALIDATORS`): a malformed address makes the control invalid and the tag turns red.

Used in `src/app` by the email send panel: `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html` ("Recipient(s)" field).

## API

**Selector & import**

```ts
import { InputEmailsComponent } from 'billy-layout';
```

**Inputs** (signals API — `input()`)

| Input | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | i18n `inputEmails.placeholder` (EN `'Enter email addresses'`) | Displayed only when no tag exists. When the input is not set, the default comes from the i18n dictionary. |
| `availableEmails` | `string[]` | `[]` | **List of addresses offered by autocompletion, provided by the consumer.** The component was decoupled from `ClientService` when extracted into the library: it's up to the parent to pass the source (e.g. `email-form-panel` passes `ClientService.emails`). |

Built-in strings are localizable — see [i18n](../core/i18n.md).

**Outputs** — no output of its own: everything goes through the CVA.

**Public methods**

| Method | Description |
|---|---|
| `addEmail(email)` / `removeEmail(index)` | Addition (deduplicated) / removal of a tag, with propagation to the form. |
| `focusInput()` | Returns focus to the text field (called on box click). |
| `isValidEmail(email)` | Test against the internal regex (used to flag invalid tags). |
| `validate(control)` | `Validator` implementation (see below). |

**Sub-components**

- `billy-input-email-tag` (`InputEmailTagComponent`) — one tag: inputs `email` (required), `invalid`, `disabled`; output `remove`.
- `billy-input-emails-popup-suggestion` (`InputEmailsPopupSuggestionComponent`) — the popup: inputs `inputValue` (required), `availableEmails` (required), `excludedEmails`, `show`; output `suggestionSelected`. Case-insensitive filter, excludes already-tagged addresses, capped at 10 suggestions.

## ControlValueAccessor

- **Model value type**: `string | null` — the addresses joined by `', '` (e.g. `"a@b.be, c@d.be"`), or `null` when the list is empty.
- `writeValue()` accepts a string separated by commas **or** semicolons, splits it and trims spaces.
- **NG_VALIDATORS**: the component also registers as a `Validator`. Empty list → valid (`required` remains the parent's business). If at least one address fails the regex, it returns `{ invalidEmails: { value, invalidEmails: [...] } }`.
- `setDisabledState()`: disables the input and the tags' removal buttons (`disabled` property, not a signal).

## Usage example

Real excerpt from `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html`:

```html
<billy-input-line label="Recipient(s)" [mandatory]="true">
  <billy-input-emails formControlName="to" [availableEmails]="availableEmails()"></billy-input-emails>
</billy-input-line>
```

TS side (`email-form-panel.component.ts`) — the autocompletion source comes from the consumer:

```ts
// Recipient autocompletion: billy-input-emails (billy-layout) is
// decoupled from ClientService, the list is passed via input.
private clientSharedService = inject(ClientService);
readonly availableEmails = this.clientSharedService.emails;
```

## Styles & theming

- The `.email-tags-container` box is the ex-Bootstrap `.form-control` rewritten in-house: it's a `div` posing as a field (tags live inside, `cursor: text`, click → input focus). Skin via the `--billy-input-bg/-border/-radius/-color/-placeholder` tokens and `@include forms.billy-focus` on `:focus-within` (`billy-forms` mixin); min height `forms.$field-height`. Automatic dark mode via the tokens.
- Tags: hard-coded colors (blue-gray `#cedbe2`; invalid red `#f8d7da`/`#721c24`) with a `:host-context(.dark-mode)` override.
- Popup: positioned `absolute` under the wrapper (`.email-input-wrapper { position: relative }`), `z-index: 1000`, max 200 px scrollable, hard-coded colors + `.dark-mode` variant — not yet aligned with the `--billy-*` tokens.

## Pitfalls & notes

- **`availableEmails` is a mandatory input in practice**: without it, no suggestion appears. Do not reintroduce application service injection into the lib.
- **Tag creation**: `Space`, `,`, `;` or `Enter` commit the current entry; `Backspace` on an empty input removes the last tag; **pasting** is intercepted (`paste`) and split on `[,;\s]+` — pasting a full list creates all tags at once; **blur** adds the remaining email.
- **Popup/field coordination on `Enter`**: the popup listens to `window:keydown` (`@HostListener`) and calls `preventDefault()` when a suggestion is highlighted; the field checks `event.defaultPrevented` inside a `setTimeout(0)` to avoid creating a duplicate tag. Likewise the blur is delayed (200 ms) to let a click on a suggestion go through — do not remove these deferrals.
- The popup captures arrows/`Escape` at the `window` level **only** when it is visible with results; `Escape` resets the highlight (it does not close the popup, which closes when the entry drops back under 2 characters or on blur).
- **Zoneless**: state in signals (`emails`, `inputValue`, `showSuggestions`, `selectedIndex`), popup filtered in a `computed`, highlight reset via `effect`. Address validation is a plain regex — less strict than `EmailUtils` from the code-field family.
- Duplicates are silently ignored (`addEmail` tests `includes`).
