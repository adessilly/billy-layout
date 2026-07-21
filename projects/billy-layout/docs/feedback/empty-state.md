# billy-empty-state — EmptyStateComponent

> Category `feedback` · source `projects/billy-layout/src/lib/feedback/empty-state/empty-state.component.ts` · standalone component

## Role

Illustrated empty state for lists: an animated SVG illustration specific to each business concept, a title, a subtitle and, for the "creation" types, a CTA button that emits `createClicked`. The texts come from the i18n dictionary (`emptyState.<type>` — title/subtitle/CTA per concept): the caller only provides the `type`. Used in every list of `src/app`: `devis-list`, `vente-list`, `achat-list`, `client-list`, `agenda-list-tab-evenement`, `agenda-list-tab-recurrences` — with the pattern "truly empty list → business type, filter with no results → `search` type".

## API

### Selector & import

```ts
import { EmptyStateComponent, EmptyStateType } from 'billy-layout';
```

Selector: `billy-empty-state`.

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `type` | `input.required<EmptyStateType>()` | — | Illustrated concept; determines the illustration, the texts and the presence of the CTA. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `createClicked` | `output<void>` | Emitted on CTA button click (present only when the type has a `cta`). |

### Illustration types (exhaustive list)

```ts
export type EmptyStateType =
  | 'purchase' | 'sale' | 'quote' | 'client'
  | 'events' | 'recurring' | 'search';
```

| `type` | Illustration | Title | CTA |
|---|---|---|---|
| `purchase` | Torn-edge receipt swept by an AI scan beam, floating € coin | "No purchases" | "Add a purchase" |
| `sale` | Invoice with a pulsing "paid" badge, growth arrow drawing itself, mini bar chart | "No sales" | "Add a sale" |
| `quote` | Document with a handwritten signature tracing itself, animated pen, "pending" clock badge | "No quotes" | "Add a quote" |
| `client` | Trio of "breathing" avatars, dotted orbit in slow rotation, + badge | "No clients" | "Add a client" |
| `events` | Ring-bound calendar with an empty grid | "No events" | "Create an event" |
| `recurring` | Arrowed arc in continuous rotation around a + center, dotted track | "No recurring events" | "Create a recurring event" |
| `search` | Faded ghost results + sweeping "?" magnifier | "No results" | — (no CTA) |

Titles, subtitles and CTAs are the **English values of the i18n dictionary** (`emptyState.*`). Each subtitle is a two-line tagline (`\n` line break, rendered via `white-space: pre-line`), e.g. for `purchase`: "Drop in your purchase invoices, / Billy extracts the data for you". Built-in strings are localizable — see [i18n](../core/i18n.md).

## Usage example

Real-world usage (`src/app/auth/pages/vente/vente-list/vente-list.component.html`):

```html
<billy-empty-state [type]="hasVentes() ? 'search' : 'sale'" (createClicked)="askAdd()"/>
```

If sales exist but the filter returns nothing → `search` illustration (no CTA); if the list is truly empty → `sale` illustration with the creation CTA.

## Styles & theming

- Layout: centered column (`.empty-wrap`), 220 × 187 px SVG, 17 px bold title, 13 px subtitle, CTA in an indigo→violet gradient (`#6366f1 → #8b5cf6`) with elevation on hover.
- Cascading entrance: illustration, title, subtitle then CTA appear with `es-enter` (fade + translation) staggered by 0 / 0.08 / 0.14 / 0.2 s.
- SVG drop shadow (`drop-shadow`) **tinted per concept** via `.empty-wrap--<type>` (coral for purchase, green for sale, amber for quote, violet for client, slate for search).
- Motion design via SVG classes: `es-float` (scene float), `es-sparkle` (sparkles), `es-dot` (out-of-phase decorative dots), `es-pop` (pulsing badges), plus dedicated animations — `es-scan`/`es-coin` (purchase), `es-draw`/`es-bar` (sale), `es-sign`/`es-pen`/`es-hand` (quote), `es-orbit`/`es-bob` (client), `es-rotor` (recurring), `es-sweep` (search).
- Illustration palette hard-coded (no `--billy-*` tokens), but **dark mode** handled via `:host-context(body.dark-mode)`: the generic classes `es-card` / `es-line` / `es-line-stroke` / `es-glow` switch card backgrounds to `#1f2937`, lines to `#374151`, dimmed glow; title/subtitle lightened, drop-shadow removed.
- **`prefers-reduced-motion: reduce`**: all animations (entrances AND SVG loops) are disabled (`animation: none !important`); the `es-draw`/`es-sign` strokes are frozen at their final state (`stroke-dashoffset: 0`) and the `es-scan` beam is hidden (`display: none`) to leave a coherent static scene.

## Pitfalls & notes

- Texts are not configurable per instance: title/subtitle/CTA come from the i18n dictionary (`emptyState.<type>`), overridable globally via `provideBillyI18n` overrides. For a new concept, add the type + copy (in both locales) + SVG `@case` in the component.
- `search` is the only type **without a CTA**: `createClicked` is never emitted there (the button is not rendered, via `@if (copy().cta)`).
- The component defines fixed SVG `clipPath`/ids (`esAvL`, `esAvR`, `esAvM` for `client`): two simultaneous `client` instances would share those ids — no visual effect in practice (identical definitions).
- No size input: the illustration is fixed at 220 px wide; adapt via parent CSS if needed.
- Remember the `type = activeFilter ? 'search' : '<concept>'` pattern used everywhere in the app to distinguish "nothing created" from "nothing found".
