# billy-consult-line — ConsultLineComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-creation/consult-line/` · standalone component

## Rôle

Pendant lecture seule d'`billy-input-line` : un libellé en petites capitales grises, puis la valeur projetée en dessous, empilés en colonne. Sert à afficher une donnée dans les écrans de consultation avec le même langage visuel que les libellés de formulaire. À ce jour, **aucun usage direct dans `src/app`** (vérifié par grep sur `billy-consult-line`) : les écrans de consultation récents (achat-consult, vente-consult) utilisent leurs propres mises en page ; le composant reste exporté par la librairie et fait partie du bundle `FormCreationModule` importé par `src/app/shared/components/tache-list-signalform/` (import aujourd'hui vestigial, le template n'utilise pas le sélecteur).

## API

### Sélecteur & import

```ts
import { ConsultLineComponent } from 'billy-layout';
```

Sélecteur : `<billy-consult-line>`. Également exporté via le tableau legacy `FormCreationModule` (barrel `lib/forms/form-creation/index.ts`) qui regroupe les cinq composants form-creation.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string \| null` | `null` | Libellé affiché au-dessus du contenu. Si `null`/vide, aucun `<label>` n'est rendu. |

Pas d'output ni de méthode publique.

## Slots / projection

`<ng-content>` unique : la valeur à afficher (texte, badge, lien…) est projetée sous le libellé.

## Exemple d'utilisation

Pas d'usage actuel dans `src/app` ; usage type :

```html
<billy-consult-line label="Numéro de facture">
  {{ vente.no }}
</billy-consult-line>
```

## Styles & theming

- `:host { display: flex; flex-direction: column }` : libellé et contenu empilés ; l'hôte peut recevoir des classes de grille.
- Libellé : couleur fixe `#A6A6A6`, `text-transform: uppercase`, `font-size: 0.8em`, `margin: 0` — même style que le libellé d'`billy-input-line`, sans token `--billy-*` (rendu identique en dark mode).

## Pièges & notes

- Contrairement à `billy-input-line`, pas de classe `.form-group` ni de marge basse : l'espacement vertical est entièrement à la charge du consommateur.
- Pas d'inputs `mandatory` ni `info` : c'est un composant de consultation, pas de saisie.
- Composant candidat au nettoyage ou à la réutilisation : exporté et maintenu, mais orphelin côté app au 2026-07-17.
