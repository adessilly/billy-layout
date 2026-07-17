# billy-nav-card — NavCardComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/nav-card/` · standalone component

## Rôle

Carte de navigation : tuile cliquable avec pastille-icône (jeu `billy-icon`), libellé, badge de comptage optionnel, description courte et chevron « aller vers » révélé au survol. C'est la brique des grilles de points d'entrée — un hub, un écran d'accueil, un sommaire de sections.

C'est un **sélecteur d'attribut** posé sur `<a>` ou `<button>` : la navigation (`routerLink`, `href`, `(click)`) reste portée par l'élément hôte du consommateur, la carte n'est que l'habillage. La librairie ne dépend donc pas du Router.

Utilisation dans le site : la grille des catégories de la page d'accueil (`src/app/pages/home/`), une carte par entrée de `DOC_CATEGORIES`.

## API

**Sélecteur** : `a[billy-nav-card]`, `button[billy-nav-card]` · **Import** : `import { NavCardComponent } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` (**`input.required`**) | — | Libellé principal de la carte. |
| `icon` | `BillyIconName` (**`input.required`**) | — | Icône de la pastille (jeu `billy-icon`, pas FontAwesome). |
| `description` | `string` | `''` | Description courte sous le libellé. Chaîne vide = ligne masquée. |
| `badge` | `number \| null` | `null` | Badge numérique après le libellé (pastille cyan). `null` = pas de badge — un `0` s'affiche bien. |
| `chevron` | `boolean` | `true` | Affiche le chevron révélé au survol. |
| `stagger` | `number` | `0` | Index d'apparition : décale l'animation d'entrée de 60 ms par carte. |

### Outputs

Aucun — le clic est celui de l'élément hôte (`routerLink`, `href` ou `(click)`).

## Slots / projection

Aucun : tout le contenu passe par les inputs.

## Exemple d'utilisation

`home-page.component.html` (grille des catégories) :

```html
<div class="cats-grid">
  @for (category of categories; track category.slug; let i = $index) {
    <a billy-nav-card
       [routerLink]="['/c', category.slug]"
       [label]="category.label"
       [icon]="category.icon"
       [description]="category.intro"
       [badge]="category.entries.length"
       [stagger]="i"></a>
  }
</div>
```

```scss
.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  --billy-nav-card-base-delay: 200ms; // les cartes arrivent après le hero
}
```

En `<button>` (action sans navigation) :

```html
<button type="button" billy-nav-card label="Exporter" icon="open"
        description="Générer le dossier comptable du trimestre." (click)="export()"></button>
```

## Styles & theming

- `:host` (l'`<a>`/`<button>` lui-même) : surface `--billy-surface`, bord `--billy-surface-border`, radius 16px, ombre `--billy-card-shadow` ; au survol, translation de −3 px, bord `--billy-accent-border` et ombre `--billy-surface-shadow`.
- Pastille : `--billy-accent-soft` (fond) / `--billy-accent-strong` (icône) / `--billy-accent-border` (bord) ; badge sur les mêmes tokens ; libellé `--billy-section-title` ; description `--billy-text-soft` ; chevron `--billy-accent`.
- **Animation d'entrée** (fondu + translation) : delay = `stagger × 60ms + var(--billy-nav-card-base-delay, 0ms)`. Le conteneur peut poser `--billy-nav-card-base-delay` pour synchroniser la cascade avec le reste de la page. Désactivée sous `prefers-reduced-motion`.
- Focus clavier : anneau `:focus-visible` sur `--billy-focus-border` (outline décalé de 2 px).
- **Dark mode entièrement porté par les tokens `--billy-*`** — aucun bloc dark local.

## Pièges & notes

- **Ne pas auto-fermer l'hôte** : `<a billy-nav-card … />` est refusé par le compilateur (élément natif) — écrire `</a>`.
- `icon` attend un `BillyIconName` (icônes SVG maison), pas une classe FontAwesome comme `billy-consult-card`.
- Le test du badge est `badge() !== null` : passer `0` affiche bien « 0 » ; utiliser `null` pour le masquer.
- L'animation d'entrée utilise `animation-fill-mode: backwards` (pas `both`) : une fois jouée, elle ne doit plus écraser le `transform` du survol.
- En usage `<button>`, penser à `type="button"` pour ne pas soumettre un formulaire parent.
- Ne pas confondre avec `billy-consult-card` (carte de **contenu** titrée, à projection) ni `billy-button-ajout` (tuile d'**action** « ajouter ») : `billy-nav-card` est la tuile de **navigation**.
