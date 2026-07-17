# billy-icon — BillyIconComponent

> Catégorie `core` · source `projects/billy-layout/src/lib/core/icon/billy-icon.component.ts` · standalone component

## Rôle

Jeu d'icônes SVG maison du design « Billy — Coque applicative » : trait arrondi (`stroke-linecap/linejoin: round`), viewBox 24, dessinées en `stroke: currentColor` — l'icône prend donc la couleur du texte environnant. C'est l'unique source d'icônes du shell de la librairie (topbar, items de navigation, notifications, action-bar) et elle est aussi consommée directement par l'application : recherche globale (`src/app/layout/billy-search/billy-search.component.html`) et menu compte (`src/app/shared/components/icon-top-compte/billy-account-menu.component.html`). Certaines icônes embarquent une micro-animation déclenchée au survol d'une zone ancêtre.

## API

### Sélecteur & import

```ts
import { BillyIconComponent, BillyIconName } from 'billy-layout';
```

Sélecteur : `<billy-icon />`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `name` | `BillyIconName \| string` | — (`input.required`) | Nom de l'icône à dessiner. Un nom inconnu rend un SVG vide (le `@switch` ne matche rien) — pas d'erreur, pas de fallback. |
| `size` | `number` | `21` | Largeur et hauteur du SVG en pixels (attributs `width`/`height`). |
| `strokeWidth` | `number` | `1.9` | Épaisseur du trait (`stroke-width`). |

Pas d'output ni de méthode publique.

### Type `BillyIconName`

Union de littéraux exportée à côté du composant — pratique pour typer des configurations de menus (cf. `billy-account-menu.component.ts` qui déclare `icon: BillyIconName`).

Icônes de navigation métier : `accueil`, `achats`, `devis`, `ventes`, `prestations`, `agenda`, `clients`, `compte`, `peppol`.

Icônes utilitaires : `bell`, `chevron-left`, `chevron-right`, `sync`, `check`, `clock`, `search`, `dark-mode`, `logout`, `open`, `upload`, `plus`.

Le type accepte aussi `string` en entrée du composant pour laisser passer des noms dynamiques, mais seuls les 21 noms ci-dessus produisent un dessin.

## Exemple d'utilisation

Usage réel dans `src/app/layout/billy-search/billy-search.component.html` :

```html
<billy-icon name="search" [size]="18" [strokeWidth]="1.9" />
```

Nom dynamique typé, dans `src/app/shared/components/icon-top-compte/billy-account-menu.component.html` :

```html
<billy-icon [name]="item.icon" [size]="18" [strokeWidth]="1.8" />
```

```ts
import { BillyIconComponent, BillyIconName } from 'billy-layout';

interface MenuItem { icon: BillyIconName; label: string; }

@Component({
  imports: [BillyIconComponent],
  /* ... */
})
```

## Styles & theming

- **Couleur** : `stroke="currentColor"` — se pilote entièrement en CSS via `color` sur l'hôte ou un ancêtre. Aucun token `--billy-*` consommé directement ; le dark mode est donc automatique dès que le texte environnant l'est.
- **Boîte** : `:host { display: inline-flex; line-height: 0 }` et `svg { overflow: visible }` (les animations peuvent déborder légèrement du viewBox).
- **Micro-animations au survol** : les fragments tagués (`anim-drop`, `anim-rise`, `anim-lift`, `anim-greet`, `anim-draw`) s'animent quand un **ancêtre portant la classe `.billy-icon-hover-zone`** est survolé (via `:host-context(.billy-icon-hover-zone:hover)`). Exemples : `achats` (flèche qui plonge), `ventes` (flèche qui monte), `clients` (l'arc « salue »), `devis`/`prestations` (trait qui se dessine, `stroke-dasharray`).
- **Accessibilité** : le SVG porte `aria-hidden="true"` (icône décorative — prévoir un libellé texte à côté) et toutes les animations sont désactivées sous `prefers-reduced-motion`.

## Pièges & notes

- `name` inconnu = icône invisible mais SVG rendu (l'espace `size × size` est réservé). Vérifier l'orthographe, il n'y a pas d'avertissement.
- Les animations ne se déclenchent **pas** au survol de l'icône elle-même : il faut poser `.billy-icon-hover-zone` sur le conteneur cliquable (bouton, lien de nav) — c'est ce que fait `billy-nav-item` dans le shell.
- Composant purement présentationnel, sans état : aucune contrainte zoneless particulière, tous les inputs sont des signals.
- Pour ajouter une icône : ajouter le littéral au type `BillyIconName` **et** un `@case` dans le template ; rester sur la grammaire du jeu (viewBox 24, trait ~1.9, coins arrondis).
