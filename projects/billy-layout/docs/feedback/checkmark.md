# billy-checkmark, billy-checkmark-failed & billy-checkmark-loading

> Catégorie `feedback` · sources `projects/billy-layout/src/lib/feedback/checkmark/`, `checkmark-failed/` et `checkmark-loading/` · standalone components

Trois composants jumeaux utilisés en tandem autour d'une opération asynchrone : le spinner circulaire pendant l'opération, la coche verte animée à son succès, la croix rouge à son échec. Les trois partagent exactement la même géométrie SVG (viewBox 64 × 64, anneau de rayon 23, trait 3, extrémités arrondies) : superposés, le passage du spinner à la coche ou à la croix est visuellement continu, sans saut.

Usage app connu : `src/app/auth/pages/peppol-facture/peppol-send-animation-icon/` (animation d'envoi d'une facture Peppol).

---

## API commune

```ts
import {
  CheckmarkComponent,        // billy-checkmark
  CheckmarkFailedComponent,  // billy-checkmark-failed
  CheckmarkLoadingComponent, // billy-checkmark-loading
  CheckmarkColor,
} from 'billy-layout';
```

Les trois composants exposent les mêmes inputs :

| Input | Type | Défaut | Rôle |
|---|---|---|---|
| `label` | `string` | `'Succès'` / `'Échec'` / `'Chargement en cours'` | Libellé annoncé aux lecteurs d'écran (`role="img"` + `aria-label` sur le SVG). |
| `color` | `CheckmarkColor` | `'success'` (coche, spinner) · `'danger'` (croix) | Couleur du design system. |

```ts
export type CheckmarkColor = 'success' | 'accent' | 'danger' | 'warning' | 'info';
```

Correspondance des couleurs — le disque plein prend la teinte `base` de la [famille sémantique](../styles/styles.md#familles-sémantiques-statuts) du DS, donc **toutes suivent le dark mode** :

| Valeur | Couleur |
|---|---|
| `success` | `var(--billy-success)` (`#16a34a`) |
| `accent` | `var(--billy-accent)` (`#12b4dd`) |
| `danger` | `var(--billy-danger)` (`#dc2626`) |
| `warning` | `var(--billy-warning)` (`#ff902b`) |
| `info` | `var(--billy-accent-strong)` (`#0e97bb`) |

### Variables CSS de theming

| Variable | Défaut | Portée |
|---|---|---|
| `--billy-checkmark-size` | `156px` | Taille (largeur = hauteur) des trois composants. |
| `--billy-checkmark-color` | `var(--billy-success, #16a34a)` | Couleur du disque et du spinner quand `color` vaut `success` (défaut). |
| `--billy-checkmark-failed-color` | `var(--billy-danger, #dc2626)` | Couleur de la croix quand `color` vaut `danger` (défaut). |
| `--billy-checkmark-loading-color` | `var(--billy-checkmark-color, #16a34a)` | Surcharge spécifique du spinner. |
| `--billy-checkmark-check-color` | `#fff` | Couleur du trait de la coche et de la croix. |

Un `color` explicite (autre que le défaut) prend le pas sur ces variables : l'input pose un attribut `data-color` sur l'hôte, résolu en SCSS via `:host([data-color='…'])`.

### Exemple d'utilisation

```html
@if (loading()) {
  <billy-checkmark-loading />
  <span class="checkmark-message">En cours d'envoi...</span>
} @else if (success()) {
  <billy-checkmark />
  <span class="checkmark-message">Envoyé avec succès !</span>
} @else if (error()) {
  <billy-checkmark-failed />
  <span class="checkmark-message">L'envoi a échoué.</span>
}
```

Pour une transition sans rupture, superposer le spinner et la marque finale (le spinner reste monté et s'estompe pendant que la coche/croix se dessine par-dessus) :

```html
<div class="stack">
  <billy-checkmark-loading class="layer" [class.layer--hidden]="done()" />
  @if (done()) {
    <billy-checkmark class="layer" />
  }
</div>
```

```scss
.stack { display: grid; place-items: center; }
.layer { grid-area: 1 / 1; transition: opacity 0.4s ease-out; }
.layer--hidden { opacity: 0; }
```

---

## billy-checkmark — CheckmarkComponent

Coche de succès animée. Séquence de motion (~1,4 s), jouée une fois au montage :

1. **0 → 0,55 s** : l'anneau se trace depuis midi (dash-offset, courbe `cubic-bezier(0.65, 0, 0.35, 1)`).
2. **0,4 → 0,85 s** : le disque plein « pop » du centre avec rebond élastique (`cubic-bezier(0.34, 1.56, 0.64, 1)`) et ombre portée colorée.
3. **0,68 → 1,03 s** : la coche se dessine (extrémités rondes).
4. **0,7 → 1,2 s** : léger rebond d'ensemble (scale 1,07 à 40 %).
5. **0,78 s →** : un halo s'élargit et s'estompe, et six éclats « comètes » (dash-offset qui traverse le trait) fusent vers l'extérieur, légèrement décalés (30 ms entre chaque).

## billy-checkmark-failed — CheckmarkFailedComponent

Croix d'échec animée, même langage que la coche mais vocabulaire « erreur » :

1. Anneau tracé et disque « pop » identiques à la coche (en rouge `danger` par défaut).
2. **0,68 s puis 0,84 s** : les deux branches de la croix se dessinent l'une après l'autre.
3. **0,72 → 1,17 s** : shake horizontal (±3 px amortis) — pas de rebond ni d'éclats, réservés au succès.
4. **0,9 s →** : halo qui s'élargit et s'estompe.

## billy-checkmark-loading — CheckmarkLoadingComponent

Spinner circulaire indéterminé type Material : une piste discrète (opacité 0,15) et un arc qui s'étire et se contracte (`stroke-dasharray`/`offset` animés, 1,4 s) pendant que l'ensemble tourne (1,8 s linéaire). Pour une roue de progression *déterminée* (pourcentage), utiliser `billy-circular-loading` à la place.

---

## Accessibilité & motion

- SVG `role="img"` + `aria-label` (input `label`) sur les trois composants.
- `prefers-reduced-motion: reduce` : la coche et la croix apparaissent en fondu simple dans leur état final (pas de halo, éclats ni shake) ; le spinner ralentit (3 s/tour) avec un arc fixe.

## Pièges & notes

- Les animations de la coche et de la croix se jouent au montage : pour les rejouer, détruire/recréer le composant (`@if`).
- Le SVG a `overflow: visible` (le halo et l'ombre portée débordent du viewBox) : prévoir un peu d'air autour, et ne pas poser d'`overflow: hidden` sur un parent immédiat trop serré sous peine de retrouver le halo tronqué en carré.
- Le halo et le disque utilisent `transform-box: fill-box` ; les éclats sont des traits en dash-offset — pas de SMIL, tout est en CSS (l'ancien spinner SMIL a été remplacé).
- Démo : `/c/feedback/checkmark` (vitrine, superposition chargement → succès/échec, sélecteur de couleurs).
