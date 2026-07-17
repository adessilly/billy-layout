# billy-filter-toggle-buttons — FilterToggleButtonsComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/filter-toggle-buttons/` · standalone component

## Rôle

Groupe de boutons de filtre à sélection unique, en deux variantes visuelles : `toggle` (segment-control à fond gris commun, façon iOS) et `chips` (pilules individuelles bordées et colorées). La valeur `null` sert conventionnellement d'option « Tous ». Chaque option — ou tout le groupe — peut définir sa couleur active.

Utilisation dans `src/app` (vérifiée par grep) : les barres de filtres de listes — `achat-filter-bar` (mode de date, `activeColor="#dc2626"`), `vente-filter-bar` (`#2563eb`), `devis-filter-bar`, `agenda-filter-bar` et `recurrence-filter-bar` (filtres type achat/vente/autre avec couleurs par option).

## API

**Sélecteur** : `billy-filter-toggle-buttons` · **Import** : `import { FilterToggleButtonsComponent, FilterToggleOption } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `options` | `FilterToggleOption[]` (**`input.required`**) | — | Liste des options à afficher (tracking par `opt.value` → valeurs uniques). |
| `value` | `string \| null` | `null` | Valeur actuellement sélectionnée (composant contrôlé). |
| `variant` | `'toggle' \| 'chips'` | `'toggle'` | `toggle` : segment-control à fond commun · `chips` : pilules individuelles colorées. |
| `activeColor` | `string \| undefined` | `undefined` | Couleur active partagée par tout le groupe (fallback si l'option n'a pas la sienne). Défaut CSS : `#6366f1`. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `valueChange` | `output<string \| null>` | Émis au clic sur une option, avec sa `value`. Le parent doit répercuter dans `value` (contrôlé). |

### Interface exportée `FilterToggleOption`

```ts
export interface FilterToggleOption {
  value: string | null;   // null = option « Tous »
  label: string;
  icon?: string;           // classe FontAwesome
  activeColor?: string;    // couleur texte + bordure quand actif (variante chips)
  activeBg?: string;       // couleur de fond quand actif (variante chips)
}
```

Priorité des couleurs (CSS custom properties) : `opt.activeColor` (`--opt-color`) > `activeColor` du groupe (`--ftb-color`) > défaut.

## Slots / projection

Aucun `ng-content` — rendu entièrement piloté par `options`.

## Exemple d'utilisation

Groupe monochrome (`achat-filter-bar.component.html`) :

```html
<billy-filter-toggle-buttons
  [options]="toggleOptions"
  [value]="dateMode()"
  activeColor="#dc2626"
  (valueChange)="onModeChange($event)">
</billy-filter-toggle-buttons>
```

Options colorées individuellement (`recurrence-filter-bar.component.ts`) :

```ts
readonly chipOptions: FilterToggleOption[] = [
  { value: null,    label: 'Tous' },
  { value: 'achat', label: 'Achats', icon: 'fa-solid fa-download', activeColor: '#dc2626', activeBg: '#fef2f2' },
  { value: 'vente', label: 'Ventes', icon: 'fa-solid fa-upload',   activeColor: '#16a34a', activeBg: '#f0fdf4' },
  { value: 'autre', label: 'Autres', icon: 'fa-solid fa-tag',      activeColor: '#6366f1', activeBg: '#eef2ff' },
];
```

## Styles & theming

- Couleurs de base **en dur** (grises `#f3f4f6` / `#6b7280`…), couleurs actives injectées via variables CSS `--ftb-color` / `--opt-color` / `--opt-bg`.
- Variante **toggle** : fond gris commun arrondi (radius 20px) ; l'option active passe sur fond blanc + ombre, sa couleur de texte suit `--opt-color`/`--ftb-color`.
- Variante **chips** : pilules bordées individuelles ; à l'état actif, `activeColor` colore texte **et** bordure, `activeBg` le fond.
- Dark mode via `:host-context(.dark-mode)` : fonds `#212e31` / `#2d3d40` ; pour les chips actives, le fond devient `color-mix(in srgb, <couleur active> 15%, transparent)` (l'`activeBg` clair est ignoré).
- Mobile ≤ 768px : le toggle prend toute la largeur (options en `flex: 1`), les chips défilent horizontalement sans wrap ni scrollbar.
- `:host { display: contents; }` — c'est `.ftb-wrapper` qui porte le layout.

## Pièges & notes

- **`activeBg` n'a d'effet qu'en variante `chips`** (en `toggle`, le fond actif est toujours blanc / `#2d3d40` en dark). À ce jour, aucun écran de l'app ne passe `variant="chips"` : les barres de filtres utilisent le toggle par défaut, où seul `activeColor` (groupe ou option) joue.
- Composant **contrôlé** : sans réinjection de la valeur émise dans `[value]`, le bouton cliqué ne s'active pas.
- `valueChange` est typé `string | null` : pour un filtre typé (`AgendaType | null`…), un cast est nécessaire côté parent (les barres de filtres utilisent `$any($event)`).
- Le `@for` trace par `opt.value` : deux options avec la même valeur (y compris deux `null`) provoquent une erreur de tracking.
- Pas d'état `disabled` par option, et la sélection n'est pas dé-sélectionnable en re-cliquant (prévoir une option `value: null` « Tous »).
