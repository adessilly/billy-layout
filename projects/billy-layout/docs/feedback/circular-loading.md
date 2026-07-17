# billy-circular-loading — CircularLoadingComponent

> Catégorie `feedback` · source `projects/billy-layout/src/lib/feedback/circular-loading/circular-loading.component.ts` · standalone component

## Rôle

Anneau de progression **déterminé** : un cercle SVG dont le trait se remplit proportionnellement à l'input `percent` (technique stroke-dasharray/dashoffset, adaptée du CodePen jeremenichelli/vegymB). À la différence de `billy-checkmark-loading` (spinner indéterminé), il visualise un pourcentage précis, typiquement une progression d'upload. **Aucun usage actuel dans `src/app`** (vérifié par grep) : le composant est exporté par la lib (`public-api.ts`) mais orphelin — candidat à réutilisation ou suppression.

## API

### Sélecteur & import

```ts
import { CircularLoadingComponent } from 'billy-layout';
```

Sélecteur : `billy-circular-loading`.

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `percent` | `input<number>` | `0` | Pourcentage de progression (0–100). Chaque changement met à jour l'offset du trait (transition CSS de 0,35 s). |

Pas d'output.

### Membres notables

- `circle = viewChild<ElementRef<SVGCircleElement>>('circle')` — référence au cercle SVG.
- `setProgress(percent: number): void` — calcule et applique le `stroke-dashoffset` (`circumference - percent/100 * circumference`). Appelé par `ngAfterViewInit` et `ngOnChanges`.
- `radius` / `circumference` — mesurés sur le cercle réel dans `ngAfterViewInit`, où le `stroke-dasharray` est initialisé.

## Exemple d'utilisation

Aucun usage dans `src/app` à ce jour. Usage type :

```html
<billy-circular-loading [percent]="uploadProgress()"></billy-circular-loading>
```

## Styles & theming

- SVG fixe **44 × 44 px**, cercle `r=21`, trait de 2 px, couleur codée en dur `#23b7e5` (bleu Angle historique — pas de token `--billy-*`).
- Le remplissage part du haut : `transform: rotate(-90deg)` sur le cercle.
- Progression animée par `transition: 0.35s stroke-dashoffset` (fichier `circular-loading.component.css` — CSS simple, pas SCSS).
- Pas de dark mode, pas de gestion `prefers-reduced-motion`.

## Pièges & notes

- La géométrie est mesurée dans `ngAfterViewInit` : un `percent` initial non nul n'est peint qu'après le premier rendu (le `ngOnChanges` d'avant-vue est ignoré car `circle()` est encore indéfini — et `circumference` vaudrait 0).
- `percent` n'est pas borné : une valeur > 100 produit un offset négatif (anneau « surrempli » visuellement plein), une valeur négative un anneau vide.
- Composant à moitié migré signals : `percent` est un `input()` signal mais la mise à jour passe encore par `ngOnChanges` + manipulation directe du DOM (pas d'`effect`). `ngOnInit` est vide.
- Taille et couleur non paramétrables sans surcharge CSS depuis le parent.
