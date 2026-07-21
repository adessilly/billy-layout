# billy-label-clipboard — LabelClipboardComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/form-creation/label-clipboard/` · standalone component

## Purpose

"Copyable" label: displays a text preceded by a clipboard icon; on click, copies a value to the clipboard (`navigator.clipboard`) and shows a confirmation for 2 seconds (checked icon + "(copied to clipboard)" mention). By default the label itself is copied, but `value` allows copying a value different from what is displayed. As of today, **no direct usage in `src/app`** (verified by grepping for `billy-label-clipboard`): the component is exported by the library and is part of the `FormCreationModule` bundle imported by `src/app/shared/components/tache-list-signalform/` (vestigial import, the selector is absent from the template).

## API

### Selector & import

```ts
import { LabelClipboardComponent } from 'billy-layout';
```

Selector: `<billy-label-clipboard>`. Also exported via the legacy `FormCreationModule` array (barrel `lib/forms/form-creation/index.ts`).

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — (`input.required`) | Displayed text; it is also the copied value if `value` is absent. |
| `value` | `string \| null` | `null` | Value copied to the clipboard instead of the label (e.g. display "IBAN" and copy the number). |

No outputs.

### Public methods

| Method | Description |
|---|---|
| `askCopy(event: MouseEvent)` | Click handler: `stopPropagation()`, copies `value ?? label` via `navigator.clipboard.writeText`, sets the internal `copied` signal to `true` then resets it after 2 s. Public but intended for the template. |

## Slots / projection

None — everything goes through the inputs.

## Usage example

No current usage in `src/app`; typical usage:

```html
<!-- copies the label itself -->
<billy-label-clipboard [label]="client.email" />

<!-- displays a short text, copies the full value -->
<billy-label-clipboard label="IBAN" [value]="account.iban" />
```

## Styles & theming

- `:host { cursor: pointer }`; `fa-clipboard` icon dimmed (`opacity: 0.3`) at rest, `fa-clipboard-check` after copying.
- Hover: the text switches to `#5d9cec` (hard-coded blue, no `--billy-*` token — no specific dark mode adaptation, but the blue stays readable on a dark background).
- The "(copied…)" mention is `position: absolute` (200px wide, italic) to the right of the label: it doesn't push the layout but can overflow a narrow or `overflow: hidden` container.

## Pitfalls & notes

- `event.stopPropagation()` in `askCopy`: the click does not bubble up — expected when the label lives in a clickable row (table row), worth knowing if you also want to react to the parent click.
- `navigator.clipboard.writeText` requires a secure context (HTTPS or localhost); the promise is neither awaited nor its failure handled — the confirmation shows even if the copy failed.
- The 2 s `setTimeout` is not cancelled if the component is destroyed in the meantime (writing a signal on a destroyed component: no effect, but an orphan timer).
- The hover targets `i.copy-label` while the icon carries the `copy-icon` class: the icon opacity hover effect is inoperative (only the text color changes).
- Orphaned component on the app side as of 2026-07-17 (exported, but no selector in `src/app`).
