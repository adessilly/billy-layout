# delete-dialog — `DeleteDialogComponent`

> Catégorie `dialogs` · source `projects/billy-layout/src/lib/dialogs/delete-dialog/` · standalone component (`billy-delete-dialog`) + enum `MessageDialogClick`

## Rôle

Dialogue de **confirmation de suppression** : carte centrée (max 420px) avec illustration SVG animée (le couvercle de la corbeille s'ouvre, le document tombe dedans), titre, message, bloc optionnel « élément concerné » (nom + prix), avertissement « Cette action est définitive. », et deux boutons — Annuler et un bouton danger (libellé configurable). Contrairement à `billy-dialog-form`, il **ne s'ouvre pas tout seul** : on le déclare dans le template et on l'ouvre programmatique­ment via `openDialog()` ou `openDialogAndWait()`.

## API

### Enum `MessageDialogClick`

```ts
export enum MessageDialogClick {
  PRIMARY = 1,
  SECONDARY = 2,
  CANCEL = 3
}
```

Type de retour déclaré de la promesse d'`openDialogAndWait()` (voir Pièges : la valeur n'est pas réellement renseignée aujourd'hui).

### Inputs (tous des `model()`, donc modifiables aussi par code)

| Model | Type | Défaut | Rendu |
|---|---|---|---|
| `titre` | `string` | `'Confirmation suppression'` | Titre `h5.del-title` |
| `message` | `string` | `'Voulez-vous supprimer cet enregistrement ?'` | Paragraphe `.del-message` |
| `productName` | `string` | `''` | Nom de l'élément dans le bloc `.del-item` (affiché si non vide) |
| `prix` | `number` | `0` | Prix formaté `currency:'EUR'` (affiché si non nul) |
| `label` | `string` | `''` | Suffixe affiché **après le prix** (ex. « HTVA ») |
| `labelValidate` | `string` | `'Supprimer'` | Libellé du bouton danger |

### Outputs

| Output | Type | Émis quand |
|---|---|---|
| `delete` | `string` (valeur `'delete'`) | L'utilisateur clique le bouton danger. Le bouton porte aussi `data-billy-dismiss` : le dialogue se ferme dans la foulée. |

### Méthodes publiques

| Méthode | Signature | Description |
|---|---|---|
| `openDialog` | `openDialog(): void` | Déplace la racine `#modalDelete` sous `<body>` (`document.body.appendChild`), crée un `new Dialog(...)`, `show()`, et au `listenClose()` (première émission) retire l'élément du `<body>`. |
| `openDialogAndWait` | `openDialogAndWait(titre: string, sousTitre: string, label: string): Promise<MessageDialogClick>` | Variante « promesse » : pose `titre`, `productName` (= `sousTitre`) et `label`, ouvre le dialogue et rend une promesse **résolue uniquement à la confirmation** (clic sur le bouton danger). |
| `askDelete` | `askDelete(): void` | Handler du bouton danger : émet `delete` puis résout la promesse en attente le cas échéant. Appelé par le template. |

### Fermeture

Croix `.del-close`, bouton « Annuler » et bouton danger portent tous `data-billy-dismiss` ; Échap et clic sur le fond ferment aussi (comportement standard de `Dialog`).

## Exemple d'utilisation

Usage réel : `src/app/auth/pages/devis/devis-card/devis-card.component.*` (même motif dans vente-card, achat-card, devis-form, etc.).

Template :

```html
<billy-delete-dialog
  message="Voulez-vous supprimer ce devis ?"
  [productName]="d.libelle"
  [prix]="d.prix"
  (delete)="onDeleteConfirmed()" #deleteDialog>
</billy-delete-dialog>
```

Composant :

```ts
readonly deleteDialog = viewChild.required<DeleteDialogComponent>('deleteDialog');

askDelete(): void {
  this.deleteDialog().openDialog();
}
```

Variante promesse (usage réel : `src/app/shared/components/uploadmanager/upload-manager-list/upload-manager-list.component.ts`) :

```ts
this.deleteDialog().openDialogAndWait('Voulez-vous supprimer ce fichier ?', fichier.fileName, '')
  .then(async () => { /* suppression confirmée */ });
```

## Styles & theming

- Coque de base : classes globales `.billy-modal*` (`lib/styles/_billy-dialog.scss`) + SCSS de composant `delete-dialog.component.scss` (classes préfixées `del-`).
- `z-index: 9000` sur `.del-modal` : passe **au-dessus** des overlays `billy-dialog-form` (cas : suppression demandée depuis un dialogue).
- Entrée personnalisée : léger « pop » (`translateY(14px) scale(0.96)` → none) à la place du glissement standard de `.billy-modal-dialog`.
- Couleurs via tokens `--billy-*` (`--billy-surface`, `--billy-surface-border`, `--billy-danger`…) → dark mode automatique. La modale vivant sous `<body>`, seuls les attributs `_ngcontent` suivent les nœuds : **pas de `:host`** dans le SCSS (commentaire d'en-tête du fichier).
- L'animation SVG (halo, ondes, couvercle, feuille) rejoue à chaque ouverture grâce au passage `display: none → block` piloté par `Dialog`.

## Pièges & notes

- **`openDialogAndWait` ne résout jamais en cas d'annulation** (Annuler, croix, Échap, clic-fond) : la promesse reste pendante. Ne pas `await` en série avec du code qui doit s'exécuter quoi qu'il arrive ; réserver le `.then(...)` au chemin « confirmé ». La promesse est par ailleurs résolue **sans valeur** (`undefined`), malgré le type déclaré `Promise<MessageDialogClick>` — ne pas tester la valeur de retour.
- **Le 3ᵉ paramètre d'`openDialogAndWait` alimente `label`** (le suffixe affiché après le prix), **pas** `labelValidate` (le libellé du bouton). Pour changer le libellé du bouton, passer par `[labelValidate]` ou `labelValidate.set(...)`.
- `openDialogAndWait` ne touche pas à `message` : le message reste celui posé par input (ou le défaut) ; le « sous-titre » passé va dans `productName`.
- Le bloc `.del-item` n'apparaît que si `productName` **ou** `prix` est truthy ; un prix à `0` n'est pas affiché.
- Rouvrir le dialogue est sûr : chaque `openDialog()` crée une nouvelle instance `Dialog`, et une ouverture précédente non soldée est écrasée côté promesse (le résolveur est remplacé).
- L'output s'appelle `delete` : dans un template, se lie `(delete)="..."` — attention aux collisions de nommage en TypeScript (`delete` est un mot-clé ; l'output est accessible via `this.delete` malgré tout).
