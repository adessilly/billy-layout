# billy-page-header — PageHeaderComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/page-header/` · standalone component

## Rôle

En-tête standard de page : titre `<h1>` + sous-titre optionnel, bouton « retour » optionnel placé avant le titre, et une zone d'actions projetée alignée à droite (`.zone-btn-header`). C'est le premier élément de quasi toutes les pages authentifiées, qui héberge le plus souvent un `billy-header-action-bar` et/ou des `billy-tabs size="sm"`.

Utilisation dans `src/app` (vérifiée par grep, 15+ écrans) : `dashboard`, `achat-consult` / `achat-form` / `achat-list`, `vente-*`, `devis-*`, `agenda-list`, `client-consult` / `client-list`, `compte`, `peppol-inbox`, `prestations-agenda`…

## API

**Sélecteur** : `billy-page-header` · **Import** : `import { PageHeaderComponent } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `titre` | `string` (**`input.required`**) | — | Titre de la page (rendu en `<h1>`). |
| `sousTitre` | `string` | `''` | Sous-titre affiché sous le titre (masqué si vide). |
| `retourVisible` | `boolean` | `false` | Affiche le bouton de retour (chevron gauche), placé avant le titre. |
| `retourTitre` | `string` | `'Retour'` | Tooltip (`title`) et `aria-label` du bouton de retour. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `retour` | `output<void>` | Émis au clic sur le bouton de retour. La navigation est à la charge du parent. |

## Slots / projection

- `<ng-content>` (par défaut) : projeté dans `.zone-btn-header` (`margin-left: auto`, flex, gap 10px) — boutons d'action, barre d'actions, onglets…

## Exemple d'utilisation

`achat-consult.component.html` :

```html
<billy-page-header
  [titre]="'Achat'"
  sousTitre="Consultation"
  [retourVisible]="true"
  retourTitre="Retour aux achats"
  (retour)="askRetour()">

  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>

</billy-page-header>
```

## Styles & theming

- Couleurs **en dur** (pas de tokens `--billy-*`) : titre `#1E293B`, sous-titre `#94A3B8`, accents cyan `#0E97BB` / `#12B4DD` ; police `'Plus Jakarta Sans'`.
- Bouton retour : fantôme (transparent) au repos, prend un relief « pilule » blanc + ombre au survol avec `translateX(-2px)` — même langage visuel que `billy-header-action-bar` ; focus visible via `outline`.
- Dark mode via `:host-context(body.dark-mode)` : titres éclaircis, bouton retour repose sur `#1e2b2f`.
- Mobile (`max-width: 767px`) : padding réduit, titre 19px, bouton retour agrandi (40px, cible tactile) et affiché **avec** son relief en permanence (pas de survol au doigt).
- Le conteneur est en `flex-wrap: wrap` : sur écran étroit la zone d'actions passe à la ligne.

## Pièges & notes

- Le bouton de retour **n'effectue aucune navigation** : brancher `(retour)` (souvent `router.navigate` ou `location.back()`).
- `retourTitre` alimente à la fois `title` et `aria-label` — le bouton n'affiche qu'un chevron, ce libellé est donc la seule information accessible.
- Le composant rend un `<h1>` : ne l'utiliser qu'une fois par page (sémantique/SEO interne).
- Fichier de style en **CSS** (pas SCSS) — pas de mixins `billy-*` disponibles ici.
- `implements OnInit` avec un `ngOnInit()` vide : héritage historique, aucune logique d'initialisation.
