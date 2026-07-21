# billy-tabs / billy-tab — TabsComponent&lt;T&gt; / TabComponent

> Category `display` · source `projects/billy-layout/src/lib/display/tabs/` · standalone components

## Purpose

BILLy's in-house tab bar (independent of the old `ad-tabs`): a rounded *segmented control* aligned with the brand (cyan `--billy-*` accent), with a **sliding** active chip (animated indicator), keyboard navigation and elaborate responsive behavior (inactive labels collapse, then horizontal scrolling with side fades).

Two usage modes:

- **Projected**: `<billy-tab>` elements in the content; `billy-tabs` handles selection internally and toggles panel display — panels **stay mounted in the DOM** (`[hidden]`).
- **Driven (headless)**: the bar alone, described by the `items` input; selection is controlled by the parent via `selected` / `(selectedChange)`. Handy in a page header where the content lives elsewhere.

Usage in `src/app` (verified via grep): `agenda-list` (`size="sm"` bar inside the `billy-page-header`, tabs Events / Recurrences / Links) and `compte-prompt` (view switch of the prompt editor). Both in **driven** mode — no projected usage in the app to date.

## API

**Selectors**: `billy-tabs`, `billy-tab` · **Import**: `import { TabsComponent, TabComponent, TabItem } from 'billy-layout';`

### `TabsComponent<T extends string = string>` — generic

The `T` parameter types the tab ids in driven mode (e.g. `TabItem<AgendaTab>[]` → `selectedChange` emits an `AgendaTab`).

#### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `TabItem<T>[] \| null` | `null` | Driven mode: tabs described by input instead of projected `<billy-tab>` elements. `null` = projected mode. |
| `selected` | `T \| null` | `null` | Driven mode: id of the selected tab (parent-controlled). Unknown id → first tab active. |
| `size` | `'md' \| 'sm'` | `'md'` | `'sm'`: dense variant for header bars. |

#### Outputs

| Output | Type | Description |
|---|---|---|
| `selectedChange` | `output<T>` | Driven mode: emitted with the id of the clicked tab (or the one reached via keyboard). In projected mode selection is internal; nothing is emitted. |

### `TabComponent` (`billy-tab`)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label displayed in the bar. |
| `icon` | `string` | `''` | Optional FontAwesome icon class (e.g. `fa-solid fa-user`). |

Also exposes `active: signal<boolean>` — **driven by `billy-tabs`**, do not write to it yourself.

### Exported interface `TabItem<T>`

```ts
export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: string; // optional FontAwesome class
}
```

## Slots / projection

- `<ng-content>` of `billy-tabs`: the `<billy-tab>` elements (projected mode). The `.app-tabs-body` body (padding-top 22px) is hidden in driven mode.
- `<ng-content>` of `billy-tab`: the panel content, rendered inside a `role="tabpanel"` hidden via `[hidden]` when inactive.

## Usage example

Typed driven mode (`agenda-list`):

```ts
readonly tabItems: TabItem<AgendaTab>[] = [
  { id: 'evenements',  label: 'Events',      icon: 'fa-solid fa-calendar-days' },
  { id: 'recurrences', label: 'Recurrences', icon: 'fa-solid fa-rotate' },
  { id: 'liaisons',    label: 'Links',       icon: 'fa-solid fa-link' },
];
```

```html
<billy-tabs size="sm"
  [items]="tabItems"
  [selected]="activeTab()"
  (selectedChange)="activeTab.set($event)" />
```

Projected mode (panels stay mounted):

```html
<billy-tabs>
  <billy-tab label="Entry" icon="fa-solid fa-user"> … </billy-tab>
  <billy-tab label="History" icon="fa-solid fa-clock-rotate-left"> … </billy-tab>
</billy-tabs>
```

## Styles & theming

- `--billy-*` tokens (with fallbacks): bar `--billy-surface` / `--billy-surface-border`, indicator and active tab `--billy-accent-soft` / `--billy-accent-strong`, inactive text `--billy-text-muted`, hover `--billy-input-color` / `--billy-divider`, focus `--billy-focus-ring`. Dark mode: only shadows are neutralized via `:host-context(.dark-mode)`; the rest follows the tokens.
- Active chip = absolute indicator (`translate3d` + animated width/height, `cubic-bezier(0.22, 1, 0.36, 1)`); before the first measurement, a static fallback background is applied to the active button (`has-indicator` then takes over).
- **Responsive in 2 stages**: (1) if every tab has an icon, the labels of **inactive** tabs collapse (animated `grid-template-columns 1fr → 0fr`) — triggered by a ≤ 768px media query **or** by measured overflow (`overflowCompact` ratchet, released when the viewport regains ~16px); (2) as a last resort, the bar scrolls horizontally with `mask-image` side fades and automatic centering of the active tab.
- `prefers-reduced-motion: reduce`: all transitions disabled, `auto` scroll.
- `size="sm"` variant: reduced paddings/radius/typography for page headers.

## Gotchas & notes

- **Projected tabs stay mounted**: content is hidden via `[hidden]`, never destroyed — child component state is preserved and their network calls are not re-triggered on switch. Do not rely on `ngOnInit`/`ngOnDestroy` firing on every tab change.
- Driven mode = **fully controlled**: `selectedChange` writes nothing by itself; the parent must feed the value back into `selected` (otherwise the tab does not move visually).
- The responsive label collapse **requires an icon on every tab** (`collapsible`); without icons, it goes straight to scrolling.
- Do not mix modes: a non-null `items` hides the body (`.app-tabs-body--none`) — projected `<billy-tab>` elements alongside it would never be displayed.
- Accessibility included: `role="tablist"` / `role="tab"` / `aria-selected`, *roving tabindex*, left/right arrows + Home/End; in compact mode, inactive tabs get a `title` with their label.
- `TabItem.id` extends `string`: use a union type (`type AgendaTab = 'evenements' | …`) to benefit from `selectedChange` typing.
