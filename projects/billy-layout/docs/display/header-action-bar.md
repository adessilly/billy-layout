# billy-header-action-bar — HeaderActionBarComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/header-action-bar/` · standalone component

## Rôle

Barre d'actions d'en-tête de page, pilotée par un tableau déclaratif `HeaderAction[]`. Les actions **neutres** (variant absent ou `'default'`) sont regroupées dans un *segmented button group* (boutons reliés dans une même pilule), tandis que les actions **mises en avant** (`'primary'`, `'danger'`) deviennent des pilules autonomes colorées (dégradé cyan / rouge). Se place presque toujours dans le slot de `billy-page-header`.

Utilisation dans `src/app` (vérifiée par grep, 13 écrans) : `achat-consult` / `achat-form` / `achat-list`, `vente-*`, `devis-*`, `client-consult` / `client-list`, `compte`, `peppol-inbox`.

## API

**Sélecteur** : `billy-header-action-bar` · **Import** : `import { HeaderActionBarComponent, HeaderAction } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `actions` | `HeaderAction[]` | `[]` | Liste déclarative des actions. Si aucune action visible, la barre ne rend rien. |

### Outputs

Aucun — chaque action porte son propre callback `click`.

### Interface exportée `HeaderAction`

```ts
export interface HeaderAction {
  label: string;                              // libellé (masqué sur mobile ≤ 640px)
  icon: string;                               // classe FontAwesome
  title: string;                              // tooltip (seul texte visible sur mobile)
  click: () => void;                          // callback au clic
  variant?: 'default' | 'primary' | 'danger'; // regroupement (voir ci-dessous)
  disabled?: boolean;                         // bouton grisé, clic bloqué
  hidden?: boolean;                           // action retirée du rendu
}
```

**Regroupement** (getters internes `groupedActions` / `standaloneActions`) :

- `variant` absent ou `'default'` → **segmented group** `.hab-group` : boutons neutres reliés, séparés par un filet, hover cyan doux.
- `variant: 'primary'` ou `'danger'` → **pilule autonome** `.hab-btn--primary` / `.hab-btn--danger` : dégradé de couleur, effet « shine » au survol.

L'ordre de rendu est : le groupe segmenté d'abord, puis les pilules autonomes, chacune dans l'ordre du tableau.

## Slots / projection

Aucun `ng-content` — le rendu est entièrement piloté par l'input `actions`.

## Exemple d'utilisation

`achat-consult.component.ts` + `.html` :

```ts
get headerActions(): HeaderAction[] {
  const a = this.achat;
  if (!a) return [];
  return [
    { label: 'Agenda', icon: 'fa-solid fa-calendar-days', title: 'Lier un événement agenda', click: () => this.liaisonVisible.set(true) },
    { label: 'Non lu', icon: 'fa-solid fa-envelope', title: 'Remettre en non lu', click: () => this.askMarkAsUnread(), hidden: !a.read },
    { label: 'Modifier', icon: 'fa-solid fa-pen-to-square', title: 'Modifier', click: () => this.askEdit(), variant: 'primary' },
    { label: 'Supprimer', icon: 'fa-solid fa-trash', title: 'Supprimer', click: () => this.askOpenDelete(), variant: 'danger', disabled: this.achatState.loading() },
  ];
}
```

```html
<billy-page-header [titre]="'Achat'" …>
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>
```

## Styles & theming

- Couleurs **en dur** (pas de tokens `--billy-*`) : pilules blanches, hover cyan `#0e97bb` / `#e6f7fc` ; primary = dégradé `#12b4dd → #0e97bb`, danger = dégradé `#ef4444 → #dc2626`. Visuel pilule hérité de `agenda-add-button`.
- Effet « shine » (`::after` en dégradé qui balaie le bouton) au survol des pilules autonomes ; `translateY(-1px)` + ombre renforcée.
- **Mobile ≤ 640px** : `.hab-label { display: none }` — les boutons ne montrent plus que leurs icônes. Le `title` devient l'unique libellé.
- Dark mode via `:host-context(.dark-mode)` : fonds `#1e2b2f`, les variantes primary/danger gardent leurs dégradés.
- `disabled` : opacité 0.4 + `cursor: not-allowed`.

## Pièges & notes

- **`track action.label`** dans les deux boucles `@for` : les libellés doivent être **uniques** au sein de la barre, sinon erreur de tracking Angular.
- `title` est obligatoire dans l'interface et c'est **le seul texte accessible sur mobile** — le soigner (il peut être plus verbeux que `label`).
- `groupedActions` / `standaloneActions` sont des **getters** classiques (pas des `computed`) : recalculés à chaque cycle de détection ; en zoneless, la barre se met à jour parce que `actions` est un signal input — fournir un nouveau tableau (ou passer par un getter côté parent comme ci-dessus) pour refléter `hidden`/`disabled` dynamiques.
- Pas de variant `'secondary'` ni de dropdown : une action = un bouton. Pour masquer conditionnellement, utiliser `hidden` plutôt que de reconstruire un tableau filtré.
