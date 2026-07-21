# billy-action-bar — ActionBarComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/action-bar/` · standalone component

## Role

iOS-style floating mobile navigation dock: a glass pill (blur + saturation) fixed at the bottom of the screen, with an active halo that slides between tabs and `billy-icon` icons (same symbols as the side menu) replaying their micro-animations on activation. The library knows nothing about routes: each tab provides its activation test (`isActive(url)`) and its navigation action (`go()`). In billy-client, the bar is placed by `src/app/auth/pages/auth-page.component.html` (outside the shell, behind the `billyConfig.showActionBar` condition) and is only shown below 768px (rule in `auth-page.component.scss`).

## API

```ts
import { ActionBarComponent, BillyActionBarTab } from 'billy-layout';
```

Selector: `billy-action-bar`.

### BillyActionBarTab interface

```ts
interface BillyActionBarTab {
  icon: BillyIconName;              // billy-icon icon (also used as the track key)
  label: string;                    // label below the icon
  isActive: (url: string) => boolean; // is the tab active for this URL?
  go: () => void;                   // navigation on click
}
```

### Inputs / members

| Input | Type | Default | Description |
|---|---|---|---|
| `tabs` | `BillyActionBarTab[]` | required | The tabs, in display order. |

No output.

The `<nav>`'s `aria-label` comes from the i18n dictionary (`actionBar.mainNavigation`, EN "Main navigation"). Built-in strings are localizable — see [i18n](../core/i18n.md).

| Public member | Type | Description |
|---|---|---|
| `activeIndex` | `signal<number>` | Index of the active tab, `-1` if the current URL matches no tab. |
| `pillTransform` | `computed<string>` | `translateX(n * 100%)` of the halo; falls back to the last active index when `activeIndex() < 0`, so the halo fades out **in place** instead of jumping to position 0. |
| `refreshNav(url)` | `void` | Recomputes the active index (called on init and on every `NavigationEnd`). |
| `router` | `Router` | Injected (subscription to `NavigationEnd`). |

## Slots / projection

No `ng-content`: the rendering is entirely driven by `tabs`.

## Usage example

Real-world tabs, `src/app/auth/pages/auth-page.component.ts`:

```ts
/** Tabs of the mobile navigation bar (billy-action-bar, billy-layout). */
readonly actionBarTabs: BillyActionBarTab[] = [
  {
    icon: 'home', label: 'Home',
    isActive: url => url === '/auth' || url === '/auth/home' || url === '/auth/dashboard',
    go: () => this.routeurUtilsService.toAuthPage(),
  },
  {
    icon: 'purchases', label: 'Purchases',
    isActive: url => url === '/auth/achat/list',
    go: () => this.routeurUtilsService.toAchatPage(),
  },
  {
    icon: 'sales', label: 'Sales',
    isActive: url => url === '/auth/vente/list',
    go: () => this.routeurUtilsService.toVentePage(),
  },
  {
    icon: 'calendar', label: 'Calendar',
    isActive: url => url.startsWith('/auth/agenda'),
    go: () => this.routeurUtilsService.toAgendaPage(),
  },
];
```

And in `auth-page.component.html`:

```html
@if (billyConfig.showActionBar) {
  <billy-action-bar class="billy-action-bar" [tabs]="actionBarTabs"></billy-action-bar>
}
```

## Styles & theming

- Shell: `position: fixed`, centered, `bottom: calc(14px + env(safe-area-inset-bottom))`, width `min(calc(100% - 28px), 400px)`, `z-index: 200` (above the topbar at 50, below action-sheet at 500). Glass: `rgba(255,255,255,.78)` + `backdrop-filter: blur(28px) saturate(190%)`, animated entrance from the bottom (`ab-enter`).
- `.tab-pill` halo: `width: calc(100% / 4)` — **coded for 4 tabs**; it slides via `pillTransform` and switches to `.tab-pill-off` (fade + scale .72) when no tab matches. Colors via tokens: `var(--billy-accent-soft, #e6f7fc)` (halo) and `var(--billy-accent-strong, #0e97bb)` (active tab) — those variables switch on their own via `body.dark-mode`.
- Activation: icon bounce (`ab-pop`) then a micro-gesture specific to each symbol via the `.anim-lift/-drop/-rise` tags set by billy-icon (`::ng-deep`).
- Dark mode via `:host-context(body.dark-mode)`: only the shell has an override (`rgba(23,34,36,.82)`); specificity note — the inactive color is scoped `.tab:not(.is-active)` so it does not clobber the active color.
- `prefers-reduced-motion`: entrance, sliding and icon animations disabled.
- The mobile-only display and content clearance are **not** handled by the component: billy-client hides the bar ≥ 768px and adds a padding-bottom to the shell via `.has-action-bar` in `auth-page.component.scss`.

## Pitfalls & notes

- The halo's `width: calc(100% / 4)` assumes exactly 4 tabs; passing another count requires adapting the SCSS (comment in place: "= number of tabs in tabs[]").
- The `@for` tracks on `tab.icon`: two tabs with the same icon would break the rendering — icons must be unique.
- The `isActive` callbacks are evaluated against the raw `router.url` (query params included): prefer `startsWith` when the page has sub-routes or parameters.
- The router events subscription (`ngOnInit`) is never unsubscribed — harmless in billy-client where the bar lives as long as `auth-page`, but worth knowing if the component were mounted/unmounted frequently.
- When the URL matches no tab, the halo fades out gently on the last active tab (`lastIndex`): intended behavior, not a bug.
