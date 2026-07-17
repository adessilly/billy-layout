# billy-panel — BillyPanelComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/billy-panel/` · standalone component

## Rôle

Coque de panneau flottant « Billy » : carte blanche arrondie, ombre douce et animation d'ouverture (opacité + translation + scale). Elle a été extraite du panneau de notifications (`.billy-notif-panel`) pour partager le même langage visuel. Le composant est **purement présentationnel** : l'état `open` et la logique de fermeture (clic extérieur, Échap…) restent pilotés par l'appelant.

Utilisation dans `src/app` (vérifiée par grep) : uniquement le menu « Mon compte » du topbar — `shared/components/icon-top-compte/billy-account-menu.component.html`. Le panneau de notifications du shell partage le visuel mais garde sa propre implémentation.

## API

**Sélecteur** : `billy-panel` · **Import** : `import { BillyPanelComponent } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `open` | `boolean` (transform `booleanAttribute`) | `false` | Le panneau est-il déployé ? Anime l'apparition/disparition (le panneau reste dans le DOM, `pointer-events: none` quand fermé). |
| `heading` | `string \| undefined` | `undefined` | Titre optionnel affiché dans l'entête (rendu seulement si fourni). |
| `subheading` | `string \| undefined` | `undefined` | Sous-titre optionnel sous le titre (rendu seulement si `heading` est présent). |

### Outputs

Aucun. La fermeture est la responsabilité du parent (typiquement `ClickOutsideDirective` + touche Échap).

## Slots / projection

- `<ng-content />` (par défaut) : corps du panneau, rendu dans `.billy-panel-body` (padding 6px).

## Exemple d'utilisation

Menu compte du topbar (`billy-account-menu.component.html`) :

```html
<billy-panel [open]="open()" heading="Mon compte" subheading="Accès rapides">
  @for (item of links; track item.link) {
    <a class="account-menu-item" [routerLink]="item.link" (click)="close()">
      <span class="account-menu-icon" [style.background]="item.iconBg" [style.color]="item.iconColor">
        <billy-icon [name]="item.icon" [size]="18" [strokeWidth]="1.8" />
      </span>
      …
    </a>
  }
</billy-panel>
```

Le parent est un conteneur `position: relative` : le panneau se positionne en `position: absolute; top: calc(100% + 14px); right: 0` (largeur fixe 288px, `transform-origin: top right`).

## Styles & theming

- Couleurs **en dur** (pas de tokens `--billy-*`) : fond `#fff`, bord `#ECF0F3`, ombre portée `rgba(16, 42, 67, .22)`.
- Dark mode via `:host-context(body.dark-mode)` : fond `#172224`, bord `#49545a`, titres adaptés.
- `:host { display: contents; }` — le composant n'introduit pas de boîte propre, c'est `.billy-panel` qui est positionnée par rapport au parent.
- Mobile (`max-width: 767.98px`) : le panneau passe en `position: fixed; top: 62px; left/right: 12px` (collé aux bords sous le topbar).
- Animation : `transition opacity .2s / transform .22s cubic-bezier(.34, 1.28, .5, 1)` (léger rebond), `z-index: 30`.

## Pièges & notes

- **L'ancrage est à la charge du parent** : sans conteneur `position: relative`, le panneau se positionne par rapport à l'ancêtre positionné le plus proche.
- Le panneau fermé reste dans le DOM (masqué via opacité + `pointer-events: none`) : l'état des enfants est conservé, mais attention au focus clavier — gérez `tabindex`/focus côté parent si nécessaire.
- Sur mobile le `top: 62px` fixe suppose la hauteur du topbar du shell ; un usage hors shell devra surcharger cette valeur.
- Pas de bouton de fermeture intégré : prévoir clic extérieur (cf. `ClickOutsideDirective` de la lib) et/ou Échap côté appelant.
