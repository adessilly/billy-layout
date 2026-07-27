# billy-upload-button — UploadButtonComponent

> Category `buttons` · source `projects/billy-layout/src/lib/buttons/upload-button/` · standalone component

## Purpose

File-import tile: same anatomy as `billy-add-button` (icon badge + title + subtitle) but styled as an "import zone" (grey background, dashed border), with a hidden `<input type="file">` triggered on click and a `loading` state (spinner + "Loading...", inert tile). Emits the chosen file; it is the entry point of the AI invoice scan. Used in `src/app/auth/pages/home/home-actions/home-actions.component.html` ("Scan an invoice") and `src/app/auth/pages/dashboard/dashboard-list-achat/dashboard-list-achat.component.html`.

## API

### Selector & import

```ts
import { UploadButtonComponent } from 'billy-layout';
```

Selector: `<billy-upload-button>`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | i18n `uploadButton.label` (EN `'Import'`) | Tile title (replaced by the i18n `uploadButton.loading` text, EN `'Loading…'`, while `loading`). |
| `subtitle` | `string` | i18n `uploadButton.subtitle` (EN `'From a file'`) | Subtitle, always displayed. |
| `accept` | `string` | `'.pdf,.jpg,.jpeg,.png,.gif'` | Value of the file input's `accept` attribute. |
| `loading` | `boolean` | `false` | Loading state: spinner instead of the icon, tile dimmed and not clickable (`pointer-events: none`). |

Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Payload | Description |
|---|---|---|
| `fileSelected` | `File` | File chosen in the native picker (single file). Not emitted if the user cancels. |

### Public methods

| Method | Description |
|---|---|
| `trigger()` | Opens the native file picker (programmatic click on the hidden input, obtained via `viewChild.required`). Called by the tile, also usable from the parent. |
| `onFileChange(event: Event)` | `(change)` handler: emits `fileSelected` then **resets the input's value**, so that re-choosing the same file re-triggers the event. |

## Slots / projection

None — everything goes through the inputs.

## Usage example

Real usage in `src/app/auth/pages/home/home-actions/home-actions.component.html`:

```html
<billy-upload-button
  class="action-item action-upload"
  label="Scan an invoice"
  subtitle="AI import"
  [loading]="uploadLoading()"
  (fileSelected)="onFileSelected($event)">
</billy-upload-button>
```

## Styles & theming

- `:host { display: block; flex: 1; min-width: 0 }`: designed for a flex action grid, next to `billy-add-button`.
- Import style: `#f4f6f7` background, `#555` text, 2px **dashed** `#ccc` border; on hover (unless loading), the tile switches to the accent (#23b7e5, `#e8f8fd` background, elevation + shadow).
- `is-loading`: opacity 0.65, `cursor: not-allowed`, `pointer-events: none`.
- Dark mode via `:host-context(.dark-mode)`, like `billy-add-button`: the import zone switches to the dark surface tokens (`--billy-section-bg` background, `--billy-input-color` text, dashed `--billy-surface-border`), the icon badge to a translucent white veil (`rgba(255,255,255,0.08)`), and hover keeps the accent outline over a translucent accent fill (`rgba(35,183,229,0.12)`).

## Pitfalls & notes

- Like `billy-add-button`, the tile is a clickable `<div>`, not a `<button>`: no native keyboard accessibility.
- Single-file only: `input.files?.[0]` — no `multiple` attribute, one `fileSelected` per selection.
- The input is reset after each selection: picking the same file twice in a row works (the native `change` would not fire otherwise).
- `accept` is indicative (native picker filter): it does not replace a type validation on the consumer side.
- The loading label comes from the i18n dictionary (`uploadButton.loading`, EN "Loading…") — there is no `labelSaveLoading`-like input to override it per instance; the subtitle, however, stays visible while loading.
