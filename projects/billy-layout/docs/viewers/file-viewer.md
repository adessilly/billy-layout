# File viewers — file-viewer (pdf / image / xml / toolbar)

> Category `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/` · standalone components

## 1. Overview & architecture

The `file-viewer` family groups the library's file viewers:

| Component | Selector | Role |
|---|---|---|
| `FileViewerPdfComponent` | `<billy-file-viewer-pdf>` | Paginated/zoomable PDF display (via `ng2-pdf-viewer`) |
| `FileViewerImageComponent` | `<billy-file-viewer-image>` | Image display (blob → object URL) |
| `FileViewerXmlComponent` | `<billy-file-viewer-xml>` | Re-indented, syntax-highlighted XML display, with clipboard copy |
| `FileViewerToolbarComponent` | `<billy-file-viewer-toolbar>` | Shared header bar (icon, file name, spinner, close button, actions slot) |

All are exported by the library's `public-api.ts` (`viewers` section), along with the `billy-file-source` contract (`BillyFileSource`, `BillyViewerFile`, `BILLY_FILE_SOURCE`).

The viewers' control strings come from the i18n dictionary (`viewer.*`): toolbar close button `viewer.close` (EN "Close"), PDF navigation `viewer.prevPage` / `.nextPage` and zoom `viewer.zoomIn` / `.zoomOut`, XML copy button `viewer.copy` / `.copied` and the failure message `viewer.cannotDisplay` (EN "Unable to display this file."). Built-in strings are localizable — see [i18n](../core/i18n.md).

**Architecture principle**: the viewers know **neither the server nor the authentication**. They receive a `BillyViewerFile` (id + name) and obtain the content exclusively through the `BILLY_FILE_SOURCE` injection token, which the application **must provide** to use `billy-file-viewer-pdf` / `-image` / `-xml` (only the toolbar does without it: it is purely presentational). Without the provider, the `inject(BILLY_FILE_SOURCE)` fails at component creation.

The three viewers share the same pattern:

- a `file` input (the file to display);
- a `visible` signal driven by the imperative `show()` / `hide()` methods (the parent calls them via `viewChild`);
- an `effect()` in the constructor that (re)loads the content when `file()` changes;
- conditional rendering `@if (visible() && …)`: the component is always present in the parent's DOM, the panel is shown on demand;
- the shared toolbar at the top, with projection of viewer-specific action buttons.

## 2. The `BILLY_FILE_SOURCE` contract

Source: `projects/billy-layout/src/lib/viewers/file-viewer/billy-file-source.ts`.

### `BillyFileSource` interface

```ts
export interface BillyFileSource {
  /** Absolute download URL (PDF viewer: fetch done internally by ng2-pdf-viewer). */
  downloadUrl(fileId: number): string;
  /** Token carried as `Authorization: Bearer …` by the PDF viewer. */
  authToken(): string | null;
  /** Binary content (image viewer). */
  downloadBlob(fileId: number): Observable<Blob>;
  /** Text content (XML viewer). */
  downloadText(fileId: number): Observable<string>;
}

export const BILLY_FILE_SOURCE = new InjectionToken<BillyFileSource>('BILLY_FILE_SOURCE');
```

Who uses what — and why two access styles coexist:

| Method | Consumer | Reason |
|---|---|---|
| `downloadUrl(fileId)` + `authToken()` | `FileViewerPdfComponent` | `ng2-pdf-viewer` (pdf.js) **downloads the document itself**: it therefore needs an **absolute URL** and the token passed explicitly in the `Authorization: Bearer …` header — the app's Angular HTTP interceptor never sees this request. |
| `downloadBlob(fileId)` | `FileViewerImageComponent` | Classic `HttpClient` request: the app implementation can use a relative URL, the interceptor sets the base URL and Authorization. |
| `downloadText(fileId)` | `FileViewerXmlComponent` | Same, with `responseType: 'text'`. |

### `BillyViewerFile` interface

```ts
export interface BillyViewerFile {
  id?: number;
  fileName?: string;
}
```

Minimal **structural** interface: the application's `Fichier` model (`src/app/shared/components/uploadmanager/fichier.ts`) satisfies it as-is, without an adapter. `id` is used for downloading, `fileName` for display in the toolbar. Both fields are optional in the type, but a file without an `id` cannot be displayed (the PDF builds no URL, image/xml raise a logged error).

### Application implementation: `FichierSourceService`

The provider is declared in `src/app/app.config.ts`:

```ts
// The billy-layout file viewers get their content here.
{ provide: BILLY_FILE_SOURCE, useExisting: FichierSourceService },
```

And the full implementation, `src/app/shared/service/fichier-source.service.ts`:

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

Worth noting: this service is also used **outside the viewers** — the app reuses it directly for any access to a file's content, e.g. the account avatar (`src/app/auth/pages/compte/compte-document/compte-document.component.ts` and `src/app/shared/components/icon-top-compte/icon-top-compte.component.ts` call `downloadBlob()`).

---

## 3. `billy-file-viewer-toolbar` — FileViewerToolbarComponent

> Category `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-toolbar/file-viewer-toolbar.component.ts` · standalone component

### Role

Header bar shared by the three viewers: file-type icon (replaced by a `fa-sync fa-spin` spinner while loading), file name (ellipsized, full `title` on hover), projected actions zone (`<ng-content>`) and "Close" button. Visual language aligned with the file upload rows (`upload-manager-list-row`). Purely presentational: it is the only component of the family that does not need `BILLY_FILE_SOURCE`.

### API

```ts
import { FileViewerToolbarComponent } from 'billy-layout';
```

| Input | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | `''` | Font Awesome icon classes (e.g. `fa-solid fa-file-pdf`). |
| `filename` | `string \| undefined` | — (`input.required`) | Displayed name. `undefined` accepted: the viewers pass the optional `fileName` of `BillyViewerFile`. |
| `loading` | `boolean` | `false` | Replaces the icon with a spinner. |

| Output | Payload | Description |
|---|---|---|
| `closeViewer` | `void` | Emitted on "Close" button click (internal `hide()` method). |

Projected content: any element placed between the tags is rendered in the actions zone, before the close button. Convention: `.viewer-btn` buttons (28×28 px) — the class is styled by the toolbar for its own buttons, but **projected buttons must carry their styles in the host component** (Angular encapsulation); this is why `file-viewer-pdf` and `file-viewer-xml` duplicate the `.viewer-btn` rule in their own SCSS.

### Real-world usage example

Excerpt from `file-viewer-xml.component.html`:

```html
<billy-file-viewer-toolbar [loading]="loading()" [filename]="fileTpl.fileName"
                         icon="fa-solid fa-file-code" (closeViewer)="hide()">
  <button type="button" class="viewer-btn" (click)="copyToClipboard()">…</button>
</billy-file-viewer-toolbar>
```

### Styles & theming

- `position: sticky; top: 0; z-index: 10`: the toolbar stays visible while the viewer body scrolls (useful for XML with `max-height: 600px`).
- Hard-coded colors (no `--billy-*` tokens): `#f9fafb` background, `#e5e7eb` border, button hover `#2563eb`, close button hover `#dc2626`.
- Dark mode via `:host-context(.dark-mode)` (backgrounds `#1a2528` / `#212e31`, borders `#49545a`).

### Pitfalls & notes

- `filename` is `input.required`: forgetting it is a runtime error, even though its value may be `undefined`.
- Icons are Font Awesome classes: the FA font must be loaded by the host application (the lib does not bundle it).

---

## 4. `billy-file-viewer-pdf` — FileViewerPdfComponent

> Category `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-pdf/file-viewer-pdf.component.ts` · standalone component

### Role

PDF viewer based on `ng2-pdf-viewer` (pdf.js): page-by-page display (`[show-all]="false"`), previous/next navigation with an `n / total` indicator (hidden for single-page documents), zoom 0.1 → 2 in 0.1 steps. The component builds the download request itself from `BILLY_FILE_SOURCE`.

### API

```ts
import { FileViewerPdfComponent } from 'billy-layout';
```

| Input | Type | Default | Description |
|---|---|---|---|
| `file` | `BillyViewerFile \| null` | `null` | File to display. Any change re-runs `initPdf()` (page/zoom reset, source rebuild). |

No output. Public state and methods:

| Member | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panel shown or not (`@if (visible() && urlObject && file)`). |
| `loading` | `signal<boolean>` | True while downloading (wired to pdf.js `(on-progress)`). |
| `show()` | `void` | Shows the viewer. |
| `hide()` | `void` | Hides the viewer and resets `currentPage` to 0. |
| `pdfComponent` | `viewChild<PdfViewerComponent>` | Access to the underlying `ng2-pdf-viewer` component. |

The source passed to `<pdf-viewer [src]>` is a pdf.js object (`PDFSource`, i.e. pdf.js `DocumentInitParameters`):

```ts
this.urlObject = {
  url : this.fileSource.downloadUrl(file.id),      // absolute URL
  withCredentials: true,
  httpHeaders: { Authorization: 'Bearer ' + this.fileSource.authToken() },
};
```

This is the raison d'être of `downloadUrl()`/`authToken()` in the contract: the fetch is done **by pdf.js**, not by `HttpClient`, so no application interceptor applies.

### Real-world usage example

`src/app/shared/components/uploadmanager/upload-manager-list-with-viewer/upload-manager-list-with-viewer.component.html` — the three viewers share the same `fichierToView`, the parent makes them mutually exclusive:

```html
<billy-file-viewer-pdf   [file]="fichierToView" #viewerPdf></billy-file-viewer-pdf>
<billy-file-viewer-image [file]="fichierToView" #viewerImage></billy-file-viewer-image>
<billy-file-viewer-xml   [file]="fichierToView" #viewerXml></billy-file-viewer-xml>
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

Rounded bordered card (10 px), `#f9fafb` body with `overflow-x: auto`; compact `.viewer-btn` buttons grouped in `.viewer-group` (nav + zoom) projected into the toolbar; dark mode via `:host-context(.dark-mode)`.

### Pitfalls & notes

- **Local pdf.js worker (`.mjs`)**: the constructor forces `(window as any).pdfWorkerSrc = '/assets/js/pdf.worker.min.mjs'` to avoid the jsDelivr CDN. pdf.js v4 (shipped with `ng2-pdf-viewer` v10) publishes the worker as an **ES module** — `pdf.worker.min.mjs`, not `pdf.worker.min.js` — and instantiates it with `new Worker(src, { type: 'module' })`. The host application must copy that file into its assets — cf. `angular.json`:
  ```json
  { "glob": "pdf.worker.min.mjs", "input": "node_modules/pdfjs-dist/build/", "output": "/assets/js/" }
  ```
  Keeping the old `.js` glob (or the old path in a custom `pdfWorkerSrc`) yields a 404 at load time and the viewer silently stays empty. The web server must also serve `.mjs` with a JavaScript MIME type.
- **npm dependency**: `ng2-pdf-viewer` (`^10.0.0`, which pulls `pdfjs-dist` 4.x) is a **peer dependency** of the lib and a real dependency of the **application** (root `package.json`). Any consuming app must install it itself. Since pdfjs-dist 4.x is pure ESM, no `allowedCommonJsDependencies` entry is needed any more — the `ng2-pdf-viewer`, `pdfjs-dist/build/pdf` and `pdfjs-dist/web/pdf_viewer` entries required by v9 can be removed from `angular.json`.
- **Height recomputed on `pageRendered`**: `<pdf-viewer>` receives `style="height: {{pdfViewerHeight}}px"`, and that height is recomputed on every `(page-rendered)` event: the inner viewer's `clientHeight` + 30 px. The height therefore adapts to the current page (and zoom) *after* it renders — a debug `console.log('Page rendered: …')` is still present in this handler.
- Internal pagination is 0-based (`currentPage`), display is 1-based (`[page]="currentPage + 1"`).
- The pagination/zoom state (`currentPage`, `zoom`, `btn*Disabled`…) uses classic mutable fields, not signals: the rendering is refreshed by DOM events (zoneless app — see the "Billy zoneless" memory note if this component has to evolve).
- `hide()` resets the page to 0 but keeps the zoom.

---

## 5. `billy-file-viewer-image` — FileViewerImageComponent

> Category `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-image/file-viewer-image.component.ts` · standalone component

### Role

Image viewer: downloads the binary via `fileSource.downloadBlob(id)`, creates an object URL (`window.URL.createObjectURL`) marked as trusted (`DomSanitizer.bypassSecurityTrustUrl`) and displays it in a centered `<img>`. Spinner while loading.

### API

```ts
import { FileViewerImageComponent } from 'billy-layout';
```

| Input | Type | Default | Description |
|---|---|---|---|
| `file` | `BillyViewerFile \| null` | `null` | Image to display. Any change triggers `refreshImage()` (re-download). |

No output. Public state and methods:

| Member | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panel shown or not. |
| `loading` | `signal<boolean>` | True while the blob is downloading. |
| `imageUrlTrusted` | `signal<SafeUrl \| null>` | Trusted object URL consumed by the template. |
| `show()` / `hide()` | `void` | Show / hide the viewer. |

### Real-world usage example

Same host as the PDF: `upload-manager-list-with-viewer` (`askViewFileImage()` → `viewerPdf.hide()`, `viewerXml.hide()`, `viewerImage.show()`), triggered by the `(viewImage)` output of `app-upload-manager-list`.

### Styles & theming

Centered flex body, `img { max-width: 100%; border-radius: 6px; box-shadow: … }`; dark mode via `:host-context(.dark-mode)` (stronger shadow). Toolbar with the `fa-solid fa-image` icon, no projected buttons.

### Pitfalls & notes

- **Downloads even while hidden**: the `effect()` reacts to `file()` changes regardless of `visible` — assigning a file downloads the blob even if the viewer is never shown. `show()` does not re-download (unlike the XML viewer).
- **Object URLs never revoked**: no `URL.revokeObjectURL`; each file change leaves the previous blob in memory until the page unloads.
- Download error: simply logged to the console; the previous image (if any) stays displayed.

---

## 6. `billy-file-viewer-xml` — FileViewerXmlComponent

> Category `viewers` · source `projects/billy-layout/src/lib/viewers/file-viewer/file-viewer-xml/file-viewer-xml.component.ts` · standalone component

### Role

XML viewer (typically Peppol UBL files): downloads the text via `fileSource.downloadText(id)`, **re-indents** it (one tag per line, depth-based indentation — `formatXml`) then **highlights** it (tags, attributes, values, `<?xml …?>` prolog, comments — `highlightXml`, escaped HTML output passed through `bypassSecurityTrustHtml`). "Copy content" button in the toolbar that copies the **raw XML** (not reformatted) and shows a check for 1.5 s.

### API

```ts
import { FileViewerXmlComponent } from 'billy-layout';
```

| Input | Type | Default | Description |
|---|---|---|---|
| `file` | `BillyViewerFile \| null` | `null` | XML file to display. Any change triggers `refreshXml()`. |

No output. Public state and methods:

| Member | Type | Description |
|---|---|---|
| `visible` | `signal<boolean>` | Panel shown or not. |
| `loading` | `signal<boolean>` | True while downloading. |
| `xmlHtml` | `signal<SafeHtml \| null>` | Formatted/highlighted XML; `null` on failure → "Unable to display this file." message. |
| `copied` | `signal<boolean>` | Copy button feedback (falls back after 1.5 s). |
| `show()` | `void` | **Re-runs `refreshXml()`** then shows the viewer. |
| `hide()` | `void` | Hides the viewer. |
| `copyToClipboard()` | `Promise<void>` | Copies the raw XML via `navigator.clipboard`. |

### Real-world usage example

Same host as the others: `upload-manager-list-with-viewer` (`askViewFileXml()`), triggered by the `(viewXml)` output of the upload list.

### Styles & theming

- Body `max-height: 600px; overflow: auto` (the sticky toolbar stays visible while scrolling), `<pre class="xml-content">` in 12.5 px mono font.
- Highlighting via CSS classes `.xml-tag` (blue), `.xml-attr` (violet), `.xml-value` (green), `.xml-prolog` / `.xml-comment` (gray) — each with its dark variant via `:host-context(.dark-mode)`.

### Pitfalls & notes

- **Possible double fetch**: the `effect()` downloads on `file()` change (even hidden), and `show()` re-runs `refreshXml()` — displaying a freshly assigned file therefore downloads it twice.
- `highlightXml` escapes the entire content before highlighting: `bypassSecurityTrustHtml` only lets through the `<span>`s generated by the component, no HTML coming from the file.
- The reformatting is heuristic (regex, no XML parser): sufficient for machine-generated UBL, no guarantee on exotic XML (multi-line CDATA, etc.).
- `navigator.clipboard` requires a secure context (HTTPS/localhost); on failure, the error is only logged.
