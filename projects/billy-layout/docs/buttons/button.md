# billy-button — ButtonComponent

> Category `buttons` · source `projects/billy-layout/src/lib/buttons/button/` · standalone component

## Purpose

The library's general-purpose action button. It renders a **real `<button>`** (keyboard focus, Enter/Space activation, ARIA attributes) and varies along three independent axes:

- **color** (`color`): the 5 semantic hues of the design system — `neutral`, `info`, `primary`, `warning`, `error`;
- **variant** (`variant`): `plain`, `plain-rounded`, `outline`, `outline-rounded`, `text`, `text-rounded`, `ghost`, `ghost-rounded`;
- **size** (`size`): `small`, `normal`, `big`.

It accepts a `label`, a FontAwesome `icon`, or both (icon only = square/round button). It is the generic action building block, to be preferred over a bare `<button>` whenever you want the visual consistency and motion design of the DS. For the home-screen "add / import" tiles, see [`billy-add-button`](./add-button.md) and [`billy-upload-button`](./upload-button.md) instead.

## API

### Selector & import

```ts
import { ButtonComponent } from 'billy-layout';
```

Selector: `<billy-button>`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Text label; omitted when empty. |
| `icon` | `string` | `''` | FontAwesome classes for the icon; omitted when empty. |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to the label. |
| `color` | `BillyButtonColor` | `'primary'` | `neutral` \| `info` \| `primary` \| `warning` \| `error`. |
| `variant` | `BillyButtonVariant` | `'plain'` | `plain` \| `plain-rounded` \| `outline` \| `outline-rounded` \| `text` \| `text-rounded` \| `ghost` \| `ghost-rounded`. |
| `size` | `BillyButtonSize` | `'normal'` | `small` \| `normal` \| `big`. |
| `disabled` | `boolean` | `false` | Greys out the button and blocks clicks. |
| `loading` | `boolean` | `false` | Replaces the icon with a spinner, neutralizes clicks, sets `aria-busy`. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native HTML type (`submit` inside a form). |
| `block` | `boolean` | `false` | Takes up the full available width. |
| `ariaLabel` | `string` | `''` | Accessible label — **required** for an icon-only button. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clicked` | `MouseEvent` | Emitted on click. **Does not emit** when `disabled` or `loading` (the event is stopped). |

### Exported types

```ts
type BillyButtonColor = 'neutral' | 'info' | 'primary' | 'warning' | 'error';
type BillyButtonVariant =
  | 'plain' | 'plain-rounded'
  | 'outline' | 'outline-rounded'
  | 'text' | 'text-rounded'
  | 'ghost' | 'ghost-rounded';
type BillyButtonSize = 'small' | 'normal' | 'big';
type BillyButtonIconPosition = 'left' | 'right';
```

## Slots / projection

None — everything goes through the inputs (`label` / `icon`).

## Usage examples

Primary button with an icon:

```html
<billy-button
  label="Save"
  icon="fa-solid fa-floppy-disk"
  color="primary"
  [loading]="saving()"
  (clicked)="save()">
</billy-button>
```

Outline and text variants:

```html
<billy-button label="Cancel" color="neutral" variant="outline" (clicked)="cancel()" />
<billy-button label="Delete" icon="fa-solid fa-trash" color="error" variant="text" (clicked)="remove()" />
```

Pill buttons and icon only (remember `ariaLabel`):

```html
<billy-button label="New" icon="fa-solid fa-plus" color="primary" variant="plain-rounded" />
<billy-button icon="fa-solid fa-gear" ariaLabel="Settings" color="neutral" variant="text-rounded" />
```

"Back" / cancel button (`ghost` variant, same button as in the save-bar):

```html
<billy-button label="Back" icon="fa-solid fa-chevron-left" variant="ghost" (clicked)="goBack()" />
```

Full-width submit button:

```html
<billy-button label="Sign in" type="submit" color="info" [block]="true" />
```

## Styles & theming

- **Variable-driven CSS anatomy**: each color sets a small group of local variables (`--btn-solid`, `--btn-on-solid`, `--btn-fg`, `--btn-soft`, `--btn-ring`) that the variants consume. They are **mapped onto the design system's semantic families** (`--billy-<hue>` / `-strong` / `-soft` / `-soft-strong` / `-ring`, see the [tokens](../styles/styles.md)): `neutral`, `info`, `warning`, `error` point to their family, `primary` to the brand `Accent`. To retint a status, change the DS token (once) rather than the button.
- **Variants**:
  - `plain` / `plain-rounded`: solid `--btn-solid` fill (flat, no gradient), contrasting text, subtle shadow. On hover: slightly darkened fill (`color-mix`), `translateY(-1px)` elevation + soft tinted shadow.
  - `outline` / `outline-rounded`: transparent background, border and text in `--btn-fg`. On hover: tinted `--btn-soft` veil.
  - `text`: discreet link, tinted veil on hover.
  - `text-rounded`: **a fully rounded pill appears on hover** (`::before` pseudo-element, fade-in + slight `scale(0.82 → 1)` zoom).
  - `ghost` / `ghost-rounded`: **the save-bar's "Back" button** — a ghost **with no border at rest**, muted `--billy-text-muted` text; on hover, grey `--billy-addon-hover-bg` background + `--billy-input-color` text; on focus, the halo (`--billy-focus-ring` focus ring) acts as the "border". Wired to the DS input tokens (automatic dark mode). **Insensitive to `color`** (always neutral): it is the secondary / back / cancel button.
  - The `-rounded` suffixes set the radius to `999px` (pill).
- **Sizes**: `small` / `normal` / `big` only change padding, `font-size` and `gap` (`--btn-*` variables).
- **Hues** (light mode): **vivid** fills from the `base` tokens — `primary` brand cyan `--billy-accent` (#12b4dd), `info` `--billy-info` (#3b82f6), `warning` `--billy-warning` (#ff902b, the save-bar orange), `error` `--billy-error` (#ef4444), `neutral` `--billy-neutral` (#6b7280) — as a **flat fill** (no gradient) with **white text**.
- **Contrast**: white text on a vivid fill does not reach the AA 4.5:1 threshold everywhere on the lighter hues (`primary`, `warning`); the **outline/text** variants however use the `-strong` hues (`--btn-fg`), which remain readable (≥ 4.5:1) on a light surface.
- **Automatic dark mode**: the button **no longer has a local dark block** — the `--billy-*` families switch under `body.dark-mode` (solid fills darken one step, outline/text `-strong` hues lighten). Loading `_billy-tokens` (globally) is therefore required for dark mode.
- **Visible focus**: `box-shadow: 0 0 0 3px var(--btn-ring)` halo (never removed).
- **Motion design**: soft (`ease`) transitions on `transform` / colors / shadow, deliberately discreet effects (1px elevation, gently faded `text-rounded` pill). Everything is neutralized under `@media (prefers-reduced-motion: reduce)`.

## Accessibility

- Real `<button>` element: keyboard navigable, activatable with Enter/Space.
- `disabled` and `loading` set the native `disabled` attribute; `loading` adds `aria-busy="true"`.
- **Icon-only button**: provide `ariaLabel` — otherwise the button has no accessible name. Without `ariaLabel`, the `label` (if any) serves as the accessible name.
- The spinner and icons are `aria-hidden="true"` (decorative).

## Pitfalls & notes

- `clicked` **does not emit** in the `disabled`/`loading` states: no need to re-check on the consumer side.
- An **icon-only button without `label` or `ariaLabel`** will fail an AXE audit (no accessible name). Always set `ariaLabel` in that case.
- The palette comes from the **DS semantic families** (`--billy-<hue>-*`), with a **hard-coded fallback** on each variable (light value): the button stays correct in light mode even without the tokens, but **dark mode requires `_billy-tokens`** loaded globally.
- The **`ghost` variant ignores `color`**: it is always neutral (DS input tokens), consistent with its role as the back/secondary button. For a tinted secondary action, use `outline` or `text` instead.
- `type="submit"` is required to trigger a `<form>` submission: the default is `button` (unlike the native HTML `<button>`, whose default is `submit`).
