import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * File displayable by the viewers (pdf/image/xml). Minimal structural
 * interface: the application's `Fichier` model satisfies it as-is.
 */
export interface BillyViewerFile {
  id?: number;
  fileName?: string;
}

/**
 * Content source for the file viewers.
 *
 * The viewers know nothing about the server or authentication: the
 * application provides this token (required to use
 * billy-file-viewer-pdf / -image / -xml; the toolbar alone does without it).
 *
 * On the billy-client side: FichierSourceService (relative HTTP `fichiers/:id/download`
 * for blob/text — the interceptor sets the base URL and Authorization — and an
 * absolute URL + Bearer for the PDF, since ng2-pdf-viewer downloads it itself).
 */
export interface BillyFileSource {
  /** Absolute download URL (PDF viewer: fetch is internal to ng2-pdf-viewer). */
  downloadUrl(fileId: number): string;
  /** Token sent as `Authorization: Bearer …` by the PDF viewer. */
  authToken(): string | null;
  /** Binary content (image viewer). */
  downloadBlob(fileId: number): Observable<Blob>;
  /** Text content (XML viewer). */
  downloadText(fileId: number): Observable<string>;
}

export const BILLY_FILE_SOURCE = new InjectionToken<BillyFileSource>('BILLY_FILE_SOURCE');
