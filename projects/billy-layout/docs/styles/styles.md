# Shared SCSS sheets — tokens, reboot, mixins, shells

> Category `styles` · source `projects/billy-layout/src/lib/styles/` · SCSS mixins + global sheets

## Role

The CSS side of the BILLy design system: six sheets carrying the `--billy-*` tokens (the source of truth for colors/shapes, dark mode included), the global normalization, the form and card mixins, and two shared "shells" (code fields, modal dialogs). Every component — in the library and in the app — dresses itself with these building blocks; dark mode is automatic everywhere since only the tokens change under `body.dark-mode`.

## Consumption

The sheets resolve **by bare name**, without relative paths, thanks to the include paths configured on both sides:

- **Application** — `angular.json` → `projects.billy-client.architect.build.options.stylePreprocessorOptions.includePaths: ["projects/billy-layout/src/lib/styles"]`.
- **Packaged library** — `projects/billy-layout/ng-package.json` → `lib.styleIncludePaths: ["src/lib/styles"]` for component compilation, plus an `assets` block that copies `src/lib/styles/**/*.scss` to `dist/billy-layout/styles` (the `.scss` files ship as source for consumers).

Two usage modes:

```scss
// 1. Mixins, in a component SCSS file:
@use 'billy-forms' as forms;
@use 'billy-cards' as cards;

.my-input { @include forms.billy-field; }
.my-panel { @include cards.billy-card; }

// 2. Global sheets, loaded once:
// src/styles.scss
@use 'billy-tokens';
@use 'billy-dialog';
// src/app/layout/layout-ui-loader/billy-legacy.scss
@use 'billy-reboot';
```

| Sheet | Nature | Loading |
|---|---|---|
| `_billy-tokens.scss` | global (emits CSS) | once, in `src/styles.scss` |
| `_billy-reboot.scss` | global (emits CSS) | once, currently via `billy-legacy.scss` |
| `_billy-dialog.scss` | global (emits CSS) | once, in `src/styles.scss` |
| `_billy-forms.scss` | mixins + `$field-height` | `@use` in every consuming component |
| `_billy-cards.scss` | mixins | `@use` in every consuming component |
| `_billy-code-field.scss` | a single shell mixin | `@use` in the `code-field` components |

---

## `_billy-tokens` — global design tokens

The source of truth for colors and shapes. Light values sit on `:root`, dark values on **`body.dark-mode`**: every consumer — including overlays relocated under `<body>` (dialogs, dropdowns) — inherits the right theme without a local dark block.

Main tokens by family (light → dark when the value changes):

| Family | Tokens | Light | Dark |
|---|---|---|---|
| **Accent** | `--billy-accent` | `#12b4dd` | same |
| | `--billy-accent-strong` (links, totals, selection) | `#0e97bb` | `#7dd3ec` |
| | `--billy-accent-soft` (tinted backgrounds) | `#e6f7fc` | `rgba(18,180,221,.15)` |
| | `--billy-accent-border` | `#a5dff2` | `#0e97bb` |
| **Semantic** (statuses) | `--billy-neutral` / `-strong` | `#6b7280` / `#374151` | `#4b5563` / `#cbd5e1` |
| `neutral · info · success · warning · error` | `--billy-info` / `-strong` | `#3b82f6` / `#1d4ed8` | `#2563eb` / `#60a5fa` |
| each: `base` (vivid fill), | `--billy-success` / `-strong` | `#16a34a` / `#15803d` | `#22c55e` / `#4ade80` |
| `-strong` (text/icon, ≥ AA), | `--billy-warning` / `-strong` | `#ff902b` / `#b45309` | `#d97706` / `#fbbf24` |
| `-soft` / `-soft-strong`, `-ring` | `--billy-error` / `-strong` | `#ef4444` / `#b91c1c` | `#dc2626` / `#f87171` |
| **Focus** | `--billy-focus-border` | `#66afe9` | same |
| | `--billy-focus-ring` | `rgba(102,175,233,.15)` | `.25` |
| **Fields** | `--billy-input-bg` / `-border` / `-border-hover` / `-color` / `-placeholder` | `#fff` / `#e5e7eb` / `#9ca3af` / `#374151` / `#c2c8d0` | `#121d1f` / `#49545a` / `#6b7a80` / `#ced0d2` / `#4b5563` |
| | `--billy-input-radius` | `8px` | same |
| | `--billy-input-disabled-bg` / `-color` | `#f3f4f6` / `#9ca3af` | `#172224` / `#5a6a70` |
| **Addons** | `--billy-addon-bg` / `-color` / `-hover-bg` / `-hover-color` | `#f9fafb` / `#6b7280` / `#f3f4f6` / `#374151` | `#212e31` / `#7a8a90` / `#2d3d42` / `#ced0d2` |
| **Surfaces** | `--billy-surface` / `-border` / `-shadow` | `#fff` / `#e5e7eb` / soft shadow | `#1c282b` / `#49545a` / black shadow |
| | `--billy-divider`, `--billy-text-muted`, `--billy-text-soft` | `#f3f4f6`, `#9ca3af`, `#6b7280` | `#2a3a3e`, `#5a6a70`, `#7a8a90` |
| **Danger** | `--billy-danger` / `--billy-danger-ring` | `#dc2626` / `rgba(220,38,38,.08)` | same / `.15` |
| **Cards & sections** | `--billy-card-shadow`, `--billy-section-bg` / `-border` / `-title` | 4% shadow / `#fafbfc` / `#eceff3` / `#374151` | 25% shadow / `#1a2629` / `#2e3d41` / `#9aadb3` |

### Semantic families (statuses)

Five status families — `neutral`, `info`, `success`, `warning`, `error` — built on the same model as `Accent`, the **single source of truth** for the DS status hues. Each exposes five variables:

| Variant | Role |
|---|---|
| `--billy-<hue>` (`base`) | **Vivid** fill: background of a filled button, disc of a checkmark. Darkens one step in dark mode. |
| `--billy-<hue>-strong` | **Text/icon** tint (outline, label, glyph): ≥ AA 4.5:1 on light surfaces, **lightens in dark mode** to stay readable. |
| `--billy-<hue>-soft` / `-soft-strong` | Tinted washes (hover / active states of outline & text variants, toast icon chip). |
| `--billy-<hue>-ring` | Focus halo (`box-shadow`). |

`primary` has **no** family of its own: it is the brand `Accent` (`--billy-accent*`). Consumers: [`billy-button`](../buttons/button.md) (maps `base`/`-strong`/`-soft`/`-ring` onto its `--btn-*`), [`toastr`](../feedback/toastr.md) (accent = `-strong`, chip = `-soft`), [`checkmark`](../feedback/checkmark.md) & `checkmark-failed` (disc = `base`), [`save-bar`](../forms/save-bar.md) (via `billy-button`). A single place to change to retint a status everywhere.

---

## `_billy-reboot` — global normalization

The DS reset/normalize, extracted from the Bootstrap compat layer. **The entire DS depends on it**, in particular `* { box-sizing: border-box }` — no other file sets it. It fixes: root at `16px`, body in "Source Sans Pro" `0.875rem` / `line-height 1.52857` / `#f5f7fa` background, the heading scale, `#5d9cec` links, `small { font-size: 80% }`, `*:focus { outline: 0 !important }`, `button/input/textarea/fieldset/table` resets.

Points of attention:

- The values **reproduce the computed rendering of the original Bootstrap + Angle stack** — do not "modernize" them without re-checking visual parity on the business pages.
- Currently loaded by `src/app/layout/layout-ui-loader/billy-legacy.scss` (same cascade position as before the extraction); once the compat layer is gone, load it from `styles.scss`.
- Prerequisite: fonts loaded by the application (`index.html`): "Source Sans Pro" (business pages); the shell and the DS use "Plus Jakarta Sans".

---

## `_billy-forms` — form mixins

Consumption: `@use 'billy-forms' as forms;`. Dark mode is automatic via the tokens. Two generations of mixins:

**Skin only** (historically combined with Bootstrap's `.form-control`):

| Mixin | Usage |
|---|---|
| `billy-input` | Field skin: background, border, radius, placeholder, focus state (border + ring). |
| `billy-input-invalid` | Invalid state, combined with `billy-input` (Angular's `.is-invalid` class). |
| `billy-focus` | The focus state alone — for a non-input element (e.g. an open dropdown trigger). |
| `billy-addon-button` | Skin of an addon attached to a field (grey background, hover). |

**Full box, without Bootstrap** — the geometry matches the Angle theme (height `2.1875rem`, padding `.375rem 1rem`, line-height `1.52857`, `.875rem` font for fields and `13px` for buttons — the theme is authoritative, not Bootstrap's `1rem`):

| Mixin / variable | Usage |
|---|---|
| `$field-height` (`2.1875rem`) | Exposed to align a button attached to a field. |
| `billy-field` | Complete field (replaces `.form-control`): box + skin + disabled/readonly states + `.is-invalid`. |
| `billy-textarea` | Same field, auto height (grows with the content). |
| `billy-button` | Button base (replaces `.btn`), colorless — combine with a variant. |
| `billy-input-group` | "Field + attached addon" group (replaces `.input-group`): joined corners, overlapping borders, focused field raised to `z-index: 2`. |
| `billy-input-group-addon` | Text/button attached to the field; height **fixed** at `$field-height` (not derived from the content), content vertically centered. |

**Side-panel footer buttons** — same visual language as `<billy-save-bar>` but at a reduced scale (use when a save-bar does not fit: agenda, services):

| Mixin | Usage |
|---|---|
| `billy-panel-button` | Common base (13px, 600, pressed-in `:active`, disabled). |
| `billy-panel-button-ghost` | Cancel / No: discreet ghost. |
| `billy-panel-button-submit` | Save: solid accent + raised hover. |
| `billy-panel-button-destructive` | Delete confirmation: solid red, takes the main button's place. |
| `billy-panel-button-delete-icon` | Icon-only delete (~36px), `margin-right: auto` to keep it away from the confirm button. |

---

## `_billy-cards` — cards & panel sections

Consumption: `@use 'billy-cards' as cards;`. The "white card + grey chip-titled sections" look, introduced on the Account page (`compte-form`) and generalized to consult screens (`billy-consult-card`, `achat-document`, …).

| Mixin | Usage |
|---|---|
| `billy-card` | Enclosing card: surface, thin border, 16px radius, discreet shadow (`--billy-card-shadow`). |
| `billy-section` | Inner section: soft grey background (`--billy-section-bg`), 12px radius. |
| `billy-section-title` | Section title: 12px, uppercase, bold, flex with a gap for the chip. |
| `billy-section-icon` | 26×26 title icon chip (`--billy-accent-soft` background, `--billy-accent-strong` text). |
| `billy-intro` | Introductory paragraph under the title (12.5px, `--billy-text-soft`). |

---

## `_billy-code-field` — shell of the "code" fields

Consumption: `@use 'billy-code-field' as code;` then `@include code.billy-code-field;` **at the root level of a component's SCSS** (the mixin contains `:host` rules). A single set of `.cfd-*` classes shared by `billy-input-vat`, `billy-input-iban` and `billy-input-email`: they differ only in their symbol and messages, not in their box.

- `.cfd-shell`: the field box (flex, `billy-input`), with `--focus`, `--valid`, `--invalid`, `--disabled` modifiers. A deliberate choice: **a valid field keeps its neutral border** (validity reads from the checkmark/symbol/message); only the error keeps its frame.
- `.cfd-input`: bare input inside the shell — 13px semi-bold, `font-variant-numeric: tabular-nums` (fixed advance width: groups stay aligned and the value does not "breathe" while typing).
- `.cfd-glyph`: the field's symbol (state color, slight scale on focus).
- `.cfd-meta`: information line below the field, with **reserved height** (`min-height: 17px`) — the message appears/disappears without pushing the next field.
- `.cfd-country`: country chip (soft accent background, `cfd-chip-in` entrance animation).
- `.cfd-msg` + `--ok` / `--info` / `--error`: status message.
- The validation green keeps a local value (`--cfd-ok: #16a34a`, `#4ade80` in dark via `:host-context(body.dark-mode)`): it needs a green that is **vivid in light** _and_ **light in dark**, a pair that the `--billy-success` family (dark base in dark mode) cannot deliver from a single token. The values stay aligned with `--billy-success` (light `base`) / `--billy-success-strong` (dark). Animations are disabled under `prefers-reduced-motion`.

---

## `_billy-dialog` — modal dialog shell `.billy-modal*`

A **global** sheet (loaded in `src/styles.scss`), replacing Bootstrap's `.modal*`. Companion engine: the `Dialog` class (`dialogs/dialog/dialog-utils.ts`). Global rather than scoped for two reasons: dialogs are relocated under `<body>` on open, and three components share the shell (dialog-form, delete, ai-extract).

| Class | Role |
|---|---|
| `.billy-modal` | Full-screen root: dimmed background, click-to-close area, scroll container. `display` driven from JS (`none ↔ block`) — this toggle is what replays the illustration animations. `z-index: 1055`. |
| `.billy-modal.is-open` | Open state: opacity fade + dialog slide (`translateY(-30px) → none`). |
| `.billy-modal-dialog` | Centered wrapper, `max-width: 500px` (Bootstrap geometry kept so no dialog shifts). `pointer-events: none` so gutter clicks reach the root; the content re-enables them. |
| `.billy-modal-dialog--centered` | Vertical centering (`min-height: calc(100% - 3.5rem)`). |
| `.billy-modal-dialog--large` | `.modal-xl` equivalent: `800px` from 992px, `1140px` from 1200px. |
| `.billy-modal-content` | The dialog card — same language as `billy-card` (surface, thin border, 16px radius, `--billy-surface-shadow`), `pointer-events: auto`. |
| `.billy-modal-header` / `-body` / `-footer` / `-title` | Inner structure (1rem paddings / 0.75rem right-aligned footer). |
| `body.billy-dialog-open` | Scroll lock (`overflow: hidden`), set by `Dialog` while a dialog is open. |

Responsive: reduced margins under 576px. Transitions disabled under `prefers-reduced-motion`.

## Pitfalls & notes

- **Cascade order**: `billy-reboot` must stay at its current position (loaded by `billy-legacy.scss`) as long as the compat layer exists; `billy-tokens` and `billy-dialog` load in `src/styles.scss`.
- Mixins emit **nothing** until you `@include` them — multiple `@use` statements across components do not duplicate CSS. Conversely, `billy-tokens`/`billy-reboot`/`billy-dialog` emit CSS on `@use`: load them only once, globally.
- Every color in the mixins has a hard-coded fallback (`var(--billy-x, #hex)`): a component works even without the tokens loaded, but without dark mode — loading `billy-tokens` remains required.
- Dark mode relies on the **`body.dark-mode`** class (set by `BillyDarkModeService`): no `@media (prefers-color-scheme)` here.
- `billy-code-field` references `:host` / `:host-context`: it belongs in component styles (default ViewEncapsulation), not in a global sheet.
- In the distributed package, the `.scss` files are copied to `dist/billy-layout/styles`: an external consumer must add that folder to its own `includePaths`.
