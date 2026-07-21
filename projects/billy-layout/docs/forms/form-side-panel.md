# billy-form-side-panel — FormSidePanelComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/form-side-panel/` · standalone component

## Purpose

Side panel sliding in from the right, with a semi-transparent overlay and a **body scroll lock**: as long as the panel is mounted, the page behind it no longer scrolls, and the scroll position is restored on close. The component only manages the container (overlay + animated panel): the content (link form, AI review…) is projected, and opening/closing is driven by the consumer via an `@if`. Used notably in `src/app/auth/pages/achat/achat-consult/achat-consult.component.html` (agenda link + AI review), `src/app/auth/pages/achat/achat-form/achat-form.component.html` (AI review), `src/app/auth/pages/vente/vente-consult/vente-consult.component.html`, `src/app/auth/pages/prestations/prestations-agenda/prestations-agenda.component.html` and `src/app/auth/pages/agenda/agenda-list/agenda-list.component.html`.

## API

### Selector & import

```ts
import { FormSidePanelComponent } from 'billy-layout';
```

Selector: `<billy-form-side-panel>`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `wide` | `boolean` | `false` | Wide panel: 440px instead of 360px (no effect below 768px, where the panel is full screen). |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `overlayClick` | `void` | Click on the overlay. The component **does not close itself**: it's up to the consumer to unmount the panel (e.g. `(overlayClick)="visible.set(false)"`). |

### Public methods

None. Lifecycle: `ngOnInit` sets the scroll lock (see Pitfalls), `ngOnDestroy` removes it and restores the position.

## Slots / projection

Single `<ng-content>` inside `.panel` (full-height flex column): the content provides its own header/footer and its internal scrolling.

## Usage example

Real usage in `src/app/auth/pages/achat/achat-consult/achat-consult.component.html`:

```html
@if (liaisonVisible()) {
  <billy-form-side-panel (overlayClick)="liaisonVisible.set(false)">
    <app-concept-agenda-liaison-panel
      type="achat"
      [conceptId]="beanId!"
      (closed)="liaisonVisible.set(false)"
      (updated)="onLiaisonUpdated($event)">
    </app-concept-agenda-liaison-panel>
  </billy-form-side-panel>
}
```

Wide variant, in `src/app/auth/pages/prestations/prestations-agenda/prestations-agenda.component.html`:

```html
<billy-form-side-panel [wide]="true" (overlayClick)="onBulkCancelled()">
```

## Styles & theming

- `:host { display: contents }`: the host creates no box; overlay and panel position themselves as `fixed` directly.
- Overlay: `rgba(0,0,0,0.15)`, `z-index: 1050` — above the sticky save-bar (1001), below toasts/modals (9000+); 0.2s fade. Panel: `z-index: 1051`, 0.25s slide from the right, drop shadow toward the left.
- Panel background: hard-coded white, with explicit dark mode via `:host-context(.dark-mode) .panel { background: #172224 }` (no `--billy-surface` token here).
- Mobile (≤768px): full-screen panel (width 100%).

## Pitfalls & notes

- **Body scroll lock**: on init, the component records `window.scrollY` then freezes the body (`position: fixed; top: -scrollY; width: 100%`) and keeps `overflow-y: scroll` to preserve the desktop scrollbar width (no layout shift). On destroy, it clears the styles and calls `scrollTo(0, scrollY)`. Consequences: (1) the lock overwrites the body's inline styles — do not stack two side-panels or another lock mechanism at the same time, as the second one destroyed would restore empty styles and a stale position; (2) the panel must be mounted/unmounted via `@if`, not hidden in CSS, otherwise the lock stays active.
- `overlayClick` is a mere notification: without a handler that unmounts the panel, clicking the overlay closes nothing. No close on `Escape` either.
- No focus trap and no ARIA attributes: keyboard accessibility is the projected content's responsibility.
- The content must manage its own overflow (`overflow-y: auto` on its scrollable area): `.panel` is a full-screen flex column with no scrolling by default.
