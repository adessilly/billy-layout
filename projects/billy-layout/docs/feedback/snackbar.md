# billy-snackbar — SnackbarComponent

> Category `feedback` · source `projects/billy-layout/src/lib/feedback/snackbar/snackbar.component.ts` · standalone component

## Role

PWA-style "snackbar" floating banner at the bottom of the screen, designed to announce that a **new version of the application is available** and offer an update (reload) button. The component is purely presentational: it detects nothing by itself, visibility is driven from the outside via the `visible` model. It is mounted once in `src/app/app.component.html` (app root), fed by `UpdateService` which sets `shouldRefresh`.

## API

### Selector & import

```ts
import { SnackbarComponent } from 'billy-layout';
```

Selector: `billy-snackbar`.

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `message` | `input<string>` | i18n `snackbar.message` (EN `'New version available.'`) | Banner text (reused as the label of the compact mobile button). |
| `buttonTitle` | `input<string>` | i18n `snackbar.buttonTitle` (EN `'Click here to refresh and update'`) | `title` attribute of the action buttons. |
| `buttonLabel` | `input<string>` | i18n `snackbar.buttonLabel` (EN `'Update'`) | Label of the desktop action button. |
| `closeTitle` | `input<string>` | i18n `snackbar.closeTitle` (EN `'Ignore this message'`) | `title` attribute of the close button. |
| `visible` | `model<boolean>` | `false` | Shows/hides the banner; two-way bindable (`[(visible)]`). The close button sets it back to `false`. |

When the inputs are not set, the defaults come from the i18n dictionary. Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Type | Description |
|---|---|---|
| `buttonClick` | `output<void>` | Emitted on action button click (desktop or compact mobile). The parent typically triggers the page reload. |

## Usage example

Real-world usage (`src/app/app.component.html`):

```html
<billy-snackbar
  [message]="'New version available.'"
  [buttonTitle]="'click here to refresh the page and update'"
  [buttonLabel]="'Update'"
  [closeTitle]="'dismiss this message'"
  (buttonClick)="askRefreshPage()"
  [(visible)]="shouldRefresh">
</billy-snackbar>
```

## Styles & theming

- Full-width fixed zone at the bottom (`position: fixed; bottom: 0; z-index: 100000`), respects the iOS safe area (`padding-bottom: max(16px, env(safe-area-inset-bottom))`).
- Enter/leave: off-screen vertical translation with a bouncy curve `cubic-bezier(0.34, 1.56, 0.64, 1)` (0.45 s) triggered by the `.pwa-snackbar-zone-active` class; `pointer-events: none` when hidden.
- "Glassmorphism" card: `rgba(255,255,255,.92)` background + `backdrop-filter: blur(16px)`, multiple shadows, `max-width: 560px`. No `--billy-*` tokens: standalone palette (icon and button in a `#4f8ef7 → #6c63ff` gradient).
- Icons from the in-house [`billy-icon`](../core/billy-icon.md) set: `refresh` (header icon and compact mobile button), `bolt` (desktop action button), `close` (cross) — no Font Awesome dependency.
- **Dark mode** via the global rule `body.dark-mode .pwa-snackbar`: translucent dark background, adapted texts and close button (no `:host-context` here — the styles target the global class).
- **Mobile (≤ 480px)**: the icon and the desktop message+button block are hidden in favor of a **single merged compact button** (`.pwa-snackbar__btn-compact`, icon + message, full width) — one tap to update; the cross stays separate.
- Accessibility: `role="alert"` + `aria-live="polite"` on the zone; the cross's `aria-label` comes from the i18n dictionary (`snackbar.dismiss`, EN "Dismiss").

## Pitfalls & notes

- The component never closes itself (no auto-hide): managing `visible` is up to the parent.
- Clicking the action button does not affect `visible`: the parent is expected to reload the page (or close explicitly).
- The default texts are geared toward the "PWA update" use case; the component is nonetheless reusable for any other bottom banner by overriding the inputs.
- `z-index: 100000`: sits above everything, including toasts (10000) and dialogs.
