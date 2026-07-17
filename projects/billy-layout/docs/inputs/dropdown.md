# billy-dropdown — DropdownComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/dropdown/` · standalone component (ControlValueAccessor)

## Rôle

Remplaçant maison de `<ad-select>` (select2/jQuery de l'ancienne ad-library), rétro-compatible : mêmes options `{ id, text, value }`, même comportement « première option affichée par défaut ». Déclencheur `role="combobox"`, panneau en `position: fixed` (échappe aux `overflow` parents) avec recherche accent-insensible et surlignage des correspondances. La fermeture au clic extérieur passe par la directive `ClickOutsideDirective` de la lib (`lib/core/click-outside/`).

Utilisé massivement dans `src/app` : `vente-form`, `devis-form`, `achat-form`, `prestations-agenda`, `agenda-evenement-form`, `agenda-recurrence-form`, `agenda-filter-bar`, `recurrence-filter-bar`…

## API

**Sélecteur & import**

```ts
import { DropdownComponent, DropdownOption } from 'billy-layout';
```

**Interface `DropdownOption`** (structurellement compatible avec l'ancien `AdSelectElement`) :

```ts
export interface DropdownOption {
  text: string;   // libellé affiché
  id: string;     // identifiant unique (comparé en chaîne)
  value?: any;    // valeur envoyée au modèle ; à défaut, l'option elle-même
}
```

**Inputs** (API signals — `input()`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `values` | `DropdownOption[]` | `[]` | Liste des options. |
| `id` | `string` | `''` | `id` posé sur le bouton déclencheur (pour `<label for>`). |
| `required` | `boolean` | `false` | Pose `aria-required` sur le déclencheur. |
| `readonly` | `boolean` | `false` | Désactivation statique (en plus de celle du formulaire). |
| `searchable` | `boolean` | `true` | Affiche le champ de recherche en tête de panneau. |
| `autofocusSearch` | `boolean` | `true` | Focus automatique de la recherche à l'ouverture (sinon focus de la liste). |
| `placeholder` | `string` | `''` | Texte affiché quand aucune option n'est sélectionnée. |
| `multiple` | `boolean` | `false` | Active la sélection multiple : tags supprimables dans le déclencheur, le modèle devient un **tableau** de valeurs. Le mode multi s'active aussi automatiquement si le modèle écrit est déjà un tableau (parité select2). |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `selectionChange` | `any` | Émis à chaque sélection, avec la même valeur que celle envoyée au CVA. |

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `open()` / `close(focusTrigger = false)` / `toggle()` | Contrôle du panneau. |
| `pick(option)` | Sélectionne une option. En mono : émet + referme. En multi : bascule la valeur (ajout/retrait) et laisse le panneau ouvert. |
| `removeValue(option, event)` | Multi uniquement : retire le tag correspondant sans ouvrir le panneau. |

## ControlValueAccessor

- **Valeur modèle** : `option.value` si défini, sinon l'objet `DropdownOption` lui-même (parité select2).
- **Correspondance modèle → option** : le modèle peut être un id (`number`/`string`) ou un objet possédant un `id` ; la comparaison se fait en chaîne (`'' + id`). En mono, sans correspondance (ou modèle `null`/`undefined`), **la première option est affichée** — comportement hérité de select2 ; le placeholder n'apparaît que si la liste est vide.
- **Mode multi** (`multiple` ou modèle tableau) : le modèle est un **tableau** de valeurs (chacune suivant la même règle `option.value` / option). Chaque valeur devient un tag supprimable ; le placeholder s'affiche tant que le tableau est vide. `Backspace` dans une recherche vide retire le dernier tag (parité select2).
- Pas de `NG_VALIDATORS`.
- `setDisabledState()` : combine avec `readonly` (`isDisabled = readonly() || disabledFromForm()`), referme le panneau si ouvert.

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/agenda/agenda-evenement-form/agenda-evenement-form.component.html` (usage `ngModel`) :

```html
<billy-dropdown
  [values]="clientsSelectOptions()"
  [ngModel]="f.r_client"
  (ngModelChange)="setField('r_client', $event)">
</billy-dropdown>
```

S'utilise aussi avec `formControlName` dans les formulaires réactifs (`vente-form`, `achat-form`…).

**Sélection multiple** — `multiple` active les tags ; le modèle est un tableau de valeurs :

```html
<billy-dropdown
  [values]="paysOptions"
  [multiple]="true"
  [(ngModel)]="paysSelectionnes"
  placeholder="Choisir un ou plusieurs pays…">
</billy-dropdown>
```

```ts
readonly paysSelectionnes = signal<string[]>(['FR', 'LU']); // pré-sélection par ids/valeurs
```

## Styles & theming

- Le déclencheur et le champ de recherche utilisent les mixins **`billy-forms`** : `@include forms.billy-input` et `@include forms.billy-focus`. Tout le thème (dark mode compris) vient des tokens `--billy-*` : `--billy-input-*`, `--billy-surface(-border/-shadow)`, `--billy-divider`, `--billy-accent(-soft/-strong)`, `--billy-text-muted`, `--billy-addon-color`.
- Personnalisation par instance via CSS custom properties : `--dropdown-height` (35 px), `--dropdown-radius`, `--dropdown-font-size`.
- Panneau : `position: fixed`, `z-index: 2000`, largeur alignée sur le déclencheur (min 180 px), liste scrollable max 260 px (`overscroll-behavior: contain`), bascule vers le haut si la place manque (`openUp`). Suivi du déclencheur au scroll/resize via listeners `window`.
- Segments de recherche surlignés en `<b>` couleur `--billy-accent-strong` ; icônes Font Awesome (`fa-chevron-down`, `fa-magnifying-glass`, `fa-check`, `fa-xmark`).
- **Tags multi** : chips teintés sur `--billy-accent-soft` / `--billy-accent-border` / `--billy-accent-strong` (cohérents avec les badges du design system), croix de suppression virant au `--billy-danger` au survol. Le déclencheur passe en `min-height` pour laisser les tags passer à la ligne.

## Pièges & notes

- **ClickOutsideDirective** : la fermeture au clic extérieur est active seulement quand `isOpen()` est vrai (`[listenClickOutside]="isOpen()"`), pour ne pas écouter le document en permanence (important en zoneless).
- **Clavier** : `ArrowDown`/`ArrowUp` sur le déclencheur ouvre le panneau ; dans le panneau : flèches pour l'option active, `Home`/`End`, `Enter` sélectionne, `Escape` referme (re-focus du déclencheur), `Tab` referme sans re-focus.
- **Recherche accent-insensible** : normalisation NFD caractère par caractère (`stripAccent`) avec surlignage exact des caractères d'origine — « eve » matche « Évènement ».
- Le focus à l'ouverture et le `scrollIntoView` de l'option active passent par `setTimeout(...)` (le panneau vient d'être rendu) — fonctionne en zoneless mais ne pas retirer ces différés.
- Sans valeur écrite par le formulaire, le composant **affiche** la première option mais **n'émet rien** : penser à initialiser le contrôle si la valeur par défaut doit exister dans le modèle. Ce défaut « première option » ne s'applique **pas** en multi : un tableau vide affiche le placeholder.
- **Multi** : le mode s'active si `[multiple]="true"` **ou** si la valeur écrite est un tableau. Pour un multi initialement vide, passer `[multiple]="true"` (un `null`/`undefined` ne suffit pas à déduire le mode). Le panneau reste ouvert après chaque clic pour enchaîner les sélections.
