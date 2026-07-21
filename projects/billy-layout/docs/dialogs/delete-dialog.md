# delete-dialog — `DeleteDialogComponent`

> Category `dialogs` · source `projects/billy-layout/src/lib/dialogs/delete-dialog/` · standalone component (`billy-delete-dialog`) + enum `MessageDialogClick`

## Purpose

**Delete confirmation** dialog: a centered card (max 420px) with an animated SVG illustration (the trash-can lid opens, the document drops in), a title, a message, an optional "affected item" block (name + price), a "This action cannot be undone." warning, and two buttons — Cancel and a danger button (configurable label). Unlike `billy-dialog-form`, it does **not open by itself**: declare it in the template and open it programmatically via `openDialog()` or `openDialogAndWait()`.

## API

### Enum `MessageDialogClick`

```ts
export enum MessageDialogClick {
  PRIMARY = 1,
  SECONDARY = 2,
  CANCEL = 3
}
```

Declared return type of the `openDialogAndWait()` promise (see Gotchas: the value is not actually populated today).

### Inputs (all `model()`, so they can also be set from code)

| Model | Type | Default | Rendered as |
|---|---|---|---|
| `title` | `string` | i18n `deleteDialog.title` (EN `'Delete confirmation'`) | `h5.del-title` heading |
| `message` | `string` | i18n `deleteDialog.message` (EN `'Do you want to delete this record?'`) | `.del-message` paragraph |
| `productName` | `string` | `''` | Item name in the `.del-item` block (shown when non-empty) |
| `price` | `number` | `0` | Price formatted with `currency:'EUR'` (shown when non-zero) |
| `label` | `string` | `''` | Suffix displayed **after the price** (e.g. "excl. VAT") |
| `labelValidate` | `string` | i18n `deleteDialog.confirm` (EN `'Delete'`) | Danger button label |

When these inputs are not set, the defaults come from the i18n dictionary. The warning ("This action cannot be undone."), the Cancel button and the close cross's `aria-label` are not inputs: they come from `deleteDialog.warning` / `.cancel` / `.close`. Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Type | Emitted when |
|---|---|---|
| `delete` | `string` (value `'delete'`) | The user clicks the danger button. The button also carries `data-billy-dismiss`: the dialog closes right after. |

### Public methods

| Method | Signature | Description |
|---|---|---|
| `openDialog` | `openDialog(): void` | Moves the `#modalDelete` root under `<body>` (`document.body.appendChild`), creates a `new Dialog(...)`, calls `show()`, and on `listenClose()` (first emission) removes the element from `<body>`. |
| `openDialogAndWait` | `openDialogAndWait(title: string, subtitle: string, label: string): Promise<MessageDialogClick>` | "Promise" variant: sets `title`, `productName` (= `subtitle`) and `label`, opens the dialog and returns a promise **resolved only on confirmation** (danger button click). |
| `askDelete` | `askDelete(): void` | Danger button handler: emits `delete`, then resolves any pending promise. Called by the template. |

### Closing

The `.del-close` cross, the "Cancel" button and the danger button all carry `data-billy-dismiss`; Escape and a backdrop click also close (standard `Dialog` behavior).

## Usage example

Real-world usage: `src/app/auth/pages/devis/devis-card/devis-card.component.*` (same pattern in vente-card, achat-card, devis-form, etc.).

Template:

```html
<billy-delete-dialog
  message="Do you want to delete this quote?"
  [productName]="d.libelle"
  [price]="d.prix"
  (delete)="onDeleteConfirmed()" #deleteDialog>
</billy-delete-dialog>
```

Component:

```ts
readonly deleteDialog = viewChild.required<DeleteDialogComponent>('deleteDialog');

askDelete(): void {
  this.deleteDialog().openDialog();
}
```

Promise variant (real-world usage: `src/app/shared/components/uploadmanager/upload-manager-list/upload-manager-list.component.ts`):

```ts
this.deleteDialog().openDialogAndWait('Do you want to delete this file?', file.fileName, '')
  .then(async () => { /* deletion confirmed */ });
```

## Styles & theming

- Base shell: global `.billy-modal*` classes (`lib/styles/_billy-dialog.scss`) + component SCSS `delete-dialog.component.scss` (classes prefixed `del-`).
- `z-index: 9000` on `.del-modal`: sits **above** the `billy-dialog-form` overlays (case: deletion requested from within a dialog).
- Custom entrance: a slight "pop" (`translateY(14px) scale(0.96)` → none) instead of the standard `.billy-modal-dialog` slide.
- Colors via `--billy-*` tokens (`--billy-surface`, `--billy-surface-border`, `--billy-danger`…) → automatic dark mode. Since the modal lives under `<body>`, only the `_ngcontent` attributes travel with the nodes: **no `:host`** in the SCSS (see the file's header comment).
- The SVG animation (halo, ripples, lid, sheet) replays on every opening thanks to the `display: none → block` switch driven by `Dialog`.

## Gotchas & notes

- **`openDialogAndWait` never resolves on cancellation** (Cancel, cross, Escape, backdrop click): the promise stays pending. Do not `await` it in series with code that must run either way; keep the `.then(...)` for the "confirmed" path only. The promise is also resolved **without a value** (`undefined`), despite the declared `Promise<MessageDialogClick>` type — do not test the return value.
- **The 3rd `openDialogAndWait` parameter feeds `label`** (the suffix displayed after the price), **not** `labelValidate` (the button label). To change the button label, use `[labelValidate]` or `labelValidate.set(...)`.
- `openDialogAndWait` does not touch `message`: the message stays whatever the input set (or the default); the "subtitle" argument goes into `productName`.
- The `.del-item` block appears only if `productName` **or** `price` is truthy; a price of `0` is not displayed.
- Reopening the dialog is safe: every `openDialog()` creates a fresh `Dialog` instance, and an unresolved previous opening is overwritten on the promise side (the resolver is replaced).
- The output is named `delete`: in a template, bind `(delete)="..."` — beware of naming collisions in TypeScript (`delete` is a keyword; the output is still reachable via `this.delete`).
