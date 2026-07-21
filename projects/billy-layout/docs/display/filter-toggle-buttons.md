# billy-filter-toggle-buttons — FilterToggleButtonsComponent

> Category `display` · source `projects/billy-layout/src/lib/display/filter-toggle-buttons/` · standalone component

## Purpose

Single-selection filter button group, in two visual variants: `toggle` (segmented control on a shared gray background, iOS-style) and `chips` (individual bordered, colored pills). The value `null` conventionally serves as the "All" option. Each option — or the whole group — can define its active color.

Usage in `src/app` (verified via grep): the list filter bars — `achat-filter-bar` (date mode, `activeColor="#dc2626"`), `vente-filter-bar` (`#2563eb`), `devis-filter-bar`, `agenda-filter-bar` and `recurrence-filter-bar` (purchase/sale/other type filters with per-option colors).

## API

**Selector**: `billy-filter-toggle-buttons` · **Import**: `import { FilterToggleButtonsComponent, FilterToggleOption } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `options` | `FilterToggleOption[]` (**`input.required`**) | — | List of options to display (tracked by `opt.value` → unique values). |
| `value` | `string \| null` | `null` | Currently selected value (controlled component). |
| `variant` | `'toggle' \| 'chips'` | `'toggle'` | `toggle`: segmented control on a shared background · `chips`: individual colored pills. |
| `activeColor` | `string \| undefined` | `undefined` | Active color shared by the whole group (fallback when the option has none of its own). CSS default: `#6366f1`. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `valueChange` | `output<string \| null>` | Emitted when an option is clicked, with its `value`. The parent must feed it back into `value` (controlled). |

### Exported interface `FilterToggleOption`

```ts
export interface FilterToggleOption {
  value: string | null;   // null = "All" option
  label: string;
  icon?: string;           // FontAwesome class
  activeColor?: string;    // text + border color when active (chips variant)
  activeBg?: string;       // background color when active (chips variant)
}
```

Color precedence (CSS custom properties): `opt.activeColor` (`--opt-color`) > group `activeColor` (`--ftb-color`) > default.

## Slots / projection

No `ng-content` — rendering is entirely driven by `options`.

## Usage example

Monochrome group (`achat-filter-bar.component.html`):

```html
<billy-filter-toggle-buttons
  [options]="toggleOptions"
  [value]="dateMode()"
  activeColor="#dc2626"
  (valueChange)="onModeChange($event)">
</billy-filter-toggle-buttons>
```

Individually colored options (`recurrence-filter-bar.component.ts`):

```ts
readonly chipOptions: FilterToggleOption[] = [
  { value: null,    label: 'All' },
  { value: 'achat', label: 'Purchases', icon: 'fa-solid fa-download', activeColor: '#dc2626', activeBg: '#fef2f2' },
  { value: 'vente', label: 'Sales',     icon: 'fa-solid fa-upload',   activeColor: '#16a34a', activeBg: '#f0fdf4' },
  { value: 'autre', label: 'Other',     icon: 'fa-solid fa-tag',      activeColor: '#6366f1', activeBg: '#eef2ff' },
];
```

## Styles & theming

- Base colors **hard-coded** (grays `#f3f4f6` / `#6b7280`…), active colors injected via CSS variables `--ftb-color` / `--opt-color` / `--opt-bg`.
- **Toggle** variant: shared rounded gray background (20px radius); the active option gets a white background + shadow, its text color follows `--opt-color`/`--ftb-color`.
- **Chips** variant: individual bordered pills; when active, `activeColor` colors text **and** border, `activeBg` the background.
- Dark mode via `:host-context(.dark-mode)`: backgrounds `#212e31` / `#2d3d40`; for active chips, the background becomes `color-mix(in srgb, <active color> 15%, transparent)` (the light `activeBg` is ignored).
- Mobile ≤ 768px: the toggle spans the full width (options with `flex: 1`), chips scroll horizontally with no wrap and no scrollbar.
- `:host { display: contents; }` — `.ftb-wrapper` carries the layout.

## Gotchas & notes

- **`activeBg` only has an effect in the `chips` variant** (in `toggle`, the active background is always white / `#2d3d40` in dark mode). To date, no app screen passes `variant="chips"`: the filter bars use the default toggle, where only `activeColor` (group or option) matters.
- **Controlled** component: without feeding the emitted value back into `[value]`, the clicked button does not activate.
- `valueChange` is typed `string | null`: for a typed filter (`AgendaType | null`…), a cast is needed on the parent side (the filter bars use `$any($event)`).
- The `@for` tracks by `opt.value`: two options with the same value (including two `null`s) cause a tracking error.
- No per-option `disabled` state, and a selection cannot be deselected by re-clicking (plan for a `value: null` "All" option).
