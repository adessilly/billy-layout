# billy-shell — BillyShellComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/shell` · standalone component (+ `BillyShellService` service + `BILLY_SHELL_CONFIG` token)

## Role

BILLy's application shell: assembles the topbar (`billy-topbar`), the collapsible sidebar (`billy-sidebar`) and the scrollable content area in a full-screen flex column (`100dvh`, no footer). It is the entry point of the `layout` category: billy-client instantiates it once in `src/app/auth/pages/auth-page.component.html`, with a `<router-outlet>` projected as content. The library knows neither the routes nor the business services: everything that depends on them goes through the `BILLY_SHELL_CONFIG` token (provided in `src/app/app.config.ts`) and through three projection slots re-projected to the topbar.

## API

### BillyShellComponent

```ts
import { BillyShellComponent } from 'billy-layout';
```

Selector: `billy-shell`.

No input or output. The component publicly exposes:

| Member | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | Injected and read by the template (mobile backdrop). |

### BillyShellService (`billy-shell.service.ts`)

`providedIn: 'root'` service: shared topbar ↔ sidebar state.

| Member | Type | Description |
|---|---|---|
| `sidebarCollapsed` | `signal<boolean>` | Sidebar collapsed (icon mode, 80px). Persisted in localStorage under the key `billy-shell.sidebar-collapsed` via an `effect`. |
| `mobileSidebarOpen` | `signal<boolean>` | On mobile, the sidebar becomes a drawer overlaid on the content. |
| `toggleSidebar()` | `void` | If `window.innerWidth < 768` toggles `mobileSidebarOpen`, otherwise toggles `sidebarCollapsed`. Called by the topbar burger. |
| `closeMobileSidebar()` | `void` | Closes the mobile drawer (click on the backdrop or on a menu link). |

### BILLY_SHELL_CONFIG (`billy-shell-config.ts`)

```ts
import { BILLY_SHELL_CONFIG, BillyShellConfig, BillyMenuLink } from 'billy-layout';
```

`InjectionToken<BillyShellConfig>` token consumed (as `{ optional: true }`) by the topbar, the sidebar and the notifications panel. All fields except `menuLinks` are optional — without them, the corresponding feature is simply inert.

```ts
interface BillyMenuLink {
  text: string;          // label (also used as the key for menuBadges)
  heading?: boolean;     // true = section heading (not a link)
  link?: string;         // route (routerLink)
  icon?: BillyIconName;  // billy-icon icon
}

interface BillyShellConfig {
  menuLinks: BillyMenuLink[];                          // sidebar links
  version?: string;                                    // sidebar footer
  homeLink?: string;                                   // logo target (default '/')
  logout?: () => void;                                 // "Log out" button
  menuBadges?: Signal<Record<string, string | null>>;  // badges per entry label
  syncNotifications?: () => Promise<unknown>;          // global sync (bell)
}
```

## Slots / projection

The shell projects four contents:

| Slot | Destination | billy-client content |
|---|---|---|
| `[shell-search]` | topbar (search zone, after the logo) | `<app-billy-search shell-search />` |
| `[shell-notifications]` | topbar (right-hand actions) | `<billy-notifications shell-notifications>…</billy-notifications>` |
| `[shell-account]` | topbar (after the divider) | `<app-billy-account-menu shell-account />` |
| default (`<ng-content />`) | `<main class="billy-shell-content">` | the page (`<router-outlet>`) |

The three business slots are **re-projected** to `billy-topbar` via `<ng-container ngProjectAs="[shell-search]">…`: a re-projected `<ng-content select>` as-is would not match the next level's selector without `ngProjectAs`.

## Usage example

Real-world assembly, `src/app/auth/pages/auth-page.component.html`:

```html
<billy-shell [class.has-action-bar]="billyConfig.showActionBar">

  <!-- Business zones of the topbar, projected into the shell (billy-layout). -->
  <app-billy-search shell-search />

  <billy-notifications shell-notifications>
    <app-billy-notif-achats-peppol />
    <app-billy-notif-envois-peppol />
    <app-billy-notif-ventes-impayees />
  </billy-notifications>

  <app-billy-account-menu shell-account />

  <router-outlet></router-outlet>
</billy-shell>
```

Configuration provider, `src/app/app.config.ts`:

```ts
{
  provide: BILLY_SHELL_CONFIG,
  useFactory: (): BillyShellConfig => {
    const peppolLogFactureService = inject(PeppolLogFactureService);
    const peppolInboxService = inject(PeppolInboxService);
    const routeurUtilsService = inject(RouteurUtilsService);
    return {
      menuLinks: MENUS_ADMIN_LINKS,
      version: environment.version,
      homeLink: '/auth/home',
      logout: () => routeurUtilsService.toLogoutPage(),
      menuBadges: computed(() => {
        const count = peppolLogFactureService.inProgressLogs().length;
        return { Sales: count > 0 ? String(count) : null };
      }),
      syncNotifications: () => lastValueFrom(peppolInboxService.syncPeppolInbox()),
    };
  },
},
```

## Styles & theming

- `.billy-shell`: flex column `height: 100dvh`, `#F4F6F8` background, `overflow: hidden` — only `.billy-shell-content` scrolls (`overflow-y: auto`, padding `0 24px 24px 8px`, reduced to `0 12px 16px` below 768px).
- Dark mode via `:host-context(body.dark-mode)`: `#1e292b` background. The `dark-mode` class is set on the `<body>` by `BillyDarkModeService` (see billy-topbar.md).
- `.billy-shell-backdrop`: `rgba(15, 23, 42, .35)` veil fixed below the topbar (`top: 66px`, `z-index: 30`) when `mobileSidebarOpen()` is true; a click closes the drawer.
- Single breakpoint: `767.98px` (aligned with the service's `window.innerWidth < 768` test).

## Pitfalls & notes

- `BILLY_SHELL_CONFIG` is injected everywhere as optional: forgetting the provider breaks nothing but yields an empty sidebar, a logo pointing to `/` and inert buttons.
- The collapsed state survives reloads (localStorage `billy-shell.sidebar-collapsed`), the mobile state does not.
- The shell content has no padding-bottom for the mobile bar: billy-client adds it itself via the `.has-action-bar` class set on `<billy-shell>` and a `::ng-deep .has-action-bar .billy-shell-content` rule in `auth-page.component.scss` (see action-bar.md).
- `menuBadges` is a `Signal` (typically a `computed`): badges update on their own, no need to re-provide.
- The shell renders no footer; the app version is displayed in the sidebar footer.
