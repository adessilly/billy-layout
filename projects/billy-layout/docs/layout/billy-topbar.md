# billy-topbar — BillyTopbarComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-topbar.component.*` · standalone component (+ service `BillyDarkModeService`)

## Rôle

Barre supérieure du shell (66px) : burger animé qui replie/déplie la sidebar, logo cliquable, zone de recherche, puis rangée d'actions à droite (toggle dark mode, notifications, divider, menu du compte, déconnexion). Les zones métier — recherche globale, cloche de notifications, menu du compte — ne sont pas connues de la librairie : elles sont projetées par l'application via les slots `[shell-search]`, `[shell-notifications]` et `[shell-account]`, transmis par `billy-shell` (re-projection `ngProjectAs`). Dans billy-client, la topbar n'est jamais utilisée seule : elle est instanciée par `BillyShellComponent`.

## API

```ts
import { BillyTopbarComponent } from 'billy-layout';
```

Sélecteur : `billy-topbar`.

Aucun input ni output.

| Membre | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | Burger : `shell.toggleSidebar()`, classe `.collapsed` liée à `shell.sidebarCollapsed()`. |
| `theme` | `BillyDarkModeService` | Initialisé dans `ngOnInit()` (`theme.init()`). |
| `homeLink` | `string` | `config?.homeLink ?? '/'` — cible du logo. |
| `toggleDarkMode()` | `void` | Délègue à `theme.toggle()`. |
| `logout()` | `void` | Délègue à `config?.logout?.()` (no-op sans config). |

Tokens consommés : `BILLY_SHELL_CONFIG` (`{ optional: true }`) pour `homeLink` et `logout`.

## Slots / projection

| Slot | Emplacement dans la barre |
|---|---|
| `[shell-search]` | `.billy-topbar-search`, aligné à gauche juste après le logo (masqué < 768px). |
| `[shell-notifications]` | Dans `<ul class="billy-topbar-actions">`, entre le toggle dark mode et le divider. Le contenu doit être un `<li>` (c'est le cas de `billy-notifications`). |
| `[shell-account]` | Après le divider, avant le bouton de déconnexion. |

Ces slots sont remplis depuis `billy-shell` (voir billy-shell.md) — l'application ne place jamais son contenu directement dans `<billy-topbar>`.

## Exemple d'utilisation

Côté application, les slots se posent sur le shell (`src/app/auth/pages/auth-page.component.html`) :

```html
<billy-shell>
  <app-billy-search shell-search />
  <billy-notifications shell-notifications>…</billy-notifications>
  <app-billy-account-menu shell-account />
  <router-outlet></router-outlet>
</billy-shell>
```

## Styles & theming

- Hauteur fixe 66px, fond transparent (celui du shell), police `'Plus Jakarta Sans'`, `z-index: 50` — au-dessus du chrome des pages (barres sticky 3-20), sous les overlays applicatifs (action-bar 200, action-sheet 500, modales).
- Burger : 3 barres qui se raccourcissent au hover ; barres accent `#0E97BB` quand la sidebar est repliée (`.collapsed`).
- Les actions projetées sont stylées via `::ng-deep .nav-item > .nav-link` (38×38, radius 10px, hover `#EAEFF3`) et un style `.badge` rouge (`#EF4444`) — le contenu projeté ne porte pas l'attribut de scope de la topbar, d'où le `::ng-deep`.
- Mobile (< 768px) : padding réduit, `.billy-topbar-search` en `display: none`.
- Bascule clair / sombre (`.btn-toggle-dark-mode`) : l'icône pivote de 180° (`transition: transform .5s ease`) au passage en dark mode — reprise du comportement de l'app historique. Rotation neutralisée sous `prefers-reduced-motion: reduce`.
- Dark mode via `:host-context(body.dark-mode)` : barres du burger `#ced0d2` (accent `#4fc3e0`), divider `#49545a`, hovers `#2a373b`, icône du toggle en `rotate(180deg)`.

## BillyDarkModeService (`billy-dark-mode.service.ts`)

> service `providedIn: 'root'` — `import { BillyDarkModeService } from 'billy-layout';`

Thème sombre du shell : persistance localStorage + classe **`dark-mode` sur le `<body>`** — c'est à cette classe que s'accrochent toutes les feuilles de la librairie (`:host-context(body.dark-mode)`) et les feuilles globales de l'application.

| Membre | Type | Description |
|---|---|---|
| `darkMode` | `signal<boolean>` | Initialisé depuis le localStorage. |
| `init()` | `void` | Applique la préférence persistée au `<body>`. Appelé par la topbar dans son `ngOnInit`. |
| `toggle()` | `void` | Inverse le signal, persiste, met à jour la classe du body. |

- Clé localStorage : **`billy_dark_mode`** (valeur `'true'`/`'false'`). La clé reprend celle de l'app historique (ex-`LocalService`) : les préférences existantes des utilisateurs restent lues.
- La classe est posée par `document.body.classList.toggle('dark-mode', …)` — pas de `data-theme`, pas de `prefers-color-scheme` : le choix est purement manuel.

## Pièges & notes

- `theme.init()` n'est appelé que par la topbar : une page rendue **sans** le shell (ex. écran de login) ne recevra pas la classe `dark-mode` sur le body tant que le service n'a pas été initialisé ailleurs.
- Le logo pointe sur `assets/images/icon-384.png` : l'asset doit exister dans l'application hôte.
- Le slot notifications est projeté dans un `<ul>` : y projeter autre chose qu'un `<li>` (ou un hôte stylé en flex item) casse la sémantique ; un reset `::ng-deep li { list-style: none; }` est déjà prévu.
- `logout` et `homeLink` viennent de `BILLY_SHELL_CONFIG` ; sans provider, le logo mène à `/` et le bouton de déconnexion ne fait rien.
