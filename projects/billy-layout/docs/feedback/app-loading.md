# app-loading — AppLoadingComponent

> Category `feedback` · source `projects/billy-layout/src/lib/feedback/app-loading/app-loading.component.ts` · standalone component

## Role

Loading overlay that covers its parent's entire area (the parent must be `position: relative`) and shows an animated "invoice being written" SVG while `loading` is true. It is the in-house replacement for the legacy `ad-loading`. Widely used in `src/app`: quote/sale/purchase/client forms and consult screens (`devis-form`, `vente-consult-dialog`, `achat-consult`…), sale payments, account page, `compte-password`, `upload-manager` — about fifteen components.

## API

### Selector & import

```ts
import { AppLoadingComponent } from 'billy-layout';
```

Selector: `billy-loading` (the folder/file keeps the historical name `app-loading`).

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `loading` | `input<boolean>` | `false` | Shows the overlay when true. The component stays in the DOM and fades in/out (opacity/visibility). |

No output, no public method.

## Usage example

Real-world usage (`src/app/auth/pages/devis/devis-form/devis-form.component.html`):

```html
<billy-loading [loading]="devisState.loading()"></billy-loading>
```

Or hard-coded during a page load (`devis-consult.component.html`):

```html
<billy-loading [loading]="true"></billy-loading>
```

The parent must establish a positioning context (`position: relative`): the overlay uses `position: absolute; inset: 0`.

## Styles & theming

- Overlay `absolute inset: 0; z-index: 50`, veil `rgba(255,255,255,.72)` + `backdrop-filter: blur(2px)`, `cursor: wait`; 0.25 s opacity transition on activation, `pointer-events` blocked only while active.
- Animated SVG illustration: an invoice document whose lines "write themselves" left to right in cascade (`billy-line-write`, per-line delay `calc(var(--i) * 0.18s)`), a € badge that "pops" once the total is written (`billy-euro-pop`), the whole thing floating gently (`billy-doc-float`).
- DS tokens with fallback: `--billy-accent` / `--billy-accent-strong` (outline gradient and lines), `--billy-accent-border` (dimmed lines), `--billy-surface` (document body).
- **Dark mode** (`:host-context(body.dark-mode)`): dark veil `rgba(20, 28, 31, .72)`.
- **`prefers-reduced-motion: reduce`**: the writing animations and the € pop are disabled; only the slow document float remains (a "gentle pulse") to signal activity.
- Accessibility: `aria-live="polite"`, `[attr.aria-busy]="loading()"`, `role="status"` on the spinner; its `aria-label` comes from the i18n dictionary (`appLoading.loading`, EN "Loading"). Built-in strings are localizable — see [i18n](../core/i18n.md).

## Pitfalls & notes

- **A `position: relative` parent is mandatory**, otherwise the overlay covers the nearest positioned ancestor (or even the page).
- `z-index: 50` only: designed to cover a panel's content, not the topbar/dialogs/toasts.
- The component is always rendered (no internal `@if`): there is no creation/destruction cost on each toggle, but remember to place it in the right container.
- The SVG gradient uses a fixed id `billyLoadingGrad`: multiple simultaneous instances share the same id — harmless in practice since all definitions are identical.
