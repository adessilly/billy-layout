# billy-checkmark — CheckmarkComponent & billy-checkmark-loading — CheckmarkLoadingComponent

> Catégorie `feedback` · sources `projects/billy-layout/src/lib/feedback/checkmark/` et `projects/billy-layout/src/lib/feedback/checkmark-loading/` · standalone components

Deux composants jumeaux purement décoratifs (aucun input, aucun output) utilisés en tandem : le spinner circulaire pendant une opération, la coche verte animée à son succès. Dans `src/app`, ils ne sont utilisés qu'à un seul endroit : `src/app/auth/pages/peppol-facture/peppol-send-animation-icon/peppol-send-animation-icon.component.html`, l'animation d'envoi d'une facture sur le réseau Peppol.

---

## billy-checkmark — CheckmarkComponent

### Rôle

Coche de succès animée « à la Stripe » : un cercle vert se dessine, la coche se trace, puis le disque se remplit de vert avec un léger rebond. Animation jouée une seule fois au montage (pas de replay sans recréer le composant).

### API

```ts
import { CheckmarkComponent } from 'billy-layout';
```

Sélecteur : `billy-checkmark`. **Aucun input, aucun output, aucune méthode** — la classe est vide, tout est dans le template SVG et le SCSS.

### Exemple d'utilisation

Usage réel (`peppol-send-animation-icon.component.html`) :

```html
@if(loading()) {
  <billy-checkmark-loading></billy-checkmark-loading>
  <span class="checkmark-message">En cours d'envoi...</span>
}
@else if(success()) {
  <billy-checkmark></billy-checkmark>
  <span class="checkmark-message">Envoyé avec succès !</span>
}
```

### Styles & theming

- Taille fixe **156 × 156 px** (classe `.checkmark`), centrée via `style="margin:auto"` sur le SVG.
- Couleurs codées en dur en SCSS : vert `#59c771`, blanc `#fff`. Aucun token `--billy-*`, pas de variante dark mode.
- Séquence d'animations : tracé du cercle (`stroke` 0,6 s, dash-offset), tracé de la coche (0,3 s, délai 0,8 s), remplissage du disque (`fill` via `box-shadow: inset … 130px`, délai 0,4 s) et `scale` avec rebond (délai 0,9 s). Courbe `cubic-bezier(0.65, 0, 0.45, 1)`.
- Pas de gestion `prefers-reduced-motion`.

### Pièges & notes

- Le SCSS contient un sélecteur `body { width: 100vw; height: 100vh; … }` hérité du CodePen d'origine — inoffensif car les styles de composant sont encapsulés (il ne matche jamais), mais à ne pas copier tel quel ailleurs.
- Taille et couleurs non paramétrables : pour une autre taille, surcharger `.checkmark` depuis le parent (ou faire évoluer le composant).
- L'animation se joue au montage : pour la rejouer, détruire/recréer le composant (c'est ce que fait le `@else if` de l'exemple).

---

## billy-checkmark-loading — CheckmarkLoadingComponent

### Rôle

Spinner circulaire indéterminé (arc qui tourne), pendant « chargement » de `billy-checkmark`. Utilisé pendant l'envoi Peppol en attendant de basculer sur la coche de succès.

### API

```ts
import { CheckmarkLoadingComponent } from 'billy-layout';
```

Sélecteur : `billy-checkmark-loading`. **Aucun input, aucun output, aucune méthode.**

### Exemple d'utilisation

Voir l'exemple commun ci-dessus (état `loading()`).

### Styles & theming

- SVG de **156 × 156 px** (viewBox 38 × 38) : cercle gris `#ccc` semi-transparent + arc qui tourne via `<animateTransform type="rotate" dur="1s" repeatCount="indefinite"/>` — animation **SMIL native du SVG**, le fichier SCSS du composant est vide.
- Couleur `#ccc` codée en dur, pas de token, pas de dark mode, pas de `prefers-reduced-motion` (SMIL n'est pas couvert par les media queries CSS).

### Pièges & notes

- Dimensionné par les attributs `width`/`height` du SVG (156 px) pour s'aligner sur `billy-checkmark` ; pas d'input de taille.
- Pour une roue de progression *déterminée* (pourcentage), utiliser `billy-circular-loading` à la place.
