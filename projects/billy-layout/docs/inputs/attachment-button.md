# billy-attachment-button — AttachmentButtonComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/attachment-button/` · standalone component (pas de CVA — la valeur passe par un `model()`)

## Rôle

Bouton trombone pour joindre des fichiers **PDF** (maximum 3) à un envoi : premier clic sans fichier → ouvre le sélecteur de fichiers ; avec des fichiers → un badge compteur apparaît et le clic bascule un panneau listant les pièces jointes (`billy-attachment-button-list`) permettant d'en supprimer ou d'en ajouter. La fermeture au clic extérieur passe par `ClickOutsideDirective` (`lib/core/click-outside/`).

Utilisé dans `src/app` par les barres d'envoi : `email-form-panel` (dialogue d'email) et `peppol-facture-summary` (« Envoyer par email également »), dans le slot gauche de `billy-save-bar`.

## API

**Sélecteur & import**

```ts
import { AttachmentButtonComponent } from 'billy-layout';
```

**Inputs / modèle** (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `files` | **`model<File[]>`** | `[]` | Liste des fichiers joints — two-way binding `[(files)]`. C'est le canal de valeur du composant (pas de ControlValueAccessor). |

Constante publique : `MAX_FILES = 3` (non paramétrable à ce jour).

**Outputs** — aucun output propre en dehors du `filesChange` implicite du `model()`.

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `onButtonClick()` | Ouvre le sélecteur (aucun fichier) ou bascule la liste (≥ 1 fichier). |
| `triggerFileInput()` | Crée dynamiquement un `<input type="file" accept="application/pdf" multiple>` et le clique ; no-op si le max est atteint. |
| `deleteFile(index)` | Retire un fichier (referme la liste si elle se vide). |
| `closeList()` | Ferme le panneau. |
| `getTooltip()` | Tooltip du bouton : consigne + noms des fichiers joints. |

## ControlValueAccessor

Sans objet — le composant n'est pas un CVA. La valeur (`File[]`) s'échange via le `model()` :

```html
<billy-attachment-button [(files)]="files" />
```

avec, côté consommateur, `readonly files = model<File[]>([])` ou un signal writable. Les fichiers non-PDF sont filtrés à la sélection, et seuls les emplacements restants (max 3) sont remplis ; l'input fichier est réinitialisé après chaque sélection pour pouvoir re-choisir le même fichier.

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html` :

```html
<billy-save-bar ... >
  <div class="left-zone-buttons">
    <billy-attachment-button [(files)]="files" />
  </div>
</billy-save-bar>
```

et dans `email-form-panel.component.ts` : `readonly files = model<File[]>([]);` — le parent remonte ensuite ces `File[]` dans le `FormData` d'envoi.

## Styles & theming

- Le bouton est l'ex-`.btn` Bootstrap réécrit maison : fond transparent, couleur `#6c757d` (hover `#495057`), rayon `--billy-input-radius`, anneau `--billy-focus-ring` au focus visible, accent `--billy-accent` quand la liste est ouverte, `opacity: .5` + `cursor: not-allowed` au max de fichiers. Badge compteur rouge (`#dc3545`) en absolu sur le trombone.
- Icônes Font Awesome (`fa-paperclip`, `fa-file-pdf`, `fa-trash`, `fa-plus`, `fa-xmark`).
- Le panneau liste est en `position: absolute` sous le bouton (`z-index: 1000`, min 280 / max 400 px, contenu scrollable 300 px). Ses couleurs sont largement en dur (blanc, gris Bootstrap) — **pas de variante dark mode** à ce jour, seuls quelques tokens (`--billy-danger` pour l'icône PDF) sont branchés.

## Pièges & notes

- **PDF uniquement** : le filtre est `file.type === 'application/pdf'` — un fichier renommé `.pdf` sans type MIME correct est silencieusement ignoré, sans message d'erreur utilisateur.
- L'`<input type="file">` est créé **dynamiquement en JS** (`document.createElement`) à chaque ouverture, jamais rendu dans le template.
- `[(files)]` : le composant fait `files.set([...])` (immutabilité) — le parent peut donc réagir par `effect`/`computed` sans se soucier de mutations en place.
- Le suivi de la liste utilise `track file.name` : deux fichiers portant le même nom peuvent perturber le rendu de la liste (le doublon n'est pas empêché à l'ajout).
- `listenClickOutside` n'est actif que quand la liste est ouverte (`[listenClickOutside]="showList()"`) — même pattern zoneless que `billy-dropdown`.
- Pas d'état `disabled` : à intégrer côté parent si besoin (ex. masquer le bouton pendant l'envoi).

---

# billy-attachment-button-list — AttachmentButtonListComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/attachment-button/attachment-button-list/` · standalone component (présentation pure)

## Rôle

Panneau déroulant listant les pièces jointes : en-tête avec compteur `(n/max)` et bouton fermer, lignes fichier (icône PDF, nom tronqué avec `title`, bouton corbeille), pied « Ajouter un fichier » affiché tant que le max n'est pas atteint. Composant de présentation pur : il n'a aucun état, tout remonte au parent par outputs. Exporté dans l'API publique mais uniquement utilisé par `billy-attachment-button` dans le code actuel.

## API

**Inputs**

| Input | Type | Défaut | Description |
|---|---|---|---|
| `files` | `File[]` (**required**) | — | Fichiers à lister. |
| `maxFiles` | `number` | `3` | Plafond affiché dans l'en-tête et pilotant `canAddMore`. |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `deleteFile` | `number` | Index du fichier à supprimer. |
| `addFiles` | `void` | Demande d'ouverture du sélecteur. |
| `close` | `void` | Demande de fermeture du panneau. |

**Getter public** : `canAddMore` (`files().length < maxFiles()`).

## Exemple d'utilisation

Usage réel dans `attachment-button.component.html` :

```html
@if(showList()) {
  <billy-attachment-button-list
    [files]="files()"
    [maxFiles]="MAX_FILES"
    (deleteFile)="deleteFile($event)"
    (addFiles)="triggerFileInput()"
    (close)="closeList()"
  />
}
```

## Styles & theming

Voir ci-dessus (panneau absolu, couleurs héritées de Bootstrap reprises telles quelles — le bouton fermer `.abl-close` reproduit l'ex-`.btn-close`, l'icône PDF utilise `--billy-danger`). Pas de dark mode dédié.

## Pièges & notes

- `track file.name` dans le `@for` : voir la note doublons ci-dessus.
- Le composant ne fait aucune validation : le plafonnement et le filtrage PDF sont l'affaire du parent.
