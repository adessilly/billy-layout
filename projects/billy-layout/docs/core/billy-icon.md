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

Data-visualisation icons: `stats`, `chart`, `pie-chart`.

Action icons: `send`, `trash`, `download`, `magic`, `clipboard`, `link`.

File-type icons: `file-text`, `file-binary`, `file-image`, `file-archive`.

Status icons: `info`, `warning`, `error`, `bug`.

Banking icons: `bank`, `bank-account`, `bank-statement`, `statement-line`, `debit`, `credit`, `transfer`, `reconcile`, `euro`, `coins`, `banknote`, `credit-card`.

The type also accepts `string` as component input to let dynamic names through, but only the 57 names above produce a drawing.

Usage landmarks for the recent utilities: `chevron-down` (dropdown, open-state rotation driven in CSS by the parent), `close` (close/delete cross — dropdown tags, snackbar), `refresh` (circular "update" arrow, snackbar), `bolt` (lightning bolt on the snackbar's action button), `lock`/`eye`/`eye-off` (password field).

Data-visualisation set — same grammar as the rest (axes and outlines in plain stroke, the data itself animated on hover):

| Name | Drawing | Intended use |
|---|---|---|
| `stats` | Axis pair + three vertical bars of growing height | Statistics/reporting entry points, dashboard tiles, bar-chart blocks |
| `chart` | Axis pair + rising polyline ending on an arrow head | Trends, evolution over time, line-chart blocks |
| `pie-chart` | Circle + a quarter slice drawn by its two radii | Breakdowns, distribution/share blocks |

Their hover micro-animations: `stats` lifts its bars (`anim-rise`), `chart` and `pie-chart` draw their data stroke (`anim-draw` + `anim-draw-19`).

Action set — verbs applied to a document or a selection, typically on a `billy-button` or a row action:

| Name | Drawing | Intended use | Hover animation |
|---|---|---|---|
| `send` | Envelope (rectangle + fold) | Send by email, submit a document to a recipient | `anim-drop` on the fold (the letter slides in) |
| `trash` | Bin with a lid and two grooves | Delete, delete-confirmation dialogs, destructive row action | `anim-lift` on the lid + handle |
| `download` | Downward arrow above an open tray | Download, export (mirror of `upload`) | `anim-drop` on the arrow |
| `magic` | Wand + four-point star + spark | AI/automatic generation, suggestion, auto-fill | `anim-greet` on the star (it twinkles) |
| `clipboard` | Board + clip | Copy to clipboard, paste, "copy the reference" | `anim-lift` on the clip |
| `link` | Two interlocked chain halves | Hyperlink, copy a share link, linked record | `anim-draw` + `anim-draw-16` on both halves |

File-type set — same document outline (folded top-right corner), the content marks tell the format apart:

| Name | Drawing | Intended use | Hover animation |
|---|---|---|---|
| `file-text` | Document + two text lines | Text/plain document, `.txt`, `.csv`, unknown text attachment | `anim-draw` + `anim-draw-11` on the lines |
| `file-binary` | Document + the digits `1` and `0` | Binary/unreadable file, `.bin`, raw payload | `anim-greet` on the digits |
| `file-image` | Document + sun and mountains | Image attachment (`.png`, `.jpg`, …), thumbnails | `anim-greet` on the sun |
| `file-archive` | Document + zip slider and its pull tab | Archive (`.zip`, `.7z`), multi-file bundle | `anim-drop` on the zip teeth |

Status set — severity markers. They carry **no colour of their own** (`currentColor`, like the rest of the set): set the tone on the container, e.g. `color: var(--billy-danger)` for `error`. Pair them with a text label, the SVG being `aria-hidden`:

| Name | Drawing | Intended use | Hover animation |
|---|---|---|---|
| `info` | Circle + lowercase "i" (filled dot) | Informative message, help tooltip, neutral banner | `anim-greet` on the dot |
| `warning` | Triangle + exclamation mark | Warning, non-blocking risk, "check this before saving" | `anim-greet` on the exclamation |
| `error` | Circle + cross | Error, failure, blocking validation | `anim-greet` on the cross |
| `bug` | Beetle (body, antennae, legs) | Bug report, debug/diagnostics panel, technical log | `anim-greet` on the antennae |

Banking set — bank accounts, statements and their lines, cash flow direction. Same grammar as the rest: outlines in plain stroke, the meaningful part animated on hover. They carry no colour of their own: tint `debit`/`credit` on the container (e.g. `color: var(--billy-danger)` / `var(--billy-success)`) when the direction must read at a glance.

| Name | Drawing | Intended use | Hover animation |
|---|---|---|---|
| `bank` | Bank building (pediment, three columns, base) | Bank/financial institution, "bank" section, bank selection | `anim-lift` on the roof |
| `bank-account` | Passbook (spine + `€`) | A bank account, account list, account picker | `anim-greet` on the `€` |
| `bank-statement` | Document with folded corner + three label/amount rows | A statement (CODA, CSV import, PDF statement), statement list | `anim-draw` + `anim-draw-19` on the rows |
| `statement-line` | One highlighted row between two neighbouring rows | A single statement line, line detail, line-level action | `anim-draw` + `anim-draw-11` on the row content |
| `debit` | Circle + downward arrow | Debit, money out, outgoing amount (mirror of `credit`) | `anim-drop` on the arrow |
| `credit` | Circle + upward arrow | Credit, money in, incoming amount (mirror of `debit`) | `anim-rise` on the arrow |
| `transfer` | Two opposite horizontal arrows | Transfer, account-to-account move, payment order | `anim-lift` / `anim-drop` on the two arrows |
| `reconcile` | Two rows + checkmark | Bank reconciliation, matching a line with an invoice, "lettrage" | `anim-draw` + `anim-draw-16` on the checkmark |
| `euro` | `€` symbol | Amount, currency, monetary field or column | `anim-greet` on the two bars |
| `coins` | Stack of two coins | Cash, balance, funds, treasury | `anim-lift` on the top coin |
| `banknote` | Banknote (frame + central medallion) | Cash payment, payment method, cash flow | `anim-greet` on the medallion |
| `credit-card` | Card + magnetic stripe | Card payment, payment means, card management | `anim-draw` + `anim-draw-19` on the stripe |

`debit`/`credit` reuse the arrow grammar of `purchases`/`sales`, but enclosed in a circle: use the pair on statement lines and amounts, and keep `purchases`/`sales` for the business navigation.

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
- **Hover micro-animations**: tagged fragments (`anim-drop`, `anim-rise`, `anim-lift`, `anim-greet`, `anim-draw`) animate when an **ancestor carrying the `.billy-icon-hover-zone` class** is hovered (via `:host-context(.billy-icon-hover-zone:hover)`). Examples: `purchases` (arrow diving in), `sales`/`stats` (bars and arrow rising), `clients` (the arc "waves"), `quotes`/`services`/`chart`/`pie-chart`/`file-text`/`link` (stroke drawing itself, `stroke-dasharray`), `trash`/`clipboard`/`coins` (the lid, the clip and the top coin lift), `magic`/`file-binary`/`file-image`/`info`/`warning`/`error`/`bug`/`bank-account`/`banknote`/`euro` (the star, the digits, the sun, the severity marks and the monetary marks pop), `debit`/`credit`/`transfer` (the arrows shift in their direction).
- **`anim-draw` lengths**: a self-drawing stroke needs a companion class giving its approximate path length — `anim-draw-11`, `anim-draw-16`, `anim-draw-19` (`--draw-length`). Pick the one just above the real length, otherwise the stroke never fully disappears at the start of the animation.
- **Accessibility**: the SVG carries `aria-hidden="true"` (decorative icon — provide a text label next to it) and all animations are disabled under `prefers-reduced-motion`.

## Pitfalls & notes

- Unknown `name` = invisible icon but rendered SVG (the `size × size` space is reserved). Check the spelling, there is no warning.
- Animations do **not** trigger when hovering the icon itself: put `.billy-icon-hover-zone` on the clickable container (button, nav link) — this is what `billy-nav-item` does in the shell.
- Purely presentational component, stateless: no particular zoneless constraint, all inputs are signals.
- To add an icon: add the literal to the `BillyIconName` type **and** a `@case` in the template; stick to the set's grammar (viewBox 24, ~1.9 stroke, rounded corners).
