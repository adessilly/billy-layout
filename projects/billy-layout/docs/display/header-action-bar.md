# billy-header-action-bar — HeaderActionBarComponent

> Category `display` · source `projects/billy-layout/src/lib/display/header-action-bar/` · standalone component

## Purpose

Page header action bar, driven by a declarative `HeaderAction[]` array. **Neutral** actions (variant absent or `'default'`) are grouped into a *segmented button group* (connected buttons inside a single pill), while **highlighted** actions (`'primary'`, `'danger'`) become standalone colored pills (cyan / red gradient). Almost always placed in the `billy-page-header` slot.

Usage in `src/app` (verified via grep, 13 screens): `achat-consult` / `achat-form` / `achat-list`, `vente-*`, `devis-*`, `client-consult` / `client-list`, `compte`, `peppol-inbox`.

## API

**Selector**: `billy-header-action-bar` · **Import**: `import { HeaderActionBarComponent, HeaderAction } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `actions` | `HeaderAction[]` | `[]` | Declarative list of actions. If no action is visible, the bar renders nothing. |

### Outputs

None — each action carries its own `click` callback.

### Exported interface `HeaderAction`

```ts
export interface HeaderAction {
  label: string;                              // label (hidden on mobile ≤ 640px)
  icon: string;                               // FontAwesome class
  title: string;                              // tooltip (the only visible text on mobile)
  click: () => void;                          // click callback
  variant?: 'default' | 'primary' | 'danger'; // grouping (see below)
  disabled?: boolean;                         // grayed-out button, click blocked
  hidden?: boolean;                           // action removed from rendering
}
```

**Grouping** (internal getters `groupedActions` / `standaloneActions`):

- `variant` absent or `'default'` → **segmented group** `.hab-group`: connected neutral buttons, separated by a hairline, soft cyan hover.
- `variant: 'primary'` or `'danger'` → **standalone pill** `.hab-btn--primary` / `.hab-btn--danger`: color gradient, "shine" effect on hover.

Render order: the segmented group first, then the standalone pills, each in array order.

## Slots / projection

No `ng-content` — rendering is entirely driven by the `actions` input.

## Usage example

`achat-consult.component.ts` + `.html`:

```ts
get headerActions(): HeaderAction[] {
  const a = this.achat;
  if (!a) return [];
  return [
    { label: 'Calendar', icon: 'fa-solid fa-calendar-days', title: 'Link a calendar event', click: () => this.liaisonVisible.set(true) },
    { label: 'Unread', icon: 'fa-solid fa-envelope', title: 'Mark as unread', click: () => this.askMarkAsUnread(), hidden: !a.read },
    { label: 'Edit', icon: 'fa-solid fa-pen-to-square', title: 'Edit', click: () => this.askEdit(), variant: 'primary' },
    { label: 'Delete', icon: 'fa-solid fa-trash', title: 'Delete', click: () => this.askOpenDelete(), variant: 'danger', disabled: this.achatState.loading() },
  ];
}
```

```html
<billy-page-header [title]="'Purchase'" …>
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>
```

## Styles & theming

- **Hard-coded** colors (no `--billy-*` tokens): white pills, cyan hover `#0e97bb` / `#e6f7fc`; primary = `#12b4dd → #0e97bb` gradient, danger = `#ef4444 → #dc2626` gradient. Pill visual inherited from `agenda-add-button`.
- "Shine" effect (a gradient `::after` sweeping across the button) on hover of standalone pills; `translateY(-1px)` + stronger shadow.
- **Mobile ≤ 640px**: `.hab-label { display: none }` — buttons show only their icons. The `title` becomes the sole label.
- Dark mode via `:host-context(.dark-mode)`: `#1e2b2f` backgrounds; the primary/danger variants keep their gradients.
- `disabled`: 0.4 opacity + `cursor: not-allowed`.

## Gotchas & notes

- **`track action.label`** in both `@for` loops: labels must be **unique** within the bar, otherwise an Angular tracking error occurs.
- `title` is mandatory in the interface and is **the only accessible text on mobile** — write it carefully (it may be more verbose than `label`).
- `groupedActions` / `standaloneActions` are plain **getters** (not `computed`): recomputed on every change-detection cycle; in zoneless mode the bar updates because `actions` is a signal input — provide a new array (or go through a parent-side getter as above) to reflect dynamic `hidden`/`disabled`.
- No `'secondary'` variant and no dropdown: one action = one button. To hide conditionally, use `hidden` rather than rebuilding a filtered array.
