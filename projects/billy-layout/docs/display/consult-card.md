# billy-consult-card — ConsultCardComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/consult-card/` · standalone component

## Rôle

Carte de consultation « à section unique » : carte blanche du design system (mixin `billy-card`) avec un titre à pastille-icône (petites capitales), un badge de comptage optionnel et une zone d'actions à droite du titre. C'est la brique standard des écrans de consultation pour encadrer un bloc d'information.

Utilisation dans `src/app` (vérifiée par grep, ~14 fichiers) : `vente-consult` (carte « Facturation électronique Peppol »), `achat-form`, `devis-form`, `compte` / `compte-peppol` / `compte-prompt`, `client-consult` (cartes stats, historique, CA), `agenda` (`consult-agenda-card`), `peppol-inbox-list`, `upload-manager`, `fichiers-manager`.

## API

**Sélecteur** : `billy-consult-card` · **Import** : `import { ConsultCardComponent } from 'billy-layout';`

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` (**`input.required`**) | — | Libellé du titre de la carte (affiché en petites capitales). |
| `icon` | `string` (**`input.required`**) | — | Classe d'icône FontAwesome de la pastille (ex. `fa-solid fa-globe`). |
| `badge` | `number \| null` | `null` | Badge numérique affiché après le libellé (pastille cyan). `null` = pas de badge — un `0` s'affiche bien. |

### Outputs

Aucun.

## Slots / projection

| Slot | Sélecteur | Rôle |
|---|---|---|
| Actions | `[card-actions]` | Éléments projetés à droite du titre (`.cc-actions`, `margin-left: auto`) — typiquement des petits boutons. La typo du titre (uppercase, letter-spacing) y est neutralisée. |
| Corps | défaut | Contenu de la carte, rendu dans `.cc-body`. |

## Exemple d'utilisation

`vente-consult.component.html` :

```html
<billy-consult-card label="Facturation électronique Peppol" icon="fa-solid fa-globe">
  <button card-actions type="button" class="btn btn-sm btn-outline-secondary" (click)="askGotoPeppol()">
    Gérer
  </button>
  <app-peppol-facture-logs [logs]="peppolLogs()"></app-peppol-facture-logs>
</billy-consult-card>
```

## Styles & theming

- `:host` reçoit `display: block` + le mixin **`billy-card`** (`@use 'billy-cards'`) : surface `--billy-surface`, bord `--billy-surface-border`, radius 16px, ombre `--billy-card-shadow`.
- Titre : mixins **`billy-section-title`** et **`billy-section-icon`** (pastille `--billy-accent-soft` / `--billy-accent-strong`).
- Badge : `--billy-accent-soft` (fond) / `--billy-accent-strong` (texte).
- **Dark mode entièrement porté par les tokens `--billy-*`** — aucun bloc `:host-context(.dark-mode)` local.
- Les boutons projetés `btn btn-outline-secondary` (héritage Bootstrap) sont re-thémés via `::ng-deep` sur les tokens (`--billy-input-border`, `--billy-text-soft`, `--billy-addon-bg`, `--billy-focus-ring`) pour suivre le dark mode.

## Pièges & notes

- **Règle anti-imbrication** : `billy-consult-card` est une carte à **contenu unique, sans sous-panneau gris**. Le mixin `billy-section` (fond gris `--billy-section-bg`) est réservé aux cartes **multi-sections** construites à la main (cf. `docs/billy-cards.md`). Ne pas imbriquer une section grise unique dans une consult-card — c'est du bruit visuel.
- `label` et `icon` sont `input.required` : oubli = erreur à l'exécution.
- Le test du badge est `badge() !== null` : passer `0` affiche bien « 0 » ; utiliser `null` (et non `undefined` casté) pour le masquer.
- Le slot `[card-actions]` est stylé pour des boutons compacts ; le hack `::ng-deep` ne cible que `.btn.btn-outline-secondary` — d'autres styles de boutons projetés doivent gérer leur propre dark mode.
