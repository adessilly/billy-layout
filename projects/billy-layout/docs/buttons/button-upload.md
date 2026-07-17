# billy-button-upload — ButtonUploadComponent

> Catégorie `buttons` · source `projects/billy-layout/src/lib/buttons/button-upload/` · standalone component

## Rôle

Tuile d'import de fichier : même anatomie qu'`billy-button-ajout` (pastille d'icône + titre + sous-titre) mais en style « zone d'import » (fond gris, bord pointillé), avec un `<input type="file">` caché déclenché au clic et un état `loading` (spinner + « Chargement... », tuile inerte). Émet le fichier choisi ; c'est le point d'entrée du scan de facture par IA. Utilisé dans `src/app/auth/pages/home/home-actions/home-actions.component.html` (« Scanner une facture ») et `src/app/auth/pages/dashboard/dashboard-list-achat/dashboard-list-achat.component.html`.

## API

### Sélecteur & import

```ts
import { ButtonUploadComponent } from 'billy-layout';
```

Sélecteur : `<billy-button-upload>`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `'Importer'` | Titre de la tuile (remplacé par « Chargement... » pendant `loading`). |
| `subtitle` | `string` | `'Depuis un fichier'` | Sous-titre, toujours affiché. |
| `accept` | `string` | `'.pdf,.jpg,.jpeg,.png,.gif'` | Valeur de l'attribut `accept` de l'input fichier. |
| `loading` | `boolean` | `false` | État chargement : spinner à la place de l'icône, tuile estompée et non cliquable (`pointer-events: none`). |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `fileSelected` | `File` | Fichier choisi dans le sélecteur natif (un seul fichier). Non émis si l'utilisateur annule. |

### Méthodes publiques

| Méthode | Description |
|---|---|
| `trigger()` | Ouvre le sélecteur de fichier natif (clic programmatique sur l'input caché, obtenu via `viewChild.required`). Appelée par la tuile, utilisable aussi depuis le parent. |
| `onFileChange(event: Event)` | Handler du `(change)` : émet `fileSelected` puis **réinitialise la valeur de l'input**, pour que re-choisir le même fichier redéclenche l'événement. |

## Slots / projection

Aucun — tout passe par les inputs.

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/home/home-actions/home-actions.component.html` :

```html
<billy-button-upload
  class="action-item action-upload"
  label="Scanner une facture"
  subtitle="Import IA"
  [loading]="uploadLoading()"
  (fileSelected)="onFileSelected($event)">
</billy-button-upload>
```

## Styles & theming

- `:host { display: block; flex: 1; min-width: 0 }` : conçu pour une grille d'actions flex, aux côtés d'`billy-button-ajout`.
- Style import : fond `#f4f6f7`, texte `#555`, bord 2px **pointillé** `#ccc` ; au survol (hors loading), la tuile passe à l'accent (#23b7e5, fond `#e8f8fd`, élévation + ombre).
- `is-loading` : opacité 0.65, `cursor: not-allowed`, `pointer-events: none`.
- Couleurs codées en dur, pas de token `--billy-*` ; **pas de règles dark mode** (contrairement à `billy-button-ajout`) : le fond gris clair reste tel quel sous `body.dark-mode`.

## Pièges & notes

- Comme `billy-button-ajout`, la tuile est un `<div>` cliquable, pas un `<button>` : pas d'accessibilité clavier native.
- Mono-fichier : `input.files?.[0]` — pas d'attribut `multiple`, un seul `fileSelected` par sélection.
- L'input est réinitialisé après chaque sélection : reprendre le même fichier deux fois de suite fonctionne (le `change` natif ne se déclencherait pas sinon).
- `accept` est indicatif (filtre du sélecteur natif) : ne dispense pas d'une validation du type côté consommateur.
- Le libellé « Chargement... » est codé en dur dans le template (seul `labelSaveLoading`-like absent) ; le sous-titre, lui, reste affiché pendant le chargement.
