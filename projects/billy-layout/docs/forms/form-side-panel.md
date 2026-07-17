# billy-form-side-panel — FormSidePanelComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-side-panel/` · standalone component

## Rôle

Panneau latéral coulissant depuis la droite, avec overlay semi-transparent et **verrou de scroll du body** : tant que le panneau est monté, la page derrière ne défile plus, et la position de scroll est restaurée à la fermeture. Le composant ne gère que le conteneur (overlay + panneau animé) : le contenu (formulaire de liaison, revue IA…) est projeté, et l'ouverture/fermeture est pilotée par le consommateur via un `@if`. Utilisé notamment dans `src/app/auth/pages/achat/achat-consult/achat-consult.component.html` (liaison agenda + revue IA), `src/app/auth/pages/achat/achat-form/achat-form.component.html` (revue IA), `src/app/auth/pages/vente/vente-consult/vente-consult.component.html`, `src/app/auth/pages/prestations/prestations-agenda/prestations-agenda.component.html` et `src/app/auth/pages/agenda/agenda-list/agenda-list.component.html`.

## API

### Sélecteur & import

```ts
import { FormSidePanelComponent } from 'billy-layout';
```

Sélecteur : `<billy-form-side-panel>`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `wide` | `boolean` | `false` | Panneau large : 440px au lieu de 360px (sans effet sous 768px, où le panneau est plein écran). |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `overlayClick` | `void` | Clic sur l'overlay. Le composant **ne se ferme pas tout seul** : c'est au consommateur de démonter le panneau (ex. `(overlayClick)="visible.set(false)"`). |

### Méthodes publiques

Aucune. Cycle de vie : `ngOnInit` pose le verrou de scroll (voir Pièges), `ngOnDestroy` le retire et restaure la position.

## Slots / projection

`<ng-content>` unique dans `.panel` (colonne flex pleine hauteur) : le contenu fournit son propre header/footer et son scroll interne.

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/achat/achat-consult/achat-consult.component.html` :

```html
@if (liaisonVisible()) {
  <billy-form-side-panel (overlayClick)="liaisonVisible.set(false)">
    <app-concept-agenda-liaison-panel
      type="achat"
      [conceptId]="beanId!"
      (closed)="liaisonVisible.set(false)"
      (updated)="onLiaisonUpdated($event)">
    </app-concept-agenda-liaison-panel>
  </billy-form-side-panel>
}
```

Variante large, dans `src/app/auth/pages/prestations/prestations-agenda/prestations-agenda.component.html` :

```html
<billy-form-side-panel [wide]="true" (overlayClick)="onBulkCancelled()">
```

## Styles & theming

- `:host { display: contents }` : l'hôte ne crée pas de boîte, overlay et panneau se positionnent en `fixed` directement.
- Overlay : `rgba(0,0,0,0.15)`, `z-index: 1050` — au-dessus de la save-bar sticky (1001), sous les toasts/modales (9000+) ; fondu 0.2s. Panneau : `z-index: 1051`, glissement 0.25s depuis la droite, ombre portée vers la gauche.
- Fond du panneau : blanc codé en dur, avec dark mode explicite via `:host-context(.dark-mode) .panel { background: #172224 }` (pas de token `--billy-surface` ici).
- Mobile (≤768px) : panneau plein écran (width 100%).

## Pièges & notes

- **Verrou de scroll body** : à l'init, le composant mémorise `window.scrollY` puis fige le body (`position: fixed; top: -scrollY; width: 100%`) et garde `overflow-y: scroll` pour préserver la largeur de la scrollbar desktop (pas de décalage de mise en page). À la destruction, il remet les styles à vide et `scrollTo(0, scrollY)`. Conséquences : (1) le verrou écrase les styles inline du body — ne pas empiler deux side-panels ni un autre mécanisme de verrou en même temps, le second détruit restaurerait des styles vides et une position obsolète ; (2) le panneau doit être monté/démonté via `@if`, pas masqué en CSS, sinon le verrou reste actif.
- `overlayClick` est une simple notification : sans handler qui démonte le panneau, cliquer l'overlay ne ferme rien. Pas de fermeture sur `Escape` non plus.
- Pas de focus-trap ni d'attributs ARIA : l'accessibilité clavier est à la charge du contenu projeté.
- Le contenu doit gérer son propre débordement (`overflow-y: auto` sur sa zone scrollable) : `.panel` est une colonne flex plein écran sans scroll par défaut.
