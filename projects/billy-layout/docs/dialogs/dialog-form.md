# dialog-form — `DialogFormComponent`

> Category `dialogs` · source `projects/billy-layout/src/lib/dialogs/dialog-form/` · standalone components (`billy-dialog-form` + slots `billy-dialog-form-header` / `-body` / `-footer`)

## Purpose

`billy-dialog-form` is the library's generic "form / consultation" dialog: it provides the full `.billy-modal` shell, opens it **automatically** as soon as the component is displayed (`ngAfterViewInit`), moves it under `<body>`, and coordinates closing with the application's router when the dialog is carried by an "overlay" route (optional `BILLY_DIALOG_ROUTER` token). The content is provided through three `TemplateRef`-based slot components: header (with a built-in close cross), body, footer.

Exports (`lib/dialogs/dialog-form/index.ts`): `DialogFormComponent`, `DialogFormHeaderComponent`, `DialogFormBodyComponent`, `DialogFormFooterComponent`, plus the convenience array `DialogFormModule` bundling all four.

## API

### `billy-dialog-form` (DialogFormComponent)

**Inputs**

| Input | Type | Default | Description |
|---|---|---|---|
| `large` | `boolean` | `false` | Applies `billy-modal-dialog--large` (equivalent to `modal-xl`: 800px ≥ 992px, 1140px ≥ 1200px). |
| `maxWidth` | `number \| null` | `null` | `max-width` in px applied to `.billy-modal-dialog` (visually takes precedence over the default 500px width). |

**Outputs**

| Output | Type | Emitted when |
|---|---|---|
| `closed` | `void` | The dialog is fully closed, **if** the closing came from a button (`askCloseDialog`/`closeThen`) **or** from a standard gesture (Escape, backdrop click, `data-billy-dismiss`, header cross) while the component is still alive. **Not emitted** when the closing comes from the router (component already destroyed: overlay replaced or cleared). |

**Slots (contentChild)**

| Selector | Renders | Note |
|---|---|---|
| `billy-dialog-form-header` | `.billy-modal-header` + projected content + built-in **close cross** with `data-billy-dismiss` (its `aria-label` comes from the i18n dictionary, key `deleteDialog.close`, EN `'Close'`) | Optional |
| `billy-dialog-form-body` | `.billy-modal-body` + projected content | Optional |
| `billy-dialog-form-footer` | `.billy-modal-footer` + projected content | Optional |

Each slot is a standalone component whose template is a plain `<ng-template>` captured by `viewChild.required<TemplateRef<any>>(TemplateRef)` (property `template`) and stamped by `*ngTemplateOutlet` inside the `billy-dialog-form` shell. The content therefore **never** renders where the slot is declared.

Built-in strings are localizable — see [i18n](../core/i18n.md).

**Public methods**

| Method | Signature | Description |
|---|---|---|
| `askCloseDialog` | `askCloseDialog(): void` | Programmatic "button" close: sets `closeFromButtonAction`, plays the animation, then (via `listenClose`) delegates navigation to `BILLY_DIALOG_ROUTER.closeOverlay()` and emits `closed`. |
| `closeThen` | `closeThen(action: () => void): void` | Closes the dialog (**animation included**), then runs `action`, which owns all subsequent navigation (another overlay or a page). Navigating before the animation ends would let the `<body>` scroll lock be released afterwards, breaking scrolling in the next dialog. |
| `closeDialog` | `closeDialog(): void` | Calls `dialogRouter?.closeOverlay()` (no-op when the token is not provided). Normally called internally. |
| `detectChanges` | `detectChanges(): void` | Forces a local change detection pass. |

**Lifecycle**

1. `ngAfterViewInit`: `detectChanges()` then `openDialog()` — `document.body.appendChild(...)` of the `#dialogRoot` root, `new Dialog(...)`, `show()`.
2. `listenClose().pipe(first())`: on full close —
   - if an `afterClose` was set by `closeThen`, it runs (that action drives navigation);
   - otherwise, if the component **is not destroyed** (user-gesture close), `dialogRouter?.closeOverlay()` closes the overlay route;
   - otherwise (component destroyed = router-driven close), **nothing**: re-navigating would clobber a freshly opened overlay;
   - `closed` is emitted according to the rule in the table above; finally `document.body.removeChild(...)`.
3. `ngOnDestroy`: if the closing did not come from a button, `modal.hide()` (case: the router removes the overlay while the dialog is still displayed).

## Focus & modality

Everything comes from the `Dialog` engine — full description in [Modality: focus & inert background](dialog.md#modality-focus--inert-background). What it means for a `billy-dialog-form`:

- **On opening**, focus leaves the page and enters the dialog: the first `[billyAutofocus]` / `[autofocus]` element of the projected content if there is one, otherwise `.billy-modal-content` (which gets a temporary `tabindex="-1"`). Put `billyAutofocus` on the first field of a form dialog; leave it out on a consultation dialog, where landing on the container reads the content rather than the close cross.
- **The rest of the page is `inert`** while the dialog is open: neither clickable nor reachable by Tab, and invisible to screen readers. A `billy-delete-dialog` opened on top of the form makes the form inert in turn, and gives it back when it closes.
- **Tab cycles inside the dialog** — no need to add a focus trap of your own.
- **On closing**, focus returns to where it came from (typically the row or the button that navigated to the overlay), unless a `closeThen(...)` action moved it elsewhere in the meantime.

## Usage example

Real-world usage: overlay-routed consultation dialogs — `src/app/auth/pages/devis/devis-consult-dialog/` (same for `vente-consult-dialog`, `achat-consult-dialog`, `client-consult-dialog`, `email-dialog`, `peppol-facture-dialog`…).

Template (`devis-consult-dialog.component.html`):

```html
<billy-dialog-form [large]="true">

  <billy-dialog-form-header>
    <div class="dcd-header">
      <h4 class="dcd-title">{{ d?.libelle || 'Quote' }}</h4>
      <button type="button" class="dcd-btn" (click)="askExpand()">Expand</button>
      <button type="button" class="dcd-btn dcd-btn--primary" (click)="askEdit()">Edit</button>
    </div>
  </billy-dialog-form-header>

  <billy-dialog-form-body>
    <billy-loading [loading]="loading()"></billy-loading>
    @if (d) {
      <app-devis-document [devis]="d"></app-devis-document>
    }
  </billy-dialog-form-body>

</billy-dialog-form>
```

Component: `closeThen` to switch cleanly to another page (animated close, scroll lock released, **then** navigation):

```ts
private readonly dialogForm = viewChild.required(DialogFormComponent);

askEdit(): void {
  this.dialogForm().closeThen(async () => {
    await this.routerUtils.closeOverlay();
    this.routerUtils.toDevisFormEdit(id);
  });
}
```

On the app side, the router bridge is provided in `src/app/app.config.ts`:

```ts
{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService },
```

## Styles & theming

- The visual `.billy-modal*` shell is **global** (`lib/styles/_billy-dialog.scss`, loaded by the app's `styles.scss`) — `--billy-*` tokens, automatic dark mode.
- The slot component CSS (`dialog-form-header.component.css`, etc.) remains effective despite the move under `<body>`: the stamped nodes carry the `_ngcontent` attributes of their originating component. The header notably styles the `.close` cross (32×32, hover `--billy-divider`, visible focus `--billy-focus-border`).
- The template root does **not** carry `tabindex="-1"` — deliberate: it broke focus on select2 search fields. The initial focus uses a temporary `tabindex="-1"` placed on `.billy-modal-content` instead, removed as soon as the dialog closes.

## Gotchas & notes

- **The modal lives under `<body>`**, outside the host component's element. Consequences:
  - `:host` / `:host-context(...)` styles of the component using `billy-dialog-form` **do not match** the dialog content;
  - for dark mode, the house pattern is `::ng-deep body.dark-mode { .my-prefixed-classes { … } }` (see `devis-consult-dialog.component.scss`, "Dark mode" section) — collision-free as long as classes are prefixed (e.g. `dcd-`);
  - in Playwright/E2E tests, target the dialog with **global** selectors (`.billy-modal …`), not selectors relative to the host component.
- **Automatic opening**: displaying the component (overlay route, `@if`) is enough to open the dialog; there is no `open()` method.
- **Never navigate directly from a dialog button**: go through `closeThen(...)` so the animation finishes and the `body.billy-dialog-open` lock is released at the right time.
- Without a `BILLY_DIALOG_ROUTER` provider, Escape/backdrop click close visually but the overlay route stays active (the component is still mounted) — provide the token as soon as the dialog is routed.
- `closed` does not distinguish validation from abandonment: it is a closing signal; the business semantics (save performed, etc.) are the caller's responsibility.
