# billy-button-ajout — ButtonAjoutComponent

> Catégorie `buttons` · source `projects/billy-layout/src/lib/buttons/button-ajout/` · standalone component

## Rôle

Tuile d'action « ajouter » : pastille d'icône ronde + titre + sous-titre optionnel, en style contour bleu accent (#23b7e5). C'est le bouton d'entrée des créations rapides, pensé pour vivre dans une grille d'actions aux côtés d'`billy-button-upload` (même anatomie de tuile). Utilisé dans `src/app/auth/pages/home/home-actions/home-actions.component.html` (« Nouvel achat », « Nouvelle vente »), `src/app/auth/pages/dashboard/dashboard-list-achat/dashboard-list-achat.component.html` et `src/app/auth/pages/dashboard/dashboard-list-vente/dashboard-list-vente.component.html`.

## API

### Sélecteur & import

```ts
import { ButtonAjoutComponent } from 'billy-layout';
```

Sélecteur : `<billy-button-ajout>`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `'Ajouter'` | Titre de la tuile. |
| `subtitle` | `string` | `''` | Sous-titre discret sous le titre ; omis si vide. |
| `icon` | `string` | `'fa-solid fa-pen-to-square'` | Classes Font Awesome de l'icône dans la pastille ronde. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clicked` | `MouseEvent` | Clic sur la tuile. L'événement d'origine a reçu `stopPropagation()` avant émission. |

### Méthodes publiques

`onClick(event: MouseEvent)` : handler du template (`stopPropagation` puis émission de `clicked`).

## Slots / projection

Aucun — tout passe par les inputs.

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/home/home-actions/home-actions.component.html` :

```html
<billy-button-ajout
  class="action-item"
  label="Nouvel achat"
  subtitle="Saisie manuelle"
  icon="fa-solid fa-download"
  (clicked)="addAchat($event)">
</billy-button-ajout>
```

## Styles & theming

- `:host { display: block; flex: 1; min-width: 0 }` : la tuile se partage équitablement la largeur d'un conteneur flex (grille d'actions).
- Style contour : transparent, bord 2px et texte `#23b7e5` (accent codé en dur, pas de token `--billy-*`) ; pastille d'icône ronde 34px sur fond accent à 10%.
- Survol : fond `#e8f8fd`, légère élévation (`translateY(-1px)`) + ombre teintée accent.
- Dark mode via `:host-context(.dark-mode)` : garde le contour accent, survol sur accent translucide (`rgba(35,183,229,0.12)`) au lieu du bleu pâle.

## Pièges & notes

- Ce n'est **pas un `<button>`** mais un `<div>` cliquable : pas de focus clavier, pas de rôle ARIA, pas d'activation Entrée/Espace — à réserver aux actions dupliquées ailleurs ou à compléter côté consommateur si l'accessibilité est requise.
- `stopPropagation()` systématique : un conteneur cliquable parent ne verra jamais le clic.
- Pas d'état `disabled`/`loading` (contrairement à `billy-button-upload`).
- Les couleurs accent sont codées en dur (#23b7e5 et dérivés), alignées sur l'ex-`.btn-info` du thème — un changement d'accent du DS ne se propagera pas automatiquement.
