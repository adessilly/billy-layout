# billy-snackbar — SnackbarComponent

> Catégorie `feedback` · source `projects/billy-layout/src/lib/feedback/snackbar/snackbar.component.ts` · standalone component

## Rôle

Bandeau flottant en bas d'écran de type « snackbar » PWA, conçu pour annoncer qu'une **nouvelle version de l'application est disponible** et proposer un bouton de mise à jour (rechargement). Le composant est purement présentationnel : il ne détecte rien lui-même, la visibilité est pilotée de l'extérieur via le model `visible`. Il est monté une seule fois dans `src/app/app.component.html` (racine de l'app), alimenté par `UpdateService` qui positionne `shouldRefresh`.

## API

### Sélecteur & import

```ts
import { SnackbarComponent } from 'billy-layout';
```

Sélecteur : `billy-snackbar`.

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `message` | `input<string>` | `'Nouvelle version disponible.'` | Texte du bandeau (repris comme libellé du bouton compact mobile). |
| `buttonTitle` | `input<string>` | `'Cliquez ici pour rafraîchir et mettre à jour'` | Attribut `title` des boutons d'action. |
| `buttonLabel` | `input<string>` | `'Mettre à jour'` | Libellé du bouton d'action desktop. |
| `closeTitle` | `input<string>` | `'ignorer ce message'` | Attribut `title` du bouton de fermeture. |
| `visible` | `model<boolean>` | `false` | Affiche/masque le bandeau ; two-way bindable (`[(visible)]`). Le bouton de fermeture le repasse à `false`. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `buttonClick` | `output<void>` | Émis au clic sur le bouton d'action (desktop ou compact mobile). Le parent déclenche typiquement le rechargement de la page. |

## Exemple d'utilisation

Usage réel (`src/app/app.component.html`) :

```html
<billy-snackbar
  [message]="'Nouvelle version disponible.'"
  [buttonTitle]="'cliquez ici pour rafraîchir la page et mettre à jour'"
  [buttonLabel]="'Mettre à jour'"
  [closeTitle]="'ignorer ce message'"
  (buttonClick)="askRefreshPage()"
  [(visible)]="shouldRefresh">
</billy-snackbar>
```

## Styles & theming

- Zone fixe pleine largeur en bas (`position: fixed; bottom: 0; z-index: 100000`), respecte le safe-area iOS (`padding-bottom: max(16px, env(safe-area-inset-bottom))`).
- Entrée/sortie : translation verticale hors écran avec courbe à rebond `cubic-bezier(0.34, 1.56, 0.64, 1)` (0,45 s) déclenchée par la classe `.pwa-snackbar-zone-active` ; `pointer-events: none` quand masqué.
- Carte « glassmorphism » : fond `rgba(255,255,255,.92)` + `backdrop-filter: blur(16px)`, ombres multiples, `max-width: 560px`. Pas de tokens `--billy-*` : palette autonome (icône et bouton en dégradé `#4f8ef7 → #6c63ff`).
- **Dark mode** via la règle globale `body.dark-mode .pwa-snackbar` : fond sombre translucide, textes et bouton de fermeture adaptés (pas de `:host-context` ici — les styles ciblent la classe globale).
- **Mobile (≤ 480px)** : l'icône et le bloc message+bouton desktop sont masqués au profit d'un **bouton compact unique fusionné** (`.pwa-snackbar__btn-compact`, icône + message, pleine largeur) — un seul tap pour mettre à jour ; la croix reste séparée.
- Accessibilité : `role="alert"` + `aria-live="polite"` sur la zone, `aria-label="Ignorer"` sur la croix.

## Pièges & notes

- Le composant ne se ferme jamais tout seul (pas d'auto-hide) : c'est au parent de gérer `visible`.
- Cliquer sur le bouton d'action n'affecte pas `visible` : le parent est censé recharger la page (ou fermer explicitement).
- Les textes par défaut sont déjà en français et orientés « mise à jour PWA » ; le composant est néanmoins réutilisable pour un autre bandeau bas d'écran en surchargeant les inputs.
- `z-index: 100000` : passe au-dessus de tout, y compris les toasts (10000) et les dialogues.
