# Viewers de fichiers — file-viewer (pdf / image / xml / toolbar)

> Catégorie `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/` · standalone components

## 1. Vue d'ensemble & architecture

La famille `file-viewer` regroupe les visionneuses de fichiers de la librairie :

| Composant | Sélecteur | Rôle |
|---|---|---|
| `FileViewerPdfComponent` | `<billy-file-viewer-pdf>` | Affichage PDF paginé/zoomable (via `ng2-pdf-viewer`) |
| `FileViewerImageComponent` | `<billy-file-viewer-image>` | Affichage d'une image (blob → object URL) |
| `FileViewerXmlComponent` | `<billy-file-viewer-xml>` | Affichage XML ré-indenté et coloré, avec copie presse-papiers |
| `FileViewerToolbarComponent` | `<billy-file-viewer-toolbar>` | Barre d'en-tête commune (icône, nom de fichier, spinner, bouton fermer, slot d'actions) |

Tous sont exportés par le `public-api.ts` de la librairie (section `viewers`), ainsi que le contrat `billy-file-source` (`BillyFileSource`, `BillyViewerFile`, `BILLY_FILE_SOURCE`).

**Principe d'architecture** : les viewers ne connaissent **ni le serveur, ni l'authentification**. Ils reçoivent un `BillyViewerFile` (id + nom) et obtiennent le contenu exclusivement via le token d'injection `BILLY_FILE_SOURCE`, que l'application **doit fournir** pour utiliser `billy-file-viewer-pdf` / `-image` / `-xml` (la toolbar seule s'en passe : elle est purement présentationnelle). Sans provider, l'`inject(BILLY_FILE_SOURCE)` échoue à la création du composant.

Les trois viewers partagent le même patron :

- un input `fichier` (le fichier à afficher) ;
- un signal `visible` piloté par les méthodes impératives `show()` / `hide()` (le parent les appelle via `viewChild`) ;
- un `effect()` dans le constructeur qui (re)charge le contenu quand `fichier()` change ;
- un rendu conditionnel `@if (visible() && …)` : composant toujours présent dans le DOM du parent, panneau affiché à la demande ;
- la toolbar commune en tête, avec projection de boutons d'action spécifiques.

## 2. Le contrat `BILLY_FILE_SOURCE`

Source : `projects/billy-layout/src/lib/viewers/file-viewer/billy-file-source.ts`.

### Interface `BillyFileSource`

```ts
export interface BillyFileSource {
  /** URL absolue de téléchargement (viewer PDF : fetch interne à ng2-pdf-viewer). */
  downloadUrl(fileId: number): string;
  /** Jeton porté en `Authorization: Bearer …` par le viewer PDF. */
  authToken(): string | null;
  /** Contenu binaire (viewer image). */
  downloadBlob(fileId: number): Observable<Blob>;
  /** Contenu texte (viewer XML). */
  downloadText(fileId: number): Observable<string>;
}

export const BILLY_FILE_SOURCE = new InjectionToken<BillyFileSource>('BILLY_FILE_SOURCE');
```

Qui utilise quoi — et pourquoi deux styles d'accès coexistent :

| Méthode | Consommateur | Raison |
|---|---|---|
| `downloadUrl(fileId)` + `authToken()` | `FileViewerPdfComponent` | `ng2-pdf-viewer` (pdf.js) **télécharge lui-même** le document : il faut donc une **URL absolue** et le jeton passé explicitement en header `Authorization: Bearer …` — l'intercepteur HTTP Angular de l'app ne voit jamais passer cette requête. |
| `downloadBlob(fileId)` | `FileViewerImageComponent` | Requête `HttpClient` classique : l'implémentation app peut utiliser une URL relative, l'intercepteur pose base URL et Authorization. |
| `downloadText(fileId)` | `FileViewerXmlComponent` | Idem, en `responseType: 'text'`. |

### Interface `BillyViewerFile`

```ts
export interface BillyViewerFile {
  id?: number;
  fileName?: string;
}
```

Interface **structurelle** minimale : le modèle `Fichier` de l'application (`src/app/shared/components/uploadmanager/fichier.ts`) la satisfait tel quel, sans adaptateur. `id` sert au téléchargement, `fileName` à l'affichage dans la toolbar. Les deux champs sont optionnels dans le type, mais un fichier sans `id` ne peut pas être affiché (le PDF ne construit pas d'URL, image/xml lèvent une erreur loguée).

### Implémentation applicative : `FichierSourceService`

Le provider est déclaré dans `src/app/app.config.ts` :

```ts
// Les viewers de fichiers de billy-layout obtiennent leur contenu ici.
{ provide: BILLY_FILE_SOURCE, useExisting: FichierSourceService },
```

Et l'implémentation complète, `src/app/shared/service/fichier-source.service.ts` :

```ts
@Injectable({ providedIn: 'root' })
export class FichierSourceService implements BillyFileSource {

  constructor(private http: HttpClient) {}

  downloadUrl(fileId: number): string {
    return environment.serverUrl + 'fichiers/' + fileId + '/download';
  }

  authToken(): string | null {
    return LocalService.getToken();
  }

  downloadBlob(fileId: number): Observable<Blob> {
    return this.http.get('fichiers/' + fileId + '/download', { responseType: 'blob' }) as Observable<Blob>;
  }

  downloadText(fileId: number): Observable<string> {
    return this.http.get('fichiers/' + fileId + '/download', { responseType: 'text' }) as Observable<string>;
  }
}
```

À noter : ce service sert aussi **hors viewers** — l'app le réutilise directement pour tout accès au contenu d'un fichier, par exemple l'avatar du compte (`src/app/auth/pages/compte/compte-document/compte-document.component.ts` et `src/app/shared/components/icon-top-compte/icon-top-compte.component.ts` appellent `downloadBlob()`).

---

## 3. `billy-file-viewer-toolbar` — FileViewerToolbarComponent

> Catégorie `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-toolbar/file-viewer-toolbar.component.ts` · standalone component

### Rôle

Barre d'en-tête commune aux trois viewers : icône du type de fichier (remplacée par un spinner `fa-sync fa-spin` pendant le chargement), nom du fichier (ellipsé, `title` complet au survol), zone d'actions projetée (`<ng-content>`) et bouton « Fermer ». Langage visuel aligné sur les lignes du file upload (`upload-manager-list-row`). Purement présentationnelle : c'est le seul composant de la famille qui n'a pas besoin de `BILLY_FILE_SOURCE`.

### API

```ts
import { FileViewerToolbarComponent } from 'billy-layout';
```

| Input | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `string` | `''` | Classes de l'icône Font Awesome (ex. `fa-solid fa-file-pdf`). |
| `filename` | `string \| undefined` | — (`input.required`) | Nom affiché. `undefined` accepté : les viewers passent le `fileName` optionnel de `BillyViewerFile`. |
| `loading` | `boolean` | `false` | Remplace l'icône par un spinner. |

| Output | Payload | Description |
|---|---|---|
| `closeViewer` | `void` | Émis au clic sur le bouton « Fermer » (méthode interne `hide()`). |

Contenu projeté : tout élément placé entre les balises est rendu dans la zone d'actions, avant le bouton fermer. Convention : des boutons `.viewer-btn` (28×28 px) — la classe est stylée par la toolbar pour ses propres boutons, mais **les boutons projetés doivent porter leurs styles dans le composant hôte** (encapsulation Angular) ; c'est pour ça que `file-viewer-pdf` et `file-viewer-xml` dupliquent la règle `.viewer-btn` dans leur propre SCSS.

### Exemple d'utilisation réel

Extrait de `file-viewer-xml.component.html` :

```html
<billy-file-viewer-toolbar [loading]="loading()" [filename]="fichierTpl.fileName"
                         icon="fa-solid fa-file-code" (closeViewer)="hide()">
  <button type="button" class="viewer-btn" (click)="copyToClipboard()">…</button>
</billy-file-viewer-toolbar>
```

### Styles & theming

- `position: sticky; top: 0; z-index: 10` : la toolbar reste visible quand le corps du viewer scrolle (utile pour l'XML à `max-height: 600px`).
- Couleurs codées en dur (pas de tokens `--billy-*`) : fond `#f9fafb`, bordure `#e5e7eb`, hover boutons `#2563eb`, hover du bouton fermer `#dc2626`.
- Dark mode via `:host-context(.dark-mode)` (fonds `#1a2528` / `#212e31`, bordures `#49545a`).

### Pièges & notes

- `filename` est `input.required` : l'oublier est une erreur à l'exécution, même si sa valeur peut être `undefined`.
- Les icônes sont des classes Font Awesome : la police FA doit être chargée par l'application hôte (la lib ne l'embarque pas).

---

## 4. `billy-file-viewer-pdf` — FileViewerPdfComponent

> Catégorie `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-pdf/file-viewer-pdf.component.ts` · standalone component

### Rôle

Visionneuse PDF basée sur `ng2-pdf-viewer` (pdf.js) : affichage page par page (`[show-all]="false"`), navigation précédent/suivant avec indicateur `n / total` (masquée si une seule page), zoom 0.1 → 2 par pas de 0.1. Le composant construit lui-même la requête de téléchargement à partir de `BILLY_FILE_SOURCE`.

### API

```ts
import { FileViewerPdfComponent } from 'billy-layout';
```

| Input | Type | Défaut | Description |
|---|---|---|---|
| `fichier` | `BillyViewerFile \| null` | `null` | Fichier à afficher. Tout changement relance `initPdf()` (reset page/zoom, reconstruction de la source). |

Pas d'output. État et méthodes publics :

| Membre | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panneau affiché ou non (`@if (visible() && urlObject && fichier)`) . |
| `loading` | `signal<boolean>` | Vrai pendant le téléchargement (branché sur `(on-progress)` de pdf.js). |
| `show()` | `void` | Affiche le viewer. |
| `hide()` | `void` | Masque le viewer et remet `currentPage` à 0. |
| `pdfComponent` | `viewChild<PdfViewerComponent>` | Accès au composant `ng2-pdf-viewer` sous-jacent. |

La source passée à `<pdf-viewer [src]>` est un objet pdf.js :

```ts
this.urlObject = {
  url : this.fileSource.downloadUrl(fichier.id),   // URL absolue
  withCredentials: true,
  httpHeaders: { Authorization: 'Bearer ' + this.fileSource.authToken() },
};
```

C'est la raison d'être de `downloadUrl()`/`authToken()` dans le contrat : le fetch est fait **par pdf.js**, pas par `HttpClient`, donc aucun intercepteur applicatif ne s'applique.

### Exemple d'utilisation réel

`src/app/shared/components/uploadmanager/upload-manager-list-with-viewer/upload-manager-list-with-viewer.component.html` — les trois viewers partagent un même `fichierToView`, le parent les rend mutuellement exclusifs :

```html
<billy-file-viewer-pdf   [fichier]="fichierToView" #viewerPdf></billy-file-viewer-pdf>
<billy-file-viewer-image [fichier]="fichierToView" #viewerImage></billy-file-viewer-image>
<billy-file-viewer-xml   [fichier]="fichierToView" #viewerXml></billy-file-viewer-xml>
```

```ts
askViewFilePdf(fichier: Fichier) {
  this.fichierToView = fichier;
  this.viewerImage()?.hide();
  this.viewerXml()?.hide();
  this.viewerPdf()?.show();
}
```

### Styles & theming

Carte bordée arrondie (10 px), corps `#f9fafb` avec `overflow-x: auto` ; boutons compacts `.viewer-btn` regroupés en `.viewer-group` (nav + zoom) projetés dans la toolbar ; dark mode via `:host-context(.dark-mode)`.

### Pièges & notes

- **Worker pdf.js local** : le constructeur force `(window as any).pdfWorkerSrc = '/assets/js/pdf.worker.min.js'` pour éviter le CDN Cloudflare. L'application hôte doit donc copier le worker dans ses assets — cf. `angular.json` :
  ```json
  { "glob": "pdf.worker.min.js", "input": "node_modules/pdfjs-dist/build/", "output": "/assets/js/" }
  ```
- **Dépendance npm** : `ng2-pdf-viewer` (`^9.0.0`) est une dépendance de l'**application** (`package.json` racine), pas de la lib — elle n'apparaît pas dans les `peerDependencies` de `projects/billy-layout/package.json` (qui ne liste qu'Angular + rxjs). Toute app consommatrice doit l'installer elle-même, et déclarer `ng2-pdf-viewer`, `pdfjs-dist/build/pdf` et `pdfjs-dist/web/pdf_viewer` dans `allowedCommonJsDependencies` (`angular.json`) pour éviter les warnings CommonJS au build.
- **Hauteur recalculée à `pageRendered`** : `<pdf-viewer>` reçoit `style="height: {{pdfViewerHeight}}px"`, et cette hauteur est recalculée à chaque événement `(page-rendered)` : `clientHeight` du viewer interne + 30 px. La hauteur s'adapte donc à la page courante (et au zoom) *après* son rendu — un `console.log('Page rendered: …')` de debug est encore présent dans ce handler.
- Pagination interne 0-based (`currentPage`), affichage 1-based (`[page]="currentPage + 1"`).
- L'état pagination/zoom (`currentPage`, `zoom`, `btn*Disabled`…) est en champs mutables classiques, pas en signals : le rendu est rafraîchi par les événements DOM (app zoneless — voir la note mémoire « Billy zoneless » si ce composant doit évoluer).
- `hide()` remet la page à 0 mais conserve le zoom.

---

## 5. `billy-file-viewer-image` — FileViewerImageComponent

> Catégorie `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-image/file-viewer-image.component.ts` · standalone component

### Rôle

Visionneuse d'image : télécharge le binaire via `fileSource.downloadBlob(id)`, crée un object URL (`window.URL.createObjectURL`) marqué de confiance (`DomSanitizer.bypassSecurityTrustUrl`) et l'affiche dans un `<img>` centré. Spinner pendant le chargement.

### API

```ts
import { FileViewerImageComponent } from 'billy-layout';
```

| Input | Type | Défaut | Description |
|---|---|---|---|
| `fichier` | `BillyViewerFile \| null` | `null` | Image à afficher. Tout changement déclenche `refreshImage()` (re-téléchargement). |

Pas d'output. État et méthodes publics :

| Membre | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panneau affiché ou non. |
| `loading` | `signal<boolean>` | Vrai pendant le téléchargement du blob. |
| `imageUrlTrusted` | `signal<SafeUrl \| null>` | Object URL sécurisé consommé par le template. |
| `show()` / `hide()` | `void` | Affichent / masquent le viewer. |

### Exemple d'utilisation réel

Même hôte que le PDF : `upload-manager-list-with-viewer` (`askViewFileImage()` → `viewerPdf.hide()`, `viewerXml.hide()`, `viewerImage.show()`), déclenché par l'output `(viewImage)` de `app-upload-manager-list`.

### Styles & theming

Corps flex centré, `img { max-width: 100%; border-radius: 6px; box-shadow: … }` ; dark mode via `:host-context(.dark-mode)` (ombre renforcée). Toolbar avec icône `fa-solid fa-image`, sans boutons projetés.

### Pièges & notes

- **Téléchargement même masqué** : l'`effect()` réagit au changement de `fichier()` indépendamment de `visible` — assigner un fichier télécharge le blob même si le viewer n'est jamais montré. `show()` ne re-télécharge pas (contrairement au viewer XML).
- **Object URLs jamais révoqués** : pas de `URL.revokeObjectURL` ; chaque changement de fichier laisse l'ancien blob en mémoire jusqu'au déchargement de la page.
- Erreur de téléchargement : simplement loguée en console ; l'ancienne image (si présente) reste affichée.

---

## 6. `billy-file-viewer-xml` — FileViewerXmlComponent

> Catégorie `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-xml/file-viewer-xml.component.ts` · standalone component

### Rôle

Visionneuse XML (typiquement les UBL Peppol) : télécharge le texte via `fileSource.downloadText(id)`, le **ré-indente** (une balise par ligne, indentation par profondeur — `formatXml`) puis le **colore** (balises, attributs, valeurs, prologue `<?xml …?>`, commentaires — `highlightXml`, sortie HTML échappée passée par `bypassSecurityTrustHtml`). Bouton « Copier le contenu » dans la toolbar qui copie le **XML brut** (non reformaté) et affiche un check pendant 1,5 s.

### API

```ts
import { FileViewerXmlComponent } from 'billy-layout';
```

| Input | Type | Défaut | Description |
|---|---|---|---|
| `fichier` | `BillyViewerFile \| null` | `null` | Fichier XML à afficher. Tout changement déclenche `refreshXml()`. |

Pas d'output. État et méthodes publics :

| Membre | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panneau affiché ou non. |
| `loading` | `signal<boolean>` | Vrai pendant le téléchargement. |
| `xmlHtml` | `signal<SafeHtml \| null>` | XML formaté/coloré ; `null` en cas d'échec → message « Impossible d'afficher ce fichier. ». |
| `copied` | `signal<boolean>` | Feedback du bouton copier (retombe après 1,5 s). |
| `show()` | `void` | **Relance `refreshXml()`** puis affiche le viewer. |
| `hide()` | `void` | Masque le viewer. |
| `copyToClipboard()` | `Promise<void>` | Copie le XML brut via `navigator.clipboard`. |

### Exemple d'utilisation réel

Même hôte que les autres : `upload-manager-list-with-viewer` (`askViewFileXml()`), déclenché par l'output `(viewXml)` de la liste d'uploads.

### Styles & theming

- Corps `max-height: 600px; overflow: auto` (la toolbar sticky reste visible au scroll), `<pre class="xml-content">` en police mono 12,5 px.
- Coloration par classes CSS `.xml-tag` (bleu), `.xml-attr` (violet), `.xml-value` (vert), `.xml-prolog` / `.xml-comment` (gris) — chacune avec sa variante dark via `:host-context(.dark-mode)`.

### Pièges & notes

- **Double fetch possible** : l'`effect()` télécharge au changement de `fichier()` (même masqué), et `show()` relance un `refreshXml()` — afficher un fichier fraîchement assigné le télécharge donc deux fois.
- `highlightXml` échappe l'intégralité du contenu avant coloration : le `bypassSecurityTrustHtml` ne fait passer que les `<span>` générés par le composant, pas de HTML issu du fichier.
- Le reformatage est heuristique (regex, pas de parseur XML) : suffisant pour de l'UBL machine-généré, sans garantie sur du XML exotique (CDATA multiligne, etc.).
- `navigator.clipboard` exige un contexte sécurisé (HTTPS/localhost) ; en cas d'échec, l'erreur est seulement loguée.
