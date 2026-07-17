# app-loading — AppLoadingComponent

> Catégorie `feedback` · source `projects/billy-layout/src/lib/feedback/app-loading/app-loading.component.ts` · standalone component

## Rôle

Overlay de chargement qui recouvre toute la zone de son parent (lequel doit être en `position: relative`) et affiche une animation SVG « facture qui se rédige » tant que `loading` est vrai. C'est le remplaçant maison de l'ancien `ad-loading`. Largement utilisé dans `src/app` : formulaires et consultations devis/vente/achat/client (`devis-form`, `vente-consult-dialog`, `achat-consult`…), paiements de vente, page compte, `compte-password`, `upload-manager` — une quinzaine de composants.

## API

### Sélecteur & import

```ts
import { AppLoadingComponent } from 'billy-layout';
```

Sélecteur : `billy-loading` (le dossier/fichier garde le nom historique `app-loading`).

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `loading` | `input<boolean>` | `false` | Affiche l'overlay quand vrai. Le composant reste dans le DOM et bascule en fondu (opacité/visibilité). |

Pas d'output, pas de méthode publique.

## Exemple d'utilisation

Usage réel (`src/app/auth/pages/devis/devis-form/devis-form.component.html`) :

```html
<billy-loading [loading]="devisState.loading()"></billy-loading>
```

Ou en dur pendant un chargement de page (`devis-consult.component.html`) :

```html
<billy-loading [loading]="true"></billy-loading>
```

Le parent doit créer un contexte de positionnement (`position: relative`) : l'overlay est en `position: absolute; inset: 0`.

## Styles & theming

- Overlay `absolute inset: 0; z-index: 50`, voile `rgba(255,255,255,.72)` + `backdrop-filter: blur(2px)`, `cursor: wait` ; transition d'opacité 0,25 s à l'activation, `pointer-events` bloqués uniquement quand actif.
- Illustration SVG animée : un document-facture dont les lignes « s'écrivent » de gauche à droite en cascade (`billy-line-write`, délai `calc(var(--i) * 0.18s)` par ligne), une pastille € qui « pop » une fois le total écrit (`billy-euro-pop`), le tout flottant doucement (`billy-doc-float`).
- Tokens DS avec fallback : `--billy-accent` / `--billy-accent-strong` (dégradé du contour et lignes), `--billy-accent-border` (lignes atténuées), `--billy-surface` (corps du document).
- **Dark mode** (`:host-context(body.dark-mode)`) : voile sombre `rgba(20, 28, 31, .72)`.
- **`prefers-reduced-motion: reduce`** : les animations d'écriture et le pop € sont coupés ; seul reste le flottement lent du document (« pouls léger ») pour signaler l'activité.
- Accessibilité : `aria-live="polite"`, `[attr.aria-busy]="loading()"`, `role="status"` + `aria-label="Chargement en cours"` sur le spinner.

## Pièges & notes

- **Parent en `position: relative` obligatoire**, sinon l'overlay recouvre l'ancêtre positionné le plus proche (voire la page).
- `z-index: 50` seulement : conçu pour recouvrir le contenu d'un panneau, pas les topbar/dialogues/toasts.
- Le composant est toujours rendu (pas de `@if` interne) : il n'y a pas de coût de création/destruction à chaque bascule, mais penser à le placer dans le bon conteneur.
- Le dégradé SVG utilise un id fixe `billyLoadingGrad` : plusieurs instances simultanées partagent le même id — sans conséquence en pratique puisque toutes les définitions sont identiques.
