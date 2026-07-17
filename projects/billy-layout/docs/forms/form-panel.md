# billy-form-panel — FormPanelComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-creation/form-panel/` · standalone component

## Rôle

Panneau de formulaire : une carte (surface, coins arrondis 6px, ombre douce) avec un en-tête optionnel (`titre` + slot d'extras) et un corps qui projette le contenu. Il reprend la géométrie qu'avait la `.card` Bootstrap repeinte par le thème Angle, mais tient sa surface du token `--billy-surface` — le dark mode est donc automatique et il s'accorde avec `billy-save-bar`. À ce jour, **aucun usage direct dans `src/app`** (vérifié par grep sur `billy-form-panel`) : les formulaires récents (achat-form, vente-form) utilisent `billy-consult-card` ou le mixin `billy-card` ; le composant reste exporté et fait partie du bundle `FormCreationModule` importé par `src/app/shared/components/tache-list-signalform/` (import vestigial, sélecteur absent du template).

## API

### Sélecteur & import

```ts
import { FormPanelComponent } from 'billy-layout';
```

Sélecteur : `<billy-form-panel>`. Également exporté via le tableau legacy `FormCreationModule` (barrel `lib/forms/form-creation/index.ts`).

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `titre` | `string` | `''` | Titre du panneau (`<h4>` en graisse légère). Si vide, tout l'en-tête (`.fp-header`, y compris le slot `header-extra`) est omis. |
| `subpanel` | `boolean` | `false` | Variante panneau imbriqué : posé sur une carte, il s'efface (fond à peine teinté `#00000008`, sans bord ni ombre ni marge basse). |

Pas d'output ni de méthode publique.

## Slots / projection

| Slot | Sélecteur | Description |
|---|---|---|
| En-tête | `[slot=header-extra]` | Contenu additionnel à droite du titre (bouton, badge…). Rendu **uniquement si `titre` est non vide** (l'en-tête entier est conditionné au titre). |
| Corps | `<ng-content>` par défaut | Contenu du panneau, dans `.fp-body` (padding 1.25rem). |

## Exemple d'utilisation

Pas d'usage actuel dans `src/app` ; usage type :

```html
<billy-form-panel titre="Coordonnées">
  <button slot="header-extra" type="button" (click)="edit()">Modifier</button>
  <billy-input-line label="Email">
    <input class="form-control" formControlName="email" />
  </billy-input-line>
</billy-form-panel>
```

## Styles & theming

- Surface : `background: var(--billy-surface, #fff)` — dark mode automatique via le token.
- Carte : coins 6px, `box-shadow: 0 5px 5px rgba(0,0,0,0.05)`, pas de bord, `margin-bottom: 1.25rem` ; coins droits (radius 0) sous 768px.
- La carte porte aussi la classe `.loadable` (accroche pour les overlays de chargement stylés côté app).
- Variante `subpanel` : fond `#00000008`, sans ombre ni marge — codée en dur, elle ne suit pas de token dark mode (le noir translucide reste discret sur fond sombre).

## Pièges & notes

- Le slot `header-extra` disparaît avec l'en-tête si `titre` est vide : impossible d'avoir des extras sans titre.
- La géométrie (rayon 6px, ombre) est celle de l'ancienne carte Angle, pas celle du mixin `billy-card` plus récent (rayon 16px, bord `--billy-surface-border`) utilisé par `billy-save-bar` et `billy-consult-card` : deux langages de carte cohabitent.
- Composant orphelin côté app au 2026-07-17 (exporté, mais aucun sélecteur dans `src/app`).
