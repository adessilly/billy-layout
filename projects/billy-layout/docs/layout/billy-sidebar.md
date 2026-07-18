# billy-sidebar — BillySidebarComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-sidebar.component.*` · standalone component (+ `billy-nav-item`)

## Rôle

Menu latéral du shell : rend la liste de liens fournie par `BILLY_SHELL_CONFIG.menuLinks` (headings de section + liens routés via `billy-nav-item`), affiche les badges dynamiques (`menuBadges`) et la version de l'application en pied. Deux modes pilotés par `BillyShellService` : replié en colonne d'icônes (80px) sur desktop, tiroir superposé au contenu sur mobile. Dans billy-client la sidebar n'est jamais instanciée directement : c'est `BillyShellComponent` qui la pose, et les liens viennent de `src/app/layout/menus-admin-links.ts` via le provider de `src/app/app.config.ts`.

## API — BillySidebarComponent

```ts
import { BillySidebarComponent } from 'billy-layout';
```

Sélecteur : `billy-sidebar`. Aucun input ni output : tout vient du token et du service.

| Membre | Type | Description |
|---|---|---|
| `shell` | `BillyShellService` | Classes `.collapsed` / `.mobile-open` ; un clic sur un lien appelle `shell.closeMobileSidebar()`. |
| `links` | `BillyMenuLink[]` | `config?.menuLinks ?? []` (lu une fois à la construction). |
| `version` | `string` | `config?.version ?? ''` — pied de sidebar (« Version x.y.z » déplié, la valeur seule replié). |
| `badges` | `computed<Record<string, string \| null>>` | Déballe `config.menuBadges` (ex. envois Peppol en cours sur « Ventes »). Clé = `text` de l'entrée de menu. |

Tokens consommés : `BILLY_SHELL_CONFIG` (`{ optional: true }`).

Rendu : `@for (item of links; track item.text)` — `item.heading` donne un `<div class="billy-sidebar-heading">`, sinon un `<billy-nav-item>` avec `item.link!`, `item.icon!`, `item.text`, l'état replié et le badge éventuel.

## Exemple d'utilisation

La sidebar est alimentée par le provider de `src/app/app.config.ts` :

```ts
{
  provide: BILLY_SHELL_CONFIG,
  useFactory: (): BillyShellConfig => ({
    menuLinks: MENUS_ADMIN_LINKS,          // src/app/layout/menus-admin-links.ts
    version: environment.version,
    menuBadges: computed(() => {
      const count = peppolLogFactureService.inProgressLogs().length;
      return { Ventes: count > 0 ? String(count) : null };
    }),
    // …
  }),
}
```

## Styles & theming (sidebar)

- `:host { display: flex; flex: none; }` — indispensable : le host doit s'étirer sur toute la hauteur du body du shell, sinon le `<nav>` garde une hauteur auto et le pied de version (`margin-top: auto`) reste collé au dernier lien.
- Largeur 250px, 80px en `.collapsed`, transition `.3s cubic-bezier(.4, 0, .2, 1)` ; police `'Plus Jakarta Sans'`.
- Headings : uppercase 11px `#9AA7B4`, centrés et estompés (`opacity: .35`) en mode replié.
- Pied de version : bordure haute `#E7ECF1`, pastille accent `#12B4DD` avec halo `#E6F7FC`.
- Mobile (< 767.98px) : `position: fixed` sous la topbar (`top: 66px`, `z-index: 40`), largeur forcée `250px !important`, fond `#F4F6F8`, glissement `translateX(-100%)` → `none` avec `.mobile-open`.
- Dark mode via `:host-context(body.dark-mode)` : headings `#64747c`, bordure `#49545a`, halo de pastille `rgba(18, 180, 221, .18)`, fond mobile `#1e292b`.

---

# billy-nav-item — BillyNavItemComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/shell/billy-nav-item.component.*` · standalone component

## Rôle

Bouton de navigation réutilisable de la sidebar : icône `billy-icon` + libellé, état actif automatique (`routerLinkActive="active"`) et badge optionnel. En mode replié il ne montre que l'icône (le libellé passe en `title`) et le badge se colle en coin.

## API

```ts
import { BillyNavItemComponent } from 'billy-layout';
```

Sélecteur : `billy-nav-item`.

| Input | Type | Défaut | Description |
|---|---|---|---|
| `link` | `string` | requis | Route passée à `routerLink`. |
| `icon` | `BillyIconName` | requis | Icône `billy-icon` (taille 21). |
| `label` | `string` | requis | Libellé ; sert de tooltip (`title`) quand replié. |
| `collapsed` | `boolean` | `false` | Mode icône seule. |
| `badge` | `string \| null` | `null` | Contenu du badge ; `null` = pas de badge. |
| `badgeVariant` | `'info' \| 'notification'` | `'info'` | `info` : compteur discret (fond `--billy-accent-soft`, texte `--billy-accent-strong`) pour une information de comptage. `notification` : pastille rouge `#EF4444` qui appelle l'action (éléments à traiter). |

Pas d'output : le `(click)` se pose sur l'élément hôte côté appelant (la sidebar l'utilise pour fermer le tiroir mobile).

## Styles & theming (nav-item)

- Lien pilule radius 12px, `#5B6B79`, hover `#EAEFF3` avec micro-translation `translateX(3px)` ; actif `#E6F7FC` / `#0E97BB` en semi-bold.
- `.billy-nav-item-accent` : barrette accent `#12B4DD` débordant à gauche (`left: -14px`), visible uniquement actif **et** non replié.
- Badge poussé à droite (`margin-left: auto`) ; variante `info` (défaut) en tons accent doux (mêmes tokens que les badges de comptage de consult-card/nav-card), variante `notification` en `#EF4444` blanc. En mode replié il devient un point positionné en haut à droite de l'icône.
- Dark mode via `:host-context(body.dark-mode)` : texte `#9fb0ba`, hover `#2a373b`, actif `rgba(18, 180, 221, .14)` / `#4fc3e0`.
- La classe hôte `billy-icon-hover-zone` déclenche les micro-animations des icônes billy-icon au survol.

## Pièges & notes

- `links` et `version` sont lus **une fois** à la construction : `menuLinks`/`version` ne sont pas réactifs (contrairement à `menuBadges`, qui est un `Signal`). Changer le menu à chaud nécessiterait de recréer le shell.
- Les badges sont indexés par le **libellé** (`item.text`) : renommer une entrée du menu casse silencieusement son badge (cf. `{ Ventes: … }` dans app.config.ts).
- Sur les entrées non-heading, `link` et `icon` sont déréférencés avec `!` par la sidebar : une entrée sans `heading: true` doit impérativement fournir `link` et `icon`.
- `routerLinkActive` sans `exact` : un lien parent reste actif sur ses sous-routes.
