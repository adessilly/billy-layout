# billy-input-line — InputLineComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-creation/input-line/` · standalone component

## Rôle

Ligne de formulaire en mode édition : un libellé en petites capitales grises au-dessus du champ, avec astérisque de champ obligatoire et infobulle optionnels, le champ lui-même étant projeté par le consommateur (`<ng-content>`). C'est la brique de mise en page la plus utilisée des formulaires de l'app : on la retrouve entre autres dans `src/app/auth/pages/achat/achat-form/achat-form.component.html` (chaque champ du formulaire d'achat), `src/app/auth/pages/devis/devis-form/devis-form.component.html`, `src/app/auth/pages/peppol-facture/peppol-facture-summary/peppol-facture-summary.component.html` et `src/app/shared/components/fichiers-manager/fichiers-generation/fichiers-generation.component.html`.

## API

### Sélecteur & import

```ts
import { InputLineComponent } from 'billy-layout';
```

Sélecteur : `<billy-input-line>`. Également exporté via le tableau legacy `FormCreationModule` (barrel `lib/forms/form-creation/index.ts`) qui regroupe les cinq composants form-creation pour un import en bloc dans `imports: [...]`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `''` | Libellé affiché au-dessus du champ. Si vide, aucun `<label>` n'est rendu. |
| `mandatory` | `boolean` | `false` | Ajoute un astérisque `<span class="mandatory">*</span>` après le libellé. |
| `info` | `string` | `''` | Si non vide, affiche une icône `fa-circle-info` dont le `title` (infobulle native) contient ce texte. |
| `nomarginbottom` | `boolean` | `false` | Pose `.form-group-nomarginbottom` sur le wrapper pour annuler la marge basse (utile en fin de panneau ou dans une grille qui gère déjà les espacements). |

Pas d'output ni de méthode publique.

## Slots / projection

`<ng-content>` unique : le champ (input, `billy-datepicker`, `billy-dropdown`, `billy-input-prefixe-suffixe`…) est fourni par le consommateur et rendu sous le libellé.

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/achat/achat-form/achat-form.component.html` :

```html
<billy-input-line class="col-lg-4 col-md-6 col-sm-6" [mandatory]="true" label="Libellé">
  <input class="form-control" type="text"
    [class.is-invalid]="!ctrl.libelle.valid && ctrl.libelle.touched"
    formControlName="libelle" />
</billy-input-line>

<billy-input-line class="col-lg-4 col-md-6 col-sm-6" [mandatory]="true" label="Prix (tvac)">
  <billy-input-prefixe-suffixe suffixe="€">
    <input class="form-control" type="number" formControlName="prix" />
  </billy-input-prefixe-suffixe>
</billy-input-line>
```

## Styles & theming

- `:host { display: block }` : le composant se comporte comme un bloc, on lui passe couramment des classes de grille (`col-lg-4`…) directement sur l'hôte.
- Libellé : couleur fixe `#A6A6A6`, `text-transform: uppercase`, `font-size: 0.8em` — pas de token `--billy-*`, la couleur est identique en dark mode (elle reste lisible sur fond sombre).
- Le wrapper porte la classe `.form-group`, dont la marge basse (`margin-bottom: 1rem`) vient du CSS legacy global de l'app (`src/app/layout/layout-ui-loader/billy-legacy.scss`), pas de la librairie.

## Pièges & notes

- **Dépendance au CSS global** : la marge basse de `.form-group` est définie côté app (billy-legacy.scss, chargé par le layout-ui-loader). Hors de billy-client, le composant n'a pas d'espacement vertical par défaut.
- La classe `.mandatory` de l'astérisque n'est pas stylée dans le SCSS du composant : sa couleur vient elle aussi des styles globaux de l'app.
- Le champ projeté n'est pas relié au `<label>` (pas de `for`/`id`) : pas d'association d'accessibilité automatique.
- L'infobulle `info` est un `title` natif : pas de tooltip riche, invisible au clavier/tactile.
- Pendant la consultation (lecture seule), utiliser plutôt `billy-consult-line`, qui partage le même style de libellé.
