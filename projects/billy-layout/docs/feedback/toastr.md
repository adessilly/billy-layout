# billy-toastr — ToastrService, ToastrComponent & ToastrListPanelComponent

> Catégorie `feedback` · source `projects/billy-layout/src/lib/feedback/toastr/` · service + standalone components

## Rôle

Système de notifications éphémères (« toasts ») de l'application. `ToastrService` maintient une pile de messages dans un signal ; `ToastrListPanelComponent` (`billy-toastr-list-panel`) affiche cette pile en position fixe sous la topbar ; chaque message est rendu par `ToastrComponent` (`billy-toastr`), une carte avec liseré coloré, icône, barre de progression et bouton de fermeture.

Le panneau est monté **une seule fois** dans `src/app/auth/pages/auth-page.component.html` (`<billy-toastr-list-panel></billy-toastr-list-panel>`). Le service est injecté dans une trentaine d'endroits de `src/app` (formulaires devis/vente/achat/client, paiements, Peppol, compte, email-dialog, bce-search, fichiers-email, achat.service…), très majoritairement via les alias `pushSaveSuccess()` / `pushSaveError()`.

## API

### Types (`toastr.ts`)

```ts
export type ToastrType = 'success' | 'error' | 'warning' | 'info';

/** Message applicatif poussé par les appelants (API historique de pushMessage). */
export interface Toastr {
  titre: string;
  message: string;
  icone?: string;        // icône font-awesome optionnelle ; à défaut, l'icône du type
  type?: ToastrType;
  /** @deprecated utiliser `type: 'error'` */
  error?: boolean;
}

/** Toast concret dans la pile affichée. */
export interface ToastrInstance {
  id: number;
  type: ToastrType;
  titre: string;
  message: string;
  icone: string | null;
  duration: number;      // durée avant fermeture automatique, en ms
}
```

### ToastrService (`providedIn: 'root'`)

```ts
import { ToastrService } from 'billy-layout';
```

Propriétés :

| Propriété | Type | Défaut | Description |
|---|---|---|---|
| `hideDelay` | `number` | `5` | Durée d'affichage de base en **secondes**. Warnings : +1,5 s ; erreurs : +3 s. |
| `messages` | `Signal<ToastrInstance[]>` (readonly, `signal`) | `[]` | Pile courante des toasts affichés. |

Méthodes :

| Méthode | Signature | Description |
|---|---|---|
| `success` | `success(message: string, titre = 'Succès'): void` | Toast vert. |
| `error` | `error(message: string, titre = 'Erreur'): void` | Toast rouge (durée +3 s). |
| `warning` | `warning(message: string, titre = 'Attention'): void` | Toast orange (durée +1,5 s). |
| `info` | `info(message: string, titre = 'Information'): void` | Toast bleu. |
| `pushSaveSuccess` | `pushSaveSuccess(message = 'Sauvegarde effectuée avec succès'): void` | Alias legacy → `success(message)`. L'usage le plus fréquent dans `src/app`. |
| `pushSaveError` | `pushSaveError(message = 'Erreur durant la sauvegarde'): void` | Alias legacy → `error(message)`. |
| `pushMessage` | `pushMessage(toastr: Toastr): void` | Alias legacy objet : type déduit de `toastr.type`, sinon de `toastr.error` (`true` → `'error'`, sinon `'success'`) ; respecte `icone`. |
| `remove` | `remove(id: number): void` | Retire immédiatement un toast de la pile (appelé par `ToastrComponent` après l'animation de sortie). |

La pile est **plafonnée à 5 toasts** (`MAX_STACK`) : au-delà, le plus ancien est évincé.

### ToastrComponent — `billy-toastr` (standalone)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `toast` | `input.required<ToastrInstance>()` | — | Le toast à afficher. |

Pas d'output. État interne en signals : `leaving` (sortie en cours), `expanded` (dépliage mobile). Icône par type si `icone` est nul : `fa-check` / `fa-xmark` / `fa-triangle-exclamation` / `fa-circle-info`.

### ToastrListPanelComponent — `billy-toastr-list-panel` (standalone)

Aucun input/output. Itère `toastrService.messages()` (`@for … track toast.id`) dans un conteneur `aria-live="polite"`. À monter une seule fois, au niveau de la page authentifiée.

## Exemple d'utilisation

Montage du panneau (`src/app/auth/pages/auth-page.component.html`) :

```html
<billy-toastr-list-panel></billy-toastr-list-panel>
```

Appels réels :

```ts
// src/app/auth/pages/devis/devis-form/devis-form.component.ts
this.toastrService.pushSaveSuccess();
this.toastrService.pushSaveError();

// src/app/shared/components/bce-search/bce-search.component.ts
this.toastrService.error(
  "Impossible de récupérer la fiche de cette entreprise pour l'instant.",
  'Recherche BCE',
);

// src/app/auth/pages/client/client-form/client-form.component.ts
this.toastrService.warning(
  'La BCE ne renvoie aucune donnée exploitable pour ce numéro.',
  'Recherche BCE',
);
```

## Styles & theming

- **Le minuteur d'auto-fermeture EST l'animation CSS** de la barre de progression (`.toast-progress`, keyframes `billyToastProgress`, `scaleX(1) → scaleX(0)`). `animation-duration` est bindé à `toast().duration` et c'est l'événement `(animationend)` qui déclenche `close()`. Le survol (`.toast-card:hover`) met l'animation en `paused` : le toast reste affiché tant qu'on le lit, sans aucun timer JS à gérer.
- Sortie : `close()` pose la classe hôte `.leaving` ; le toast est une ligne de grille qui se replie (`grid-template-rows: 1fr → 0fr`) pour que la pile se referme sans saut, puis `remove()` après 250 ms.
- Tokens DS : coque via `--billy-surface`, `--billy-surface-border`, `--billy-text-soft`, `--billy-text-muted`. Les teintes par type viennent des [familles sémantiques](../styles/styles.md#familles-sémantiques-statuts) — `--t-accent` = `--billy-<hue>-strong` (liseré gauche, glyphe, barre de progression), `--t-icon-bg` = `--billy-<hue>-soft` (pastille) — pour `success` / `error` / `warning`, `info` reprenant l'Accent (`--billy-accent-strong` / `-soft`). Le **dark mode est automatique** (tokens), plus d'override local par type.
- Entrée : `billyToastInRight` (glissement depuis la droite) sur desktop, `billyToastInTop` (depuis le haut) sur mobile.
- **Mobile (< 768px)** : le toast devient une **pilule compacte** (icône + titre tronqué, `border-radius: 999px`, largeur au contenu) ; un tap (`toggleExpanded()`) la déplie en carte complète pour lire le message. La pile est alors centrée en pleine largeur (`toastr-list-panel.component.scss`).
- Positionnement : pile fixe `top: 78px; right: 16px; width: 340px; z-index: 10000`, ancrée sous la topbar ; le conteneur est en `pointer-events: none`, seules les cartes sont interactives.
- **Dark mode** (`:host-context(body.dark-mode)`) : accents éclaircis par type, ombre renforcée, textes adaptés.
- `prefers-reduced-motion: reduce` : les animations d'entrée/transition sont coupées, **mais la barre de progression reste** — c'est le minuteur du toast.

## Pièges & notes

- Ne pas monter `billy-toastr-list-panel` plusieurs fois : chaque instance afficherait toute la pile.
- La durée est figée à la création du toast (`duration` en ms) ; changer `hideDelay` n'affecte que les toasts suivants.
- `Toastr.error` est déprécié — utiliser `type: 'error'` dans `pushMessage`, ou directement `error()`.
- `remove()` retire sans animation : passer par la croix / l'auto-fermeture du composant pour une sortie animée.
- Le clic n'importe où sur la carte fait `toggleExpanded()` (utile surtout en mobile) ; la croix fait `stopPropagation()` pour ne pas déplier en fermant.
- Attention aux toasts poussés en rafale : au-delà de 5, les plus anciens disparaissent silencieusement.
