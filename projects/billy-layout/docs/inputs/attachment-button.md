# billy-attachment-button — AttachmentButtonComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/attachment-button/` · standalone component (no CVA — the value flows through a `model()`)

## Purpose

Paperclip button for attaching **PDF** files (maximum 3) to a send action: first click with no files → opens the file picker; with files → a counter badge appears and the click toggles a panel listing the attachments (`billy-attachment-button-list`) allowing removal or addition. Closing on outside click goes through `ClickOutsideDirective` (`lib/core/click-outside/`).

Used in `src/app` by the send bars: `email-form-panel` (email dialog) and `peppol-facture-summary` ("Also send by email"), in the left slot of `billy-save-bar`.

## API

**Selector & import**

```ts
import { AttachmentButtonComponent } from 'billy-layout';
```

**Inputs / model** (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `files` | **`model<File[]>`** | `[]` | List of attached files — two-way binding `[(files)]`. This is the component's value channel (no ControlValueAccessor). |

Public constant: `MAX_FILES = 3` (not configurable to date).

**Outputs** — no output of its own besides the implicit `filesChange` of the `model()`.

**Public methods**

| Method | Description |
|---|---|
| `onButtonClick()` | Opens the picker (no files) or toggles the list (≥ 1 file). |
| `triggerFileInput()` | Dynamically creates an `<input type="file" accept="application/pdf" multiple>` and clicks it; no-op if the max is reached. |
| `deleteFile(index)` | Removes a file (closes the list if it becomes empty). |
| `closeList()` | Closes the panel. |
| `getTooltip()` | Button tooltip: instructions + names of the attached files. |

## ControlValueAccessor

Not applicable — the component is not a CVA. The value (`File[]`) is exchanged via the `model()`:

```html
<billy-attachment-button [(files)]="files" />
```

with, on the consumer side, `readonly files = model<File[]>([])` or a writable signal. Non-PDF files are filtered out at selection, and only the remaining slots (max 3) are filled; the file input is reset after each selection so the same file can be re-picked.

## Usage example

Real excerpt from `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html`:

```html
<billy-save-bar ... >
  <div class="left-zone-buttons">
    <billy-attachment-button [(files)]="files" />
  </div>
</billy-save-bar>
```

and in `email-form-panel.component.ts`: `readonly files = model<File[]>([]);` — the parent then forwards those `File[]` into the outgoing `FormData`.

## Styles & theming

- The button is the ex-Bootstrap `.btn` rewritten in-house: transparent background, color `#6c757d` (hover `#495057`), `--billy-input-radius` radius, `--billy-focus-ring` ring on visible focus, `--billy-accent` accent when the list is open, `opacity: .5` + `cursor: not-allowed` when the file max is reached. Red counter badge (`#dc3545`) positioned absolutely on the paperclip.
- Font Awesome icons (`fa-paperclip`, `fa-file-pdf`, `fa-trash`, `fa-plus`, `fa-xmark`).
- The list panel is `position: absolute` under the button (`z-index: 1000`, min 280 / max 400 px, 300 px scrollable content). Its colors are largely hard-coded (white, Bootstrap grays) — **no dark mode variant** to date, only a few tokens (`--billy-danger` for the PDF icon) are wired in.

## Pitfalls & notes

- **PDF only**: the filter is `file.type === 'application/pdf'` — a file renamed `.pdf` without the correct MIME type is silently ignored, with no user-facing error message.
- The `<input type="file">` is created **dynamically in JS** (`document.createElement`) on each opening, never rendered in the template.
- `[(files)]`: the component does `files.set([...])` (immutability) — the parent can therefore react via `effect`/`computed` without worrying about in-place mutations.
- The list tracking uses `track file.name`: two files with the same name can disrupt the list rendering (the duplicate is not prevented at addition).
- `listenClickOutside` is only active while the list is open (`[listenClickOutside]="showList()"`) — same zoneless pattern as `billy-dropdown`.
- No `disabled` state: to be handled on the parent side if needed (e.g. hide the button while sending).

---

# billy-attachment-button-list — AttachmentButtonListComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/attachment-button/attachment-button-list/` · standalone component (pure presentation)

## Purpose

Dropdown panel listing the attachments: header with `(n/max)` counter and close button, file rows (PDF icon, truncated name with `title`, trash button), "Add a file" footer displayed while the max is not reached. The close and trash button tooltips come from the i18n dictionary (`attachments.close`, EN "Close"; `attachments.deleteFile`, EN "Delete this file") — built-in strings are localizable, see [i18n](../core/i18n.md). Pure presentation component: it holds no state, everything bubbles up to the parent via outputs. Exported in the public API but only used by `billy-attachment-button` in the current code.

## API

**Inputs**

| Input | Type | Default | Description |
|---|---|---|---|
| `files` | `File[]` (**required**) | — | Files to list. |
| `maxFiles` | `number` | `3` | Cap displayed in the header and driving `canAddMore`. |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `deleteFile` | `number` | Index of the file to remove. |
| `addFiles` | `void` | Request to open the picker. |
| `close` | `void` | Request to close the panel. |

**Public getter**: `canAddMore` (`files().length < maxFiles()`).

## Usage example

Real usage in `attachment-button.component.html`:

```html
@if(showList()) {
  <billy-attachment-button-list
    [files]="files()"
    [maxFiles]="MAX_FILES"
    (deleteFile)="deleteFile($event)"
    (addFiles)="triggerFileInput()"
    (close)="closeList()"
  />
}
```

## Styles & theming

See above (absolute panel, Bootstrap-inherited colors kept as-is — the `.abl-close` close button reproduces the ex-`.btn-close`, the PDF icon uses `--billy-danger`). No dedicated dark mode.

## Pitfalls & notes

- `track file.name` in the `@for`: see the duplicates note above.
- The component performs no validation: capping and PDF filtering are the parent's business.
