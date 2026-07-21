# billy-page-header — PageHeaderComponent

> Category `display` · source `projects/billy-layout/src/lib/display/page-header/` · standalone component

## Purpose

Standard page header: an `<h1>` title + optional subtitle, an optional "back" button placed before the title, and a projected actions area aligned to the right (`.zone-btn-header`). It is the first element of nearly every authenticated page, most often hosting a `billy-header-action-bar` and/or `billy-tabs size="sm"`.

Usage in `src/app` (verified via grep, 15+ screens): `dashboard`, `achat-consult` / `achat-form` / `achat-list`, `vente-*`, `devis-*`, `agenda-list`, `client-consult` / `client-list`, `compte`, `peppol-inbox`, `prestations-agenda`…

## API

**Selector**: `billy-page-header` · **Import**: `import { PageHeaderComponent } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `title` | `string` (**`input.required`**) | — | Page title (rendered as an `<h1>`). |
| `subtitle` | `string` | `''` | Subtitle displayed below the title (hidden when empty). |
| `backVisible` | `boolean` | `false` | Shows the back button (left chevron), placed before the title. |
| `backLabel` | `string` | i18n `pageHeader.back` (EN `'Back'`) | Tooltip (`title`) and `aria-label` of the back button. When the input is not set, the default comes from the i18n dictionary. |

Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Type | Description |
|---|---|---|
| `back` | `output<void>` | Emitted when the back button is clicked. Navigation is the parent's responsibility. |

## Slots / projection

- `<ng-content>` (default): projected into `.zone-btn-header` (`margin-left: auto`, flex, gap 10px) — action buttons, action bar, tabs…

## Usage example

`achat-consult.component.html`:

```html
<billy-page-header
  [title]="'Purchase'"
  subtitle="Details"
  [backVisible]="true"
  backLabel="Back to purchases"
  (back)="askBack()">

  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>

</billy-page-header>
```

## Styles & theming

- **Hard-coded** colors (no `--billy-*` tokens): title `#1E293B`, subtitle `#94A3B8`, cyan accents `#0E97BB` / `#12B4DD`; font `'Plus Jakarta Sans'`.
- Back button: ghost (transparent) at rest, takes on a white "pill" relief + shadow on hover with `translateX(-2px)` — same visual language as `billy-header-action-bar`; visible focus via `outline`.
- Dark mode via `:host-context(body.dark-mode)`: lightened titles, back button rests on `#1e2b2f`.
- Mobile (`max-width: 767px`): reduced padding, 19px title, enlarged back button (40px, touch target) shown **with** its relief permanently (no hover on touch).
- The container is `flex-wrap: wrap`: on narrow screens the actions area wraps to the next line.

## Gotchas & notes

- The back button **performs no navigation**: wire `(back)` (usually `router.navigate` or `location.back()`).
- `backLabel` feeds both `title` and `aria-label` — the button only shows a chevron, so this label is the only accessible information.
- The component renders an `<h1>`: use it only once per page (semantics/internal SEO).
- Style file in **CSS** (not SCSS) — no `billy-*` mixins available here.
- `implements OnInit` with an empty `ngOnInit()`: historical leftover, no initialization logic.
