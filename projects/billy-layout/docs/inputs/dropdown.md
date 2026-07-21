# billy-dropdown — DropdownComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/dropdown/` · standalone component (ControlValueAccessor)

## Purpose

In-house replacement for `<ad-select>` (select2/jQuery from the old ad-library), backward-compatible: same `{ id, text, value }` options, same "first option displayed by default" behavior. `role="combobox"` trigger, panel in `position: fixed` (escapes parent `overflow`) with accent-insensitive search and match highlighting. Closing on outside click goes through the library's `ClickOutsideDirective` (`lib/core/click-outside/`).

Used massively in `src/app`: `vente-form`, `devis-form`, `achat-form`, `prestations-agenda`, `agenda-evenement-form`, `agenda-recurrence-form`, `agenda-filter-bar`, `recurrence-filter-bar`…

## API

**Selector & import**

```ts
import { DropdownComponent, DropdownOption } from 'billy-layout';
```

**`DropdownOption` interface** (structurally compatible with the old `AdSelectElement`):

```ts
export interface DropdownOption {
  text: string;   // displayed label
  id: string;     // unique identifier (compared as string)
  value?: any;    // value sent to the model; falls back to the option itself
}
```

**Inputs** (signals API — `input()`)

| Input | Type | Default | Description |
|---|---|---|---|
| `values` | `DropdownOption[]` | `[]` | List of options. |
| `id` | `string` | `''` | `id` set on the trigger button (for `<label for>`). |
| `required` | `boolean` | `false` | Sets `aria-required` on the trigger. |
| `readonly` | `boolean` | `false` | Static disabling (on top of the form's). |
| `searchable` | `boolean` | `true` | Shows the search field at the top of the panel. Its placeholder comes from the i18n dictionary (`dropdown.searchPlaceholder`, EN `'Search…'`). |
| `autofocusSearch` | `boolean` | `true` | Automatically focuses the search on opening (otherwise the list is focused). |
| `placeholder` | `string` | `''` | Text displayed when no option is selected. |
| `multiple` | `boolean` | `false` | Enables multi-selection: removable tags in the trigger, the model becomes an **array** of values. Multi mode also activates automatically if the written model is already an array (select2 parity). |

Built-in strings are localizable — see [i18n](../core/i18n.md).

**Outputs**

| Output | Type | Description |
|---|---|---|
| `selectionChange` | `any` | Emitted on every selection, with the same value as the one sent to the CVA. |

**Public methods**

| Method | Description |
|---|---|
| `open()` / `close(focusTrigger = false)` / `toggle()` | Panel control. |
| `pick(option)` | Selects an option. Single: emits + closes. Multi: toggles the value (add/remove) and leaves the panel open. |
| `removeValue(option, event)` | Multi only: removes the corresponding tag without opening the panel. |

## ControlValueAccessor

- **Model value**: `option.value` if defined, otherwise the `DropdownOption` object itself (select2 parity).
- **Model → option matching**: the model can be an id (`number`/`string`) or an object with an `id`; the comparison is done as strings (`'' + id`). In single mode, with no match (or a `null`/`undefined` model), **the first option is displayed** — behavior inherited from select2; the placeholder only appears if the list is empty.
- **Multi mode** (`multiple` or array model): the model is an **array** of values (each following the same `option.value` / option rule). Each value becomes a removable tag; the placeholder shows while the array is empty. `Backspace` in an empty search removes the last tag (select2 parity).
- No `NG_VALIDATORS`.
- `setDisabledState()`: combined with `readonly` (`isDisabled = readonly() || disabledFromForm()`), closes the panel if open.

## Usage example

Real excerpt from `src/app/auth/pages/agenda/agenda-evenement-form/agenda-evenement-form.component.html` (`ngModel` usage):

```html
<billy-dropdown
  [values]="clientsSelectOptions()"
  [ngModel]="f.r_client"
  (ngModelChange)="setField('r_client', $event)">
</billy-dropdown>
```

Also usable with `formControlName` in reactive forms (`vente-form`, `achat-form`…).

**Multi-selection** — `multiple` enables the tags; the model is an array of values:

```html
<billy-dropdown
  [values]="countryOptions"
  [multiple]="true"
  [(ngModel)]="selectedCountries"
  placeholder="Pick one or more countries…">
</billy-dropdown>
```

```ts
readonly selectedCountries = signal<string[]>(['FR', 'LU']); // pre-selection by ids/values
```

## Styles & theming

- The trigger and the search field use the **`billy-forms`** mixins: `@include forms.billy-input` and `@include forms.billy-focus`. The whole theme (dark mode included) comes from the `--billy-*` tokens: `--billy-input-*`, `--billy-surface(-border/-shadow)`, `--billy-divider`, `--billy-accent(-soft/-strong)`, `--billy-text-muted`, `--billy-addon-color`.
- Per-instance customization via CSS custom properties: `--dropdown-height` (35 px), `--dropdown-radius`, `--dropdown-font-size`.
- Panel: `position: fixed`, `z-index: 2000`, width aligned with the trigger (min 180 px), scrollable list max 260 px (`overscroll-behavior: contain`), flips upward when room is lacking (`openUp`). Follows the trigger on scroll/resize via `window` listeners.
- Search matches highlighted in `<b>` colored `--billy-accent-strong`; icons from the in-house [`billy-icon`](../core/billy-icon.md) set (`chevron-down`, `search`, `check`, `close`) — size via `[size]`, color inherited through `currentColor`, no Font Awesome dependency.
- **Multi tags**: chips tinted on `--billy-accent-soft` / `--billy-accent-border` / `--billy-accent-strong` (consistent with the design system badges), removal cross turning `--billy-danger` on hover. The trigger switches to `min-height` to let tags wrap.

## Pitfalls & notes

- **ClickOutsideDirective**: outside-click closing is only active while `isOpen()` is true (`[listenClickOutside]="isOpen()"`), to avoid listening to the document permanently (important in zoneless).
- **Keyboard**: `ArrowDown`/`ArrowUp` on the trigger opens the panel; inside the panel: arrows for the active option, `Home`/`End`, `Enter` selects, `Escape` closes (re-focusing the trigger), `Tab` closes without re-focus.
- **Accent-insensitive search**: character-by-character NFD normalization (`stripAccent`) with exact highlighting of the original characters — "eve" matches "Évènement".
- Focus on opening and `scrollIntoView` of the active option go through `setTimeout(...)` (the panel has just been rendered) — works in zoneless but do not remove these deferrals.
- Without a value written by the form, the component **displays** the first option but **emits nothing**: remember to initialize the control if the default value must exist in the model. This "first option" default does **not** apply in multi mode: an empty array shows the placeholder.
- **Multi**: the mode activates if `[multiple]="true"` **or** if the written value is an array. For an initially empty multi, pass `[multiple]="true"` (a `null`/`undefined` is not enough to infer the mode). The panel stays open after each click to chain selections.
