# billy-action-bar — ActionBarComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/action-bar/` · standalone component

## Rôle

Dock de navigation mobile flottant façon iOS : pilule de verre (blur + saturation) fixée en bas de l'écran, avec un halo actif qui glisse entre les onglets et des icônes `billy-icon` (mêmes symboles que le menu latéral) rejouant leurs micro-animations à l'activation. La librairie ne connaît pas les routes : chaque onglet fournit son test d'activation (`isActive(url)`) et son action de navigation (`go()`). Dans billy-client, la barre est posée par `src/app/auth/pages/auth-page.component.html` (hors du shell, sous condition `billyConfig.showActionBar`) et n'est affichée qu'en dessous de 768px (règle dans `auth-page.component.scss`).

## API

```ts
import { ActionBarComponent, BillyActionBarTab } from 'billy-layout';
```

Sélecteur : `billy-action-bar`.

### Interface BillyActionBarTab

```ts
interface BillyActionBarTab {
  icon: BillyIconName;              // icône billy-icon (sert aussi de clé de track)
  label: string;                    // libellé sous l'icône
  isActive: (url: string) => boolean; // l'onglet est-il actif pour cette URL ?
  go: () => void;                   // navigation au clic
}
```

### Inputs / membres

| Input | Type | Défaut | Description |
|---|---|---|---|
| `tabs` | `BillyActionBarTab[]` | requis | Les onglets, dans l'ordre d'affichage. |

Pas d'output.

| Membre public | Type | Description |
|---|---|---|
| `activeIndex` | `signal<number>` | Index de l'onglet actif, `-1` si l'URL courante ne matche aucun onglet. |
| `pillTransform` | `computed<string>` | `translateX(n * 100%)` du halo ; retombe sur le dernier index actif quand `activeIndex() < 0`, pour que le halo s'estompe **sur place** au lieu de sauter en position 0. |
| `refreshNav(url)` | `void` | Recalcule l'index actif (appelé au init et à chaque `NavigationEnd`). |
| `router` | `Router` | Injecté (abonnement aux `NavigationEnd`). |

## Slots / projection

Aucun `ng-content` : le rendu est entièrement piloté par `tabs`.

## Exemple d'utilisation

Onglets réels, `src/app/auth/pages/auth-page.component.ts` :

```ts
/** Onglets de la barre de navigation mobile (billy-action-bar, billy-layout). */
readonly actionBarTabs: BillyActionBarTab[] = [
  {
    icon: 'accueil', label: 'Accueil',
    isActive: url => url === '/auth' || url === '/auth/home' || url === '/auth/dashboard',
    go: () => this.routeurUtilsService.toAuthPage(),
  },
  {
    icon: 'achats', label: 'Achats',
    isActive: url => url === '/auth/achat/list',
    go: () => this.routeurUtilsService.toAchatPage(),
  },
  {
    icon: 'ventes', label: 'Ventes',
    isActive: url => url === '/auth/vente/list',
    go: () => this.routeurUtilsService.toVentePage(),
  },
  {
    icon: 'agenda', label: 'Agenda',
    isActive: url => url.startsWith('/auth/agenda'),
    go: () => this.routeurUtilsService.toAgendaPage(),
  },
];
```

Et dans `auth-page.component.html` :

```html
@if (billyConfig.showActionBar) {
  <billy-action-bar class="billy-action-bar" [tabs]="actionBarTabs"></billy-action-bar>
}
```

## Styles & theming

- Coque : `position: fixed`, centrée, `bottom: calc(14px + env(safe-area-inset-bottom))`, largeur `min(calc(100% - 28px), 400px)`, `z-index: 200` (au-dessus de la topbar 50, sous action-sheet 500). Verre : `rgba(255,255,255,.78)` + `backdrop-filter: blur(28px) saturate(190%)`, entrée animée depuis le bas (`ab-enter`).
- Halo `.tab-pill` : `width: calc(100% / 4)` — **codé pour 4 onglets** ; il glisse via `pillTransform` et passe en `.tab-pill-off` (fade + scale .72) quand aucun onglet ne matche. Couleurs par tokens : `var(--billy-accent-soft, #e6f7fc)` (halo) et `var(--billy-accent-strong, #0e97bb)` (onglet actif) — ces variables basculent seules via `body.dark-mode`.
- Activation : rebond de l'icône (`ab-pop`) puis micro-geste propre à chaque symbole via les tags `.anim-lift/-drop/-rise` posés par billy-icon (`::ng-deep`).
- Dark mode via `:host-context(body.dark-mode)` : seule la coque a un override (`rgba(23,34,36,.82)`) ; note de spécificité — la couleur inactive est scopée `.tab:not(.is-active)` pour ne pas écraser la couleur active.
- `prefers-reduced-motion` : entrée, glissement et animations d'icônes désactivés.
- L'affichage mobile-only et le dégagement du contenu ne sont **pas** gérés par le composant : billy-client masque la barre ≥ 768px et ajoute un padding-bottom au shell via `.has-action-bar` dans `auth-page.component.scss`.

## Pièges & notes

- `width: calc(100% / 4)` du halo suppose exactement 4 onglets ; passer un autre nombre exige d'adapter le SCSS (commentaire en place : « = nombre d'onglets de tabs[] »).
- Le `@for` track sur `tab.icon` : deux onglets avec la même icône casseraient le rendu — les icônes doivent être uniques.
- Les `isActive` sont évalués contre `router.url` brut (query params inclus) : préférer `startsWith` quand la page a des sous-routes ou des paramètres.
- L'abonnement aux événements du routeur (`ngOnInit`) n'est jamais désinscrit — sans conséquence dans billy-client où la barre vit aussi longtemps que `auth-page`, mais à savoir si le composant devait être monté/démonté fréquemment.
- Quand l'URL ne matche aucun onglet, le halo disparaît en douceur sur le dernier onglet actif (`lastIndex`) : comportement voulu, pas un bug.
