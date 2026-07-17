# billy-input-prefixe-suffixe — InputPrefixeSuffixeComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-creation/input-prefixe-suffixe/` · standalone component

## Rôle

Groupe de champ encadré d'un préfixe et/ou d'un suffixe (« N° », « € », « % », icône…), le champ lui-même étant projeté par le consommateur. Successeur autonome de l'`.input-group` Bootstrap 4 (avec `.input-group-prepend/append`) qui venait du thème Angle : depuis la sortie de Bootstrap, la structure est maison et les couleurs viennent des tokens `--billy-*`. Les addons peuvent être cliquables (ex. icône « régénérer » du numéro de facture). Utilisé dans `src/app/auth/pages/achat/achat-form/achat-form.component.html` (suffixes « € » et « % »), `src/app/auth/pages/vente/vente-form/vente-form.component.html` (suffixe icône cliquable de génération du n° de facture) et `src/app/auth/pages/devis/devis-form/devis-form.component.html`.

## API

### Sélecteur & import

```ts
import { InputPrefixeSuffixeComponent } from 'billy-layout';
```

Sélecteur : `<billy-input-prefixe-suffixe>`. Également exporté via le tableau legacy `FormCreationModule` (barrel `lib/forms/form-creation/index.ts`).

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `prefixe` | `string` | `''` | Texte de l'addon de gauche. L'addon n'est rendu que si `prefixe` ou `prefixeIcon` est non vide. |
| `suffixe` | `string` | `''` | Texte de l'addon de droite. Idem : rendu si `suffixe` ou `suffixeIcon`. |
| `prefixeIcon` | `string` | `''` | Classes d'icône Font Awesome (`<i [class]>`) affichées dans le préfixe, avant le texte éventuel. |
| `suffixeIcon` | `string` | `''` | Classes d'icône affichées dans le suffixe. |
| `prefixeClickable` | `boolean` | `false` | Si vrai, un clic sur le préfixe émet `prefixeClick` (sinon le clic est ignoré). |
| `suffixeClickable` | `boolean` | `false` | Si vrai, un clic sur le suffixe émet `suffixeClick` ; pose aussi le curseur pointeur et le survol accentué. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `prefixeClick` | `void` | Clic sur le préfixe, émis seulement si `prefixeClickable` est vrai. |
| `suffixeClick` | `void` | Clic sur le suffixe, émis seulement si `suffixeClickable` est vrai. |

### Méthodes publiques

`askPrefixeClick()` / `askSuffixeClick()` : handlers de clic internes (garde `*Clickable` puis émission) ; publics mais destinés au template.

## Slots / projection

`<ng-content>` unique entre les deux addons : le champ (généralement un `<input class="form-control">`, parfois un `<select>`). Le SCSS ne cible que `input` et `select` projetés — un autre élément ne recevra ni flex ni raccords de coins.

## Exemple d'utilisation

Suffixe statique, dans `src/app/auth/pages/achat/achat-form/achat-form.component.html` :

```html
<billy-input-prefixe-suffixe suffixe="€">
  <input class="form-control" type="number" formControlName="prix" />
</billy-input-prefixe-suffixe>
```

Suffixe icône cliquable, dans `src/app/auth/pages/vente/vente-form/vente-form.component.html` :

```html
<billy-input-prefixe-suffixe
  (suffixeClick)="askGenerateNo()"
  [suffixeIcon]="this.loadingNoFacture() ? 'fa-solid fa-rotate fa-spin' : 'fa-solid fa-rotate'"
  [suffixeClickable]="true">
  <input id="vf-no" class="form-control" type="text" formControlName="no" />
</billy-input-prefixe-suffixe>
```

## Styles & theming

- Groupe `.ips-group` : flex pleine largeur, `margin-bottom: 1rem` (ex-`.mb-3`).
- Addons : mixin `billy-input-group-addon` (hauteur de champ du DS, padding `0 1rem`) + `billy-addon-button` — tokens `--billy-addon-bg`, `--billy-input-border`, `--billy-addon-color`, survol `--billy-addon-hover-bg` / `--billy-addon-hover-color` ; dark mode automatique via ces tokens.
- Raccord : l'addon cède son bord à la jonction (`border-right/left: 0`) et arrondit seulement ses coins extérieurs avec `--billy-input-radius` (8px) ; côté champ, `:has(.ips-addon--prefixe/--suffixe)` met à zéro les coins accolés.
- Addon cliquable survolé : l'icône passe à `--billy-accent-strong` (`#0e97bb`).

## Pièges & notes

- **IMPORTANT — le wrapper ne donne QUE le rôle de groupe au champ projeté, pas sa boîte ni sa typo.** Le SCSS est explicite : via `::ng-deep` (nécessaire, le champ vient du consommateur et ne porte pas l'attribut de scope du wrapper), il n'applique au champ que sa place dans le groupe — `flex: 1 1 auto; width: 1%; min-width: 0`, `z-index: 2` au focus, et les coins droits côté addon. Y inclure `billy-field` serait un abus : `.ips-group[scope] input` (spécificité 0,2,1) battrait le `.form-control[scope]` de la page (0,2,0) et imposerait la typographie du DS à un consommateur qui a la sienne (le « n° » de vente-form est à 13px). **La boîte (hauteur, padding, bordure, police) reste au consommateur** — les trois pages utilisatrices projettent toutes un `.form-control`.
- Le mixin `billy-input-group-addon` n'est pas utilisé pour le groupe lui-même (`billy-input-group` opère par sélecteurs enfants `>` qui n'atteindraient pas le contenu projeté, porteur de l'attribut `_ngcontent` de SA page) : le groupe est écrit à la main.
- **Bug connu dans le template** : l'addon préfixe teste `[class.clickable]="suffixeClickable()"` (et non `prefixeClickable()`) — un préfixe cliquable seul n'aura pas le curseur pointeur, et un suffixe cliquable rend le préfixe visuellement cliquable. La garde d'émission (`askPrefixeClick`) est correcte, elle.
- Les raccords de coins reposent sur `:has()` : OK sur les navigateurs modernes ciblés par l'app.
