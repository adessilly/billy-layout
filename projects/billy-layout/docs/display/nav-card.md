# billy-nav-card — NavCardComponent

> Category `display` · source `projects/billy-layout/src/lib/display/nav-card/` · standalone component

## Purpose

Navigation card: a clickable tile with an icon chip (`billy-icon` set), a label, an optional count badge, a short description and a "go to" chevron revealed on hover. It is the building block for entry-point grids — a hub, a home screen, a section index.

It is an **attribute selector** applied to `<a>` or `<button>`: navigation (`routerLink`, `href`, `(click)`) stays on the consumer's host element; the card is just the dressing. The library therefore has no dependency on the Router.

Usage on the site: the home page category grid (`src/app/pages/home/`), one card per `DOC_CATEGORIES` entry.

## API

**Selector**: `a[billy-nav-card]`, `button[billy-nav-card]` · **Import**: `import { NavCardComponent } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` (**`input.required`**) | — | Main card label. |
| `icon` | `BillyIconName` (**`input.required`**) | — | Chip icon (`billy-icon` set, not FontAwesome). |
| `description` | `string` | `''` | Short description below the label. Empty string = line hidden. |
| `badge` | `number \| null` | `null` | Numeric badge after the label (cyan chip). `null` = no badge — a `0` does display. |
| `chevron` | `boolean` | `true` | Shows the chevron revealed on hover. |
| `stagger` | `number` | `0` | Appearance index: offsets the entrance animation by 60 ms per card. |

### Outputs

None — the click belongs to the host element (`routerLink`, `href` or `(click)`).

## Slots / projection

None: all content goes through the inputs.

## Usage example

`home-page.component.html` (category grid):

```html
<div class="cats-grid">
  @for (category of categories; track category.slug; let i = $index) {
    <a billy-nav-card
       [routerLink]="['/c', category.slug]"
       [label]="category.label"
       [icon]="category.icon"
       [description]="category.intro"
       [badge]="category.entries.length"
       [stagger]="i"></a>
  }
</div>
```

```scss
.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  --billy-nav-card-base-delay: 200ms; // cards arrive after the hero
}
```

As a `<button>` (action without navigation):

```html
<button type="button" billy-nav-card label="Export" icon="open"
        description="Generate the quarter's accounting file." (click)="export()"></button>
```

## Styles & theming

- `:host` (the `<a>`/`<button>` itself): `--billy-surface` surface, `--billy-surface-border` border, 16px radius, `--billy-card-shadow` shadow; on hover, −3 px translation, `--billy-accent-border` border and `--billy-surface-shadow` shadow.
- Chip: `--billy-accent-soft` (background) / `--billy-accent-strong` (icon) / `--billy-accent-border` (border); badge on the same tokens; label `--billy-section-title`; description `--billy-text-soft`; chevron `--billy-accent`.
- **Entrance animation** (fade + translation): delay = `stagger × 60ms + var(--billy-nav-card-base-delay, 0ms)`. The container can set `--billy-nav-card-base-delay` to synchronize the cascade with the rest of the page. Disabled under `prefers-reduced-motion`.
- Keyboard focus: `:focus-visible` ring on `--billy-focus-border` (outline offset by 2 px).
- **Dark mode fully carried by the `--billy-*` tokens** — no local dark block.

## Gotchas & notes

- **Do not self-close the host**: `<a billy-nav-card … />` is rejected by the compiler (native element) — write `</a>`.
- `icon` expects a `BillyIconName` (in-house SVG icons), not a FontAwesome class like `billy-consult-card`.
- The badge check is `badge() !== null`: passing `0` does display "0"; use `null` to hide it.
- The entrance animation uses `animation-fill-mode: backwards` (not `both`): once played, it must no longer override the hover `transform`.
- When used as a `<button>`, remember `type="button"` to avoid submitting a parent form.
- Do not confuse it with `billy-consult-card` (a titled **content** card with projection) or `billy-add-button` (an "add" **action** tile): `billy-nav-card` is the **navigation** tile.
