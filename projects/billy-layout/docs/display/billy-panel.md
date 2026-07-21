# billy-panel — BillyPanelComponent

> Category `display` · source `projects/billy-layout/src/lib/display/billy-panel/` · standalone component

## Purpose

"Billy" floating panel shell: rounded white card, soft shadow and opening animation (opacity + translation + scale). It was extracted from the notification panel (`.billy-notif-panel`) to share the same visual language. The component is **purely presentational**: the `open` state and the closing logic (outside click, Escape…) remain the caller's responsibility.

Usage in `src/app` (verified via grep): only the topbar "My account" menu — `shared/components/icon-top-compte/billy-account-menu.component.html`. The shell's notification panel shares the visual but keeps its own implementation.

## API

**Selector**: `billy-panel` · **Import**: `import { BillyPanelComponent } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` (transform `booleanAttribute`) | `false` | Whether the panel is expanded. Animates the appearance/disappearance (the panel stays in the DOM, `pointer-events: none` when closed). |
| `heading` | `string \| undefined` | `undefined` | Optional title displayed in the header (rendered only if provided). |
| `subheading` | `string \| undefined` | `undefined` | Optional subtitle below the title (rendered only if `heading` is present). |

### Outputs

None. Closing is the parent's responsibility (typically `ClickOutsideDirective` + the Escape key).

## Slots / projection

- `<ng-content />` (default): panel body, rendered inside `.billy-panel-body` (6px padding).

## Usage example

Topbar account menu (`billy-account-menu.component.html`):

```html
<billy-panel [open]="open()" heading="My account" subheading="Quick links">
  @for (item of links; track item.link) {
    <a class="account-menu-item" [routerLink]="item.link" (click)="close()">
      <span class="account-menu-icon" [style.background]="item.iconBg" [style.color]="item.iconColor">
        <billy-icon [name]="item.icon" [size]="18" [strokeWidth]="1.8" />
      </span>
      …
    </a>
  }
</billy-panel>
```

The parent is a `position: relative` container: the panel positions itself with `position: absolute; top: calc(100% + 14px); right: 0` (fixed width 288px, `transform-origin: top right`).

## Styles & theming

- **Hard-coded** colors (no `--billy-*` tokens): `#fff` background, `#ECF0F3` border, `rgba(16, 42, 67, .22)` drop shadow.
- Dark mode via `:host-context(body.dark-mode)`: `#172224` background, `#49545a` border, adapted headings.
- `:host { display: contents; }` — the component introduces no box of its own; `.billy-panel` is what gets positioned relative to the parent.
- Mobile (`max-width: 767.98px`): the panel switches to `position: fixed; top: 62px; left/right: 12px` (pinned to the edges below the topbar).
- Animation: `transition opacity .2s / transform .22s cubic-bezier(.34, 1.28, .5, 1)` (slight bounce), `z-index: 30`.

## Gotchas & notes

- **Anchoring is up to the parent**: without a `position: relative` container, the panel positions itself relative to the nearest positioned ancestor.
- The closed panel stays in the DOM (hidden via opacity + `pointer-events: none`): child state is preserved, but watch out for keyboard focus — handle `tabindex`/focus on the parent side if needed.
- On mobile, the fixed `top: 62px` assumes the shell topbar height; usage outside the shell will have to override that value.
- No built-in close button: plan for outside click (see the library's `ClickOutsideDirective`) and/or Escape on the caller's side.
