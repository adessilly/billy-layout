# billy-shell — BillyShellComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/shell` · standalone component (+ service `BillyShellService` + token `BILLY_SHELL_CONFIG`)

## Rôle

Coque applicative de BILLy : assemble la topbar (`billy-topbar`), la sidebar repliable (`billy-sidebar`) et la zone de contenu scrollable dans une colonne flex plein écran (`100dvh`, pas de footer). C'est le point d'entrée de la catégorie `layout` : billy-client l'instancie une seule fois dans `src/app/auth/pages/auth-page.component.html`, avec un `<router-outlet>` projeté comme contenu. La librairie ne connaît ni les routes ni les services métier : tout ce qui en dépend passe par le token `BILLY_SHELL_CONFIG` (fourni dans `src/app/app.config.ts`) et par trois slots de projection re-projetés vers la topbar.

## API

### BillyShellComponent

```ts
import { BillyShellComponent } from 'billy-layout';
```

Sélecteur : `billy-shell`.

Aucun input ni output. Le composant expose publiquement :

| Membre | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | Injecté et lu par le template (backdrop mobile). |

### BillyShellService (`billy-shell.service.ts`)

Service `providedIn: 'root'` : état partagé topbar ↔ sidebar.

| Membre | Type | Description |
|---|---|---|
| `sidebarCollapsed` | `signal<boolean>` | Sidebar repliée (mode icônes, 80px). Persisté dans le localStorage sous la clé `billy-shell.sidebar-collapsed` via un `effect`. |
| `mobileSidebarOpen` | `signal<boolean>` | Sur mobile, la sidebar devient un tiroir superposé au contenu. |
| `toggleSidebar()` | `void` | Si `window.innerWidth < 768` bascule `mobileSidebarOpen`, sinon bascule `sidebarCollapsed`. Appelé par le burger de la topbar. |
| `closeMobileSidebar()` | `void` | Ferme le tiroir mobile (clic sur le backdrop ou sur un lien du menu). |

### BILLY_SHELL_CONFIG (`billy-shell-config.ts`)

```ts
import { BILLY_SHELL_CONFIG, BillyShellConfig, BillyMenuLink } from 'billy-layout';
```

Token `InjectionToken<BillyShellConfig>` consommé (en `{ optional: true }`) par la topbar, la sidebar et le panneau de notifications. Tous les champs sauf `menuLinks` sont optionnels — sans eux, la fonctionnalité correspondante est simplement inerte.

```ts
interface BillyMenuLink {
  text: string;          // libellé (sert aussi de clé pour menuBadges)
  heading?: boolean;     // true = heading de section (pas de lien)
  link?: string;         // route (routerLink)
  icon?: BillyIconName;  // icône billy-icon
}

interface BillyShellConfig {
  menuLinks: BillyMenuLink[];                          // liens de la sidebar
  version?: string;                                    // pied de sidebar
  homeLink?: string;                                   // cible du logo (défaut '/')
  logout?: () => void;                                 // bouton « Me déconnecter »
  menuBadges?: Signal<Record<string, string | null>>;  // badges par libellé d'entrée
  syncNotifications?: () => Promise<unknown>;          // synchro globale (cloche)
}
```

## Slots / projection

Le shell projette quatre contenus :

| Slot | Destination | Contenu côté billy-client |
|---|---|---|
| `[shell-search]` | topbar (zone recherche, après le logo) | `<app-billy-search shell-search />` |
| `[shell-notifications]` | topbar (actions à droite) | `<billy-notifications shell-notifications>…</billy-notifications>` |
| `[shell-account]` | topbar (après le divider) | `<app-billy-account-menu shell-account />` |
| défaut (`<ng-content />`) | `<main class="billy-shell-content">` | la page (`<router-outlet>`) |

Les trois slots métier sont **re-projetés** vers `billy-topbar` via `<ng-container ngProjectAs="[shell-search]">…` : un `<ng-content select>` re-projeté tel quel ne matcherait pas le sélecteur du niveau suivant sans `ngProjectAs`.

## Exemple d'utilisation

Assemblage réel, `src/app/auth/pages/auth-page.component.html` :

```html
<billy-shell [class.has-action-bar]="billyConfig.showActionBar">

  <!-- Zones métier de la topbar, projetées dans le shell (billy-layout). -->
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

Provider de configuration, `src/app/app.config.ts` :

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
        return { Ventes: count > 0 ? String(count) : null };
      }),
      syncNotifications: () => lastValueFrom(peppolInboxService.syncPeppolInbox()),
    };
  },
},
```

## Styles & theming

- `.billy-shell` : colonne flex `height: 100dvh`, fond `#F4F6F8`, `overflow: hidden` — seul `.billy-shell-content` scrolle (`overflow-y: auto`, padding `0 24px 24px 8px`, réduit à `0 12px 16px` sous 768px).
- Dark mode via `:host-context(body.dark-mode)` : fond `#1e292b`. La classe `dark-mode` est posée sur le `<body>` par `BillyDarkModeService` (voir billy-topbar.md).
- `.billy-shell-backdrop` : voile `rgba(15, 23, 42, .35)` fixé sous la topbar (`top: 66px`, `z-index: 30`) quand `mobileSidebarOpen()` est vrai ; un clic ferme le tiroir.
- Breakpoint unique : `767.98px` (aligné avec le test `window.innerWidth < 768` du service).

## Pièges & notes

- `BILLY_SHELL_CONFIG` est injecté partout en optionnel : oublier le provider ne casse rien mais donne une sidebar vide, un logo pointant sur `/` et des boutons inertes.
- L'état replié survit au rechargement (localStorage `billy-shell.sidebar-collapsed`), l'état mobile non.
- Le contenu du shell n'a pas de padding-bottom pour la barre mobile : billy-client l'ajoute lui-même via la classe `.has-action-bar` posée sur `<billy-shell>` et une règle `::ng-deep .has-action-bar .billy-shell-content` dans `auth-page.component.scss` (voir action-bar.md).
- `menuBadges` est un `Signal` (typiquement un `computed`) : les badges se mettent à jour tout seuls, pas besoin de re-provider.
- Le shell ne rend pas de footer ; la version d'app s'affiche en pied de sidebar.
