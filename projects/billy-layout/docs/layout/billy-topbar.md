# billy-topbar — BillyTopbarComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-topbar.component.*` · standalone component (+ `BillyDarkModeService` service)

## Role

Top bar of the shell (66px): animated burger that collapses/expands the sidebar, clickable logo, search zone, then a right-hand action row (dark mode toggle, notifications, divider, account menu, logout). The business zones — global search, notification bell, account menu — are unknown to the library: they are projected by the application via the `[shell-search]`, `[shell-notifications]` and `[shell-account]` slots, passed through by `billy-shell` (`ngProjectAs` re-projection). In billy-client, the topbar is never used on its own: it is instantiated by `BillyShellComponent`.

## API

```ts
import { BillyTopbarComponent } from 'billy-layout';
```

Selector: `billy-topbar`.

| Input | Type | Default | Description |
|---|---|---|---|
| `logo` | `string \| BillyShellLogo` | `BILLY_SHELL_CONFIG.logo`, then the BILLy logo | Logo image: a bare URL, or a `{ src, alt, srcDark }` descriptor. |
| `logoTemplate` | `TemplateRef<unknown>` | — | Fully custom logo markup (inline SVG, wordmark…). Wins over `logo`. |

No output.

| Member | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | Burger: `shell.toggleSidebar()`, `.collapsed` class bound to `shell.sidebarCollapsed()`. |
| `theme` | `BillyDarkModeService` | Initialized in `ngOnInit()` (`theme.init()`). |
| `homeLink` | `string` | `config?.homeLink ?? '/'` — logo target. |
| `toggleDarkMode()` | `void` | Delegates to `theme.toggle()`. |
| `logout()` | `void` | Delegates to `config?.logout?.()` (no-op without config). |

Consumed tokens: `BILLY_SHELL_CONFIG` (`{ optional: true }`) for `homeLink`, `logo` and `logout`.

## Logo

Three levels, from the simplest to the most flexible — each one wins over the next:

1. **`logoTemplate`** (input, forwarded by `billy-shell`): any markup, styled by the application.
2. **`logo`** (input, forwarded by `billy-shell`): `'assets/brand/acme.svg'` or `{ src, alt, srcDark }`.
3. **`BILLY_SHELL_CONFIG.logo`**: the same value, set once at bootstrap — the usual place for an application-wide logo.

```ts
export interface BillyShellLogo {
  src: string;       // image URL (relative, absolute or data URI)
  alt?: string;      // alternative text — default 'BILLy'
  srcDark?: string;  // variant used while dark mode is on — default src
}
```

```ts
// app.config.ts
{
  provide: BILLY_SHELL_CONFIG,
  useValue: {
    menuLinks: MENU_LINKS,
    logo: { src: 'assets/brand/acme.svg', alt: 'Acme', srcDark: 'assets/brand/acme-dark.svg' },
  } satisfies BillyShellConfig,
}
```

```html
<!-- Per-instance override, or fully custom markup -->
<billy-shell logo="assets/brand/acme.svg">…</billy-shell>

<billy-shell [logoTemplate]="brand">…</billy-shell>
<ng-template #brand><img src="assets/brand/acme.svg" alt="Acme" class="my-logo" /></ng-template>
```

Without any of the three, the bar keeps rendering `assets/images/icon-384.png` with `alt="BILLy"` — existing applications are unaffected.

An application image is rendered with the `.custom` class: 38px high, free ratio, without the BILLy square/radius/shadow (see *Styles & theming*). Content passed via `logoTemplate` belongs to the application's style scope: the bar only caps it at `max-height: 44px`. Set `alt=""` (empty string) to make a purely decorative logo invisible to screen readers — the `title` on the surrounding link already announces "Home".

The bar's tooltips (`title` attributes) come from the i18n dictionary: burger `topbar.toggleMenu` (EN "Collapse / expand the menu"), logo `topbar.home` (EN "Home"), theme toggle `topbar.darkMode` (EN "Light / dark mode"), logout `topbar.logout` (EN "Log out"). Built-in strings are localizable — see [i18n](../core/i18n.md).

## Slots / projection

| Slot | Location in the bar |
|---|---|
| `[shell-search]` | `.billy-topbar-search`, left-aligned right after the logo (hidden < 768px). |
| `[shell-notifications]` | Inside `<ul class="billy-topbar-actions">`, between the dark mode toggle and the divider. The content must be an `<li>` (which is the case for `billy-notifications`). |
| `[shell-account]` | After the divider, before the logout button. |

These slots are filled from `billy-shell` (see billy-shell.md) — the application never places its content directly inside `<billy-topbar>`.

## Usage example

On the application side, the slots are set on the shell (`src/app/auth/pages/auth-page.component.html`):

```html
<billy-shell>
  <app-billy-search shell-search />
  <billy-notifications shell-notifications>…</billy-notifications>
  <app-billy-account-menu shell-account />
  <router-outlet></router-outlet>
</billy-shell>
```

## Styles & theming

- Fixed 66px height, transparent background (the shell's), font `'Plus Jakarta Sans'`, `z-index: 50` — above page chrome (sticky bars 3-20), below application overlays (action-bar 200, action-sheet 500, modals).
- Burger: 3 bars that shorten on hover; accent `#0E97BB` bars when the sidebar is collapsed (`.collapsed`).
- Logo: the default BILLy image is a 38×38 square (radius 11px, cyan shadow). An application image (`logo` / config) gets the `.custom` class instead — 38px high, free ratio (`max-width: 180px`, `object-fit: contain`), no radius and no shadow. `logoTemplate` content is only capped at `max-height: 44px`.
- Projected actions are styled via `::ng-deep .nav-item > .nav-link` (38×38, 10px radius, hover `#EAEFF3`) and a red `.badge` style (`#EF4444`) — the projected content does not carry the topbar's scope attribute, hence the `::ng-deep`.
- Mobile (< 768px): reduced padding, `.billy-topbar-search` set to `display: none`.
- Light / dark toggle (`.btn-toggle-dark-mode`): the icon rotates 180° (`transition: transform .5s ease`) when switching to dark mode — carried over from the historical app's behavior. Rotation neutralized under `prefers-reduced-motion: reduce`.
- Dark mode via `:host-context(body.dark-mode)`: burger bars `#ced0d2` (accent `#4fc3e0`), divider `#49545a`, hovers `#2a373b`, toggle icon in `rotate(180deg)`.

## BillyDarkModeService (`billy-dark-mode.service.ts`)

> `providedIn: 'root'` service — `import { BillyDarkModeService } from 'billy-layout';`

The shell's dark theme: localStorage persistence + a **`dark-mode` class on the `<body>`** — this is the class all library stylesheets hook into (`:host-context(body.dark-mode)`), along with the application's global stylesheets.

| Member | Type | Description |
|---|---|---|
| `darkMode` | `signal<boolean>` | Initialized from localStorage. |
| `init()` | `void` | Applies the persisted preference to the `<body>`. Called by the topbar in its `ngOnInit`. |
| `toggle()` | `void` | Inverts the signal, persists, updates the body class. |

- localStorage key: **`billy_dark_mode`** (value `'true'`/`'false'`). The key is carried over from the historical app (ex-`LocalService`): existing user preferences keep being read.
- The class is set via `document.body.classList.toggle('dark-mode', …)` — no `data-theme`, no `prefers-color-scheme`: the choice is purely manual.

## Pitfalls & notes

- `theme.init()` is only called by the topbar: a page rendered **without** the shell (e.g. login screen) will not get the `dark-mode` class on the body until the service is initialized elsewhere.
- Without `logo` / `logoTemplate` / `BILLY_SHELL_CONFIG.logo`, the logo points to `assets/images/icon-384.png`: the asset must then exist in the host application.
- The logo is a plain `<img>`, not `NgOptimizedImage`: the URL comes from the application and may be a data URI, which `NgOptimizedImage` does not support.
- The notifications slot is projected into a `<ul>`: projecting anything other than an `<li>` (or a host styled as a flex item) breaks the semantics; a `::ng-deep li { list-style: none; }` reset is already in place.
- `logout` and `homeLink` come from `BILLY_SHELL_CONFIG`; without the provider, the logo leads to `/` and the logout button does nothing.
