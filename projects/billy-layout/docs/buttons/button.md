# billy-button — ButtonComponent

> Catégorie `buttons` · source `projects/billy-layout/src/lib/buttons/button/` · standalone component

## Rôle

Bouton d'action polyvalent de la librairie. Il rend un **vrai `<button>`** (focus clavier, activation Entrée/Espace, attributs ARIA) et se décline sur trois axes indépendants :

- **couleur** (`color`) : les 5 teintes sémantiques du design system — `neutral`, `info`, `primary`, `warning`, `error` ;
- **variante** (`variant`) : `plain`, `plain-rounded`, `outline`, `outline-rounded`, `text`, `text-rounded`, `ghost`, `ghost-rounded` ;
- **taille** (`size`) : `small`, `normal`, `big`.

Il accepte un `label`, une `icon` FontAwesome, ou les deux (icône seule = bouton carré/rond). C'est la brique d'action générique, à préférer à un `<button>` nu dès qu'on veut la cohérence visuelle et le motion design du DS. Pour les tuiles d'accueil « ajouter / importer », voir plutôt [`billy-button-ajout`](./button-ajout.md) et [`billy-button-upload`](./button-upload.md).

## API

### Sélecteur & import

```ts
import { ButtonComponent } from 'billy-layout';
```

Sélecteur : `<billy-button>`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `''` | Libellé texte ; omis si vide. |
| `icon` | `string` | `''` | Classes FontAwesome de l'icône ; omise si vide. |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position de l'icône relative au label. |
| `color` | `BillyButtonColor` | `'primary'` | `neutral` \| `info` \| `primary` \| `warning` \| `error`. |
| `variant` | `BillyButtonVariant` | `'plain'` | `plain` \| `plain-rounded` \| `outline` \| `outline-rounded` \| `text` \| `text-rounded` \| `ghost` \| `ghost-rounded`. |
| `size` | `BillyButtonSize` | `'normal'` | `small` \| `normal` \| `big`. |
| `disabled` | `boolean` | `false` | Grise le bouton et bloque le clic. |
| `loading` | `boolean` | `false` | Remplace l'icône par un spinner, neutralise le clic, pose `aria-busy`. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type HTML natif (`submit` dans un formulaire). |
| `block` | `boolean` | `false` | Occupe toute la largeur disponible. |
| `ariaLabel` | `string` | `''` | Libellé accessible — **requis** pour un bouton icône seule. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clicked` | `MouseEvent` | Émis au clic. **N'émet pas** si `disabled` ou `loading` (l'événement est stoppé). |

### Types exportés

```ts
type BillyButtonColor = 'neutral' | 'info' | 'primary' | 'warning' | 'error';
type BillyButtonVariant =
  | 'plain' | 'plain-rounded'
  | 'outline' | 'outline-rounded'
  | 'text' | 'text-rounded'
  | 'ghost' | 'ghost-rounded';
type BillyButtonSize = 'small' | 'normal' | 'big';
type BillyButtonIconPosition = 'left' | 'right';
```

## Slots / projection

Aucun — tout passe par les inputs (`label` / `icon`).

## Exemples d'utilisation

Bouton principal avec icône :

```html
<billy-button
  label="Enregistrer"
  icon="fa-solid fa-floppy-disk"
  color="primary"
  [loading]="saving()"
  (clicked)="save()">
</billy-button>
```

Variantes contour et texte :

```html
<billy-button label="Annuler" color="neutral" variant="outline" (clicked)="cancel()" />
<billy-button label="Supprimer" icon="fa-solid fa-trash" color="error" variant="text" (clicked)="remove()" />
```

Boutons en pilule et icône seule (penser à `ariaLabel`) :

```html
<billy-button label="Nouveau" icon="fa-solid fa-plus" color="primary" variant="plain-rounded" />
<billy-button icon="fa-solid fa-gear" ariaLabel="Réglages" color="neutral" variant="text-rounded" />
```

Bouton « Retour » / annulation (variante `ghost`, reprend le bouton de la save-bar) :

```html
<billy-button label="Retour" icon="fa-solid fa-chevron-left" variant="ghost" (clicked)="goBack()" />
```

Bouton de soumission pleine largeur :

```html
<billy-button label="Se connecter" type="submit" color="info" [block]="true" />
```

## Styles & theming

- **Anatomie CSS pilotée par variables** : chaque couleur pose un petit jeu de variables locales (`--btn-solid`, `--btn-on-solid`, `--btn-fg`, `--btn-soft`, `--btn-ring`) que les variantes consomment. Elles sont **mappées sur les familles sémantiques du design system** (`--billy-<hue>` / `-strong` / `-soft` / `-soft-strong` / `-ring`, cf. [tokens](../styles/styles.md#familles-sémantiques-statuts)) : `neutral`, `info`, `warning`, `error` pointent sur leur famille, `primary` sur l'`Accent` de marque. Pour reteinter un statut, on modifie le token du DS (une fois) plutôt que le bouton.
- **Variantes** :
  - `plain` / `plain-rounded` : fond plein `--btn-solid` (aplat, sans dégradé), texte contrasté, ombre discrète. Au survol : fond légèrement assombri (`color-mix`), élévation `translateY(-1px)` + ombre douce teintée.
  - `outline` / `outline-rounded` : fond transparent, bord et texte `--btn-fg`. Au survol : voile teinté `--btn-soft`.
  - `text` : lien discret, voile teinté au survol.
  - `text-rounded` : **une pilule pleinement arrondie apparaît au survol** (pseudo-élément `::before`, fondu + léger zoom `scale(0.82 → 1)`).
  - `ghost` / `ghost-rounded` : **bouton « Retour » de la save-bar** — fantôme **sans bord au repos**, texte estompé `--billy-text-muted` ; au survol fond gris `--billy-addon-hover-bg` + texte `--billy-input-color` ; au focus, le halo (focus-ring `--billy-focus-ring`) tient lieu de « bord ». Câblé sur les tokens d'input du DS (dark mode automatique). **Insensible à `color`** (toujours neutre) : c'est le bouton secondaire / retour / annulation.
  - Les suffixes `-rounded` passent le rayon à `999px` (pilule).
- **Tailles** : `small` / `normal` / `big` ne changent que padding, `font-size` et `gap` (variables `--btn-*`).
- **Teintes** (light mode) : fills **vifs** issus des tokens `base` — `primary` cyan de marque `--billy-accent` (#12b4dd), `info` `--billy-info` (#3b82f6), `warning` `--billy-warning` (#ff902b, orange save-bar), `error` `--billy-error` (#ef4444), `neutral` `--billy-neutral` (#6b7280) — en **aplat plat** (pas de dégradé) avec **texte blanc**.
- **Contraste** : le texte blanc sur fill vif n'atteint pas partout le seuil AA 4.5:1 sur les teintes claires (`primary`, `warning`) ; les variantes **contour/texte** utilisent en revanche les teintes `-strong` (`--btn-fg`) qui restent lisibles (≥ 4.5:1) sur surface claire.
- **Dark mode automatique** : le bouton n'a **plus de bloc dark local** — les familles `--billy-*` basculent sous `body.dark-mode` (les pleins s'assombrissent d'un cran, les `-strong` contour/texte s'éclaircissent). Charger `_billy-tokens` (globalement) est donc requis pour le dark mode.
- **Focus visible** : halo `box-shadow: 0 0 0 3px var(--btn-ring)` (jamais supprimé).
- **Motion design** : transitions douces (`ease`) sur `transform` / couleurs / ombre, effets volontairement discrets (élévation d'1px, pilule `text-rounded` en fondu léger). Tout est neutralisé sous `@media (prefers-reduced-motion: reduce)`.

## Accessibilité

- Vrai élément `<button>` : navigable au clavier, activable Entrée/Espace.
- `disabled` et `loading` posent l'attribut `disabled` natif ; `loading` ajoute `aria-busy="true"`.
- **Bouton icône seule** : fournir `ariaLabel` — sinon le bouton n'a pas de nom accessible. À défaut d'`ariaLabel`, le `label` (s'il existe) sert de nom accessible.
- Le spinner et les icônes sont `aria-hidden="true"` (décoratifs).

## Pièges & notes

- `clicked` **n'émet pas** en état `disabled`/`loading` : inutile de reverifier côté consommateur.
- Un bouton **icône seule sans `label` ni `ariaLabel`** échouera un audit AXE (pas de nom accessible). Toujours renseigner `ariaLabel` dans ce cas.
- La palette vient des **familles sémantiques du DS** (`--billy-<hue>-*`), avec un **fallback en dur** sur chaque variable (valeur light) : le bouton reste correct en clair même sans les tokens, mais le **dark mode exige `_billy-tokens`** chargé globalement.
- La variante **`ghost` ignore `color`** : elle est toujours neutre (tokens d'input du DS), par cohérence avec le rôle de bouton retour/secondaire. Pour une action secondaire teintée, utiliser plutôt `outline` ou `text`.
- `type="submit"` est nécessaire pour déclencher la soumission d'un `<form>` : le défaut est `button` (contrairement au `<button>` HTML natif dont le défaut est `submit`).
