# billy-add-button — AddButtonComponent

> Category `buttons` · source `projects/billy-layout/src/lib/buttons/add-button/` · standalone component

## Purpose

"Add" action tile: round icon badge + title + optional subtitle, styled as an accent-blue outline (#23b7e5). It is the entry-point button for quick creations, designed to live in an action grid next to `billy-upload-button` (same tile anatomy). Used in `src/app/auth/pages/home/home-actions/home-actions.component.html` ("New purchase", "New sale"), `src/app/auth/pages/dashboard/dashboard-list-achat/dashboard-list-achat.component.html` and `src/app/auth/pages/dashboard/dashboard-list-vente/dashboard-list-vente.component.html`.

## API

### Selector & import

```ts
import { AddButtonComponent } from 'billy-layout';
```

Selector: `<billy-add-button>`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | i18n `addButton.label` (EN `'Add'`) | Tile title. When the input is not set, the default comes from the i18n dictionary. |
| `subtitle` | `string` | `''` | Discreet subtitle under the title; omitted when empty. |
| `icon` | `string` | `'fa-solid fa-pen-to-square'` | Font Awesome classes for the icon in the round badge. |

Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clicked` | `MouseEvent` | Click on the tile. The original event has received `stopPropagation()` before emission. |

### Public methods

`onClick(event: MouseEvent)`: template handler (`stopPropagation` then emission of `clicked`).

## Slots / projection

None — everything goes through the inputs.

## Usage example

Real usage in `src/app/auth/pages/home/home-actions/home-actions.component.html`:

```html
<billy-add-button
  class="action-item"
  label="New purchase"
  subtitle="Manual entry"
  icon="fa-solid fa-download"
  (clicked)="addPurchase($event)">
</billy-add-button>
```

## Styles & theming

- `:host { display: block; flex: 1; min-width: 0 }`: the tile shares the width of a flex container evenly (action grid).
- Outline style: transparent, 2px border and `#23b7e5` text (hard-coded accent, no `--billy-*` token); round 34px icon badge on a 10% accent background.
- Hover: `#e8f8fd` background, slight elevation (`translateY(-1px)`) + accent-tinted shadow.
- Dark mode via `:host-context(.dark-mode)`: keeps the accent outline, hover on translucent accent (`rgba(35,183,229,0.12)`) instead of the pale blue.

## Pitfalls & notes

- This is **not a `<button>`** but a clickable `<div>`: no keyboard focus, no ARIA role, no Enter/Space activation — reserve it for actions duplicated elsewhere, or complete it on the consumer side when accessibility is required.
- Systematic `stopPropagation()`: a clickable parent container will never see the click.
- No `disabled`/`loading` state (unlike `billy-upload-button`).
- The accent colors are hard-coded (#23b7e5 and derivatives), aligned with the theme's former `.btn-info` — a change of the DS accent will not propagate automatically.
