# billy-sidebar — BillySidebarComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-sidebar.component.*` · standalone component (+ `billy-nav-item`)

## Role

The shell's side menu: renders the list of links provided by `BILLY_SHELL_CONFIG.menuLinks` (section headings + routed links via `billy-nav-item`), displays the dynamic badges (`menuBadges`) and the application version in the footer. Two modes driven by `BillyShellService`: collapsed into an icon column (80px) on desktop, drawer overlaid on the content on mobile. In billy-client the sidebar is never instantiated directly: `BillyShellComponent` places it, and the links come from `src/app/layout/menus-admin-links.ts` via the provider in `src/app/app.config.ts`.

## API — BillySidebarComponent

```ts
import { BillySidebarComponent } from 'billy-layout';
```

Selector: `billy-sidebar`. No input or output: everything comes from the token and the service.

| Member | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | `.collapsed` / `.mobile-open` classes; clicking a link calls `shell.closeMobileSidebar()`. |
| `links` | `BillyMenuLink[]` | `config?.menuLinks ?? []` (read once at construction). |
| `version` | `string` | `config?.version ?? ''` — sidebar footer ("Version x.y.z" when expanded, the bare value when collapsed). |
| `badges` | `computed<Record<string, string \| null>>` | Unwraps `config.menuBadges` (e.g. in-progress Peppol sendings on "Sales"). Key = the menu entry's `text`. |

Consumed tokens: `BILLY_SHELL_CONFIG` (`{ optional: true }`).

Rendering: `@for (item of links; track item.text)` — `item.heading` yields a `<div class="billy-sidebar-heading">`, otherwise a `<billy-nav-item>` with `item.link!`, `item.icon!`, `item.text`, the collapsed state and the optional badge.

## Usage example

The sidebar is fed by the provider in `src/app/app.config.ts`:

```ts
{
  provide: BILLY_SHELL_CONFIG,
  useFactory: (): BillyShellConfig => ({
    menuLinks: MENUS_ADMIN_LINKS,          // src/app/layout/menus-admin-links.ts
    version: environment.version,
    menuBadges: computed(() => {
      const count = peppolLogFactureService.inProgressLogs().length;
      return { Sales: count > 0 ? String(count) : null };
    }),
    // …
  }),
}
```

## Styles & theming (sidebar)

- `:host { display: flex; flex: none; }` — essential: the host must stretch over the full height of the shell body, otherwise the `<nav>` keeps an auto height and the version footer (`margin-top: auto`) stays stuck to the last link.
- Width 250px, 80px when `.collapsed`, transition `.3s cubic-bezier(.4, 0, .2, 1)`; font `'Plus Jakarta Sans'`.
- Headings: uppercase 11px `#9AA7B4`, centered and faded (`opacity: .35`) in collapsed mode.
- Version footer: top border `#E7ECF1`, accent dot `#12B4DD` with `#E6F7FC` halo.
- Mobile (< 767.98px): `position: fixed` below the topbar (`top: 66px`, `z-index: 40`), width forced to `250px !important`, `#F4F6F8` background, slide `translateX(-100%)` → `none` with `.mobile-open`.
- Dark mode via `:host-context(body.dark-mode)`: headings `#64747c`, border `#49545a`, dot halo `rgba(18, 180, 221, .18)`, mobile background `#1e292b`.

---

# billy-nav-item — BillyNavItemComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-nav-item.component.*` · standalone component

## Role

Reusable navigation button of the sidebar: `billy-icon` icon + label, automatic active state (`routerLinkActive="active"`) and optional badge. In collapsed mode it only shows the icon (the label becomes a `title`) and the badge sticks to the corner.

## API

```ts
import { BillyNavItemComponent } from 'billy-layout';
```

Selector: `billy-nav-item`.

| Input | Type | Default | Description |
|---|---|---|---|
| `link` | `string` | required | Route passed to `routerLink`. |
| `icon` | `BillyIconName` | required | `billy-icon` icon (size 21). |
| `label` | `string` | required | Label; used as a tooltip (`title`) when collapsed. |
| `collapsed` | `boolean` | `false` | Icon-only mode. |
| `badge` | `string \| null` | `null` | Badge content; `null` = no badge. |
| `badgeVariant` | `'info' \| 'notification'` | `'info'` | `info`: discreet counter (`--billy-accent-soft` background, `--billy-accent-strong` text) for count information. `notification`: red `#EF4444` dot calling for action (items to process). |

No output: the `(click)` is placed on the host element by the caller (the sidebar uses it to close the mobile drawer).

## Styles & theming (nav-item)

- Pill link with 12px radius, `#5B6B79`, hover `#EAEFF3` with a `translateX(3px)` micro-translation; active `#E6F7FC` / `#0E97BB` in semi-bold.
- `.billy-nav-item-accent`: accent bar `#12B4DD` overflowing to the left (`left: -14px`), visible only when active **and** not collapsed.
- Badge pushed to the right (`margin-left: auto`); `info` variant (default) in soft accent tones (same tokens as the count badges of consult-card/nav-card), `notification` variant in `#EF4444` with white text. In collapsed mode it becomes a dot positioned at the top right of the icon.
- Dark mode via `:host-context(body.dark-mode)`: text `#9fb0ba`, hover `#2a373b`, active `rgba(18, 180, 221, .14)` / `#4fc3e0`.
- The `billy-icon-hover-zone` host class triggers the billy-icon micro-animations on hover.

## Pitfalls & notes

- `links` and `version` are read **once** at construction: `menuLinks`/`version` are not reactive (unlike `menuBadges`, which is a `Signal`). Changing the menu on the fly would require recreating the shell.
- Badges are indexed by the **label** (`item.text`): renaming a menu entry silently breaks its badge (cf. `{ Sales: … }` in app.config.ts).
- On non-heading entries, `link` and `icon` are dereferenced with `!` by the sidebar: an entry without `heading: true` must provide `link` and `icon`.
- `routerLinkActive` without `exact`: a parent link stays active on its sub-routes.
