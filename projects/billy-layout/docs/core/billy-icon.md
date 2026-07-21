# billy-icon — BillyIconComponent

> Category `core` · source `projects/billy-layout/src/lib/core/icon/billy-icon.component.ts` · standalone component

## Purpose

In-house SVG icon set of the "Billy — application shell" design: rounded strokes (`stroke-linecap/linejoin: round`), viewBox 24, drawn in `stroke: currentColor` — the icon therefore takes the color of the surrounding text. It is the single icon source of the library's shell (topbar, navigation items, notifications, action-bar) and of the components that embed it (`billy-input-password`: padlock and eye; `billy-dropdown`: chevron, cross, magnifier, checkmark; `billy-snackbar`: refresh, bolt, cross). It is also consumed directly by the application: global search (`src/app/layout/billy-search/billy-search.component.html`) and account menu (`src/app/shared/components/icon-top-compte/billy-account-menu.component.html`). Some icons embed a micro-animation triggered when hovering an ancestor zone.

## API

### Selector & import

```ts
import { BillyIconComponent, BillyIconName } from 'billy-layout';
```

Selector: `<billy-icon />`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `name` | `BillyIconName \| string` | — (`input.required`) | Name of the icon to draw. An unknown name renders an empty SVG (the `@switch` matches nothing) — no error, no fallback. |
| `size` | `number` | `21` | SVG width and height in pixels (`width`/`height` attributes). |
| `strokeWidth` | `number` | `1.9` | Stroke thickness (`stroke-width`). |

No output or public method.

### `BillyIconName` type

A union of literals exported next to the component — handy for typing menu configurations (see `billy-account-menu.component.ts`, which declares `icon: BillyIconName`).

Business navigation icons: `home`, `purchases`, `quotes`, `sales`, `services`, `calendar`, `clients`, `account`, `peppol`.

Utility icons: `bell`, `chevron-left`, `chevron-right`, `chevron-down`, `sync`, `check`, `clock`, `search`, `dark-mode`, `logout`, `open`, `upload`, `plus`, `close`, `refresh`, `bolt`, `lock`, `eye`, `eye-off`.

The type also accepts `string` as component input to let dynamic names through, but only the 28 names above produce a drawing.

Usage landmarks for the recent utilities: `chevron-down` (dropdown, open-state rotation driven in CSS by the parent), `close` (close/delete cross — dropdown tags, snackbar), `refresh` (circular "update" arrow, snackbar), `bolt` (lightning bolt on the snackbar's action button), `lock`/`eye`/`eye-off` (password field).

## Usage example

Real usage in `src/app/layout/billy-search/billy-search.component.html`:

```html
<billy-icon name="search" [size]="18" [strokeWidth]="1.9" />
```

Typed dynamic name, in `src/app/shared/components/icon-top-compte/billy-account-menu.component.html`:

```html
<billy-icon [name]="item.icon" [size]="18" [strokeWidth]="1.8" />
```

```ts
import { BillyIconComponent, BillyIconName } from 'billy-layout';

interface MenuItem { icon: BillyIconName; label: string; }

@Component({
  imports: [BillyIconComponent],
  /* ... */
})
```

## Styles & theming

- **Color**: `stroke="currentColor"` — driven entirely in CSS via `color` on the host or an ancestor. No `--billy-*` token consumed directly; dark mode is therefore automatic whenever the surrounding text follows it.
- **Box**: `:host { display: inline-flex; line-height: 0 }` and `svg { overflow: visible }` (animations may slightly overflow the viewBox).
- **Hover micro-animations**: tagged fragments (`anim-drop`, `anim-rise`, `anim-lift`, `anim-greet`, `anim-draw`) animate when an **ancestor carrying the `.billy-icon-hover-zone` class** is hovered (via `:host-context(.billy-icon-hover-zone:hover)`). Examples: `purchases` (arrow diving in), `sales` (arrow rising), `clients` (the arc "waves"), `quotes`/`services` (stroke drawing itself, `stroke-dasharray`).
- **Accessibility**: the SVG carries `aria-hidden="true"` (decorative icon — provide a text label next to it) and all animations are disabled under `prefers-reduced-motion`.

## Pitfalls & notes

- Unknown `name` = invisible icon but rendered SVG (the `size × size` space is reserved). Check the spelling, there is no warning.
- Animations do **not** trigger when hovering the icon itself: put `.billy-icon-hover-zone` on the clickable container (button, nav link) — this is what `billy-nav-item` does in the shell.
- Purely presentational component, stateless: no particular zoneless constraint, all inputs are signals.
- To add an icon: add the literal to the `BillyIconName` type **and** a `@case` in the template; stick to the set's grammar (viewBox 24, ~1.9 stroke, rounded corners).
