import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Fichier affichable par les viewers (pdf/image/xml). Interface structurelle
 * minimale : le modèle `Fichier` de l'application la satisfait tel quel.
 */
export interface BillyViewerFile {
  id?: number;
  fileName?: string;
}

/**
 * Source de contenu des viewers de fichiers.
 *
 * Les viewers ne connaissent ni le serveur, ni l'authentification : c'est
 * l'application qui fournit ce token (obligatoire pour utiliser
 * billy-file-viewer-pdf / -image / -xml ; la toolbar seule s'en passe).
 *
 * Côté billy-client : FichierSourceService (HTTP relatif `fichiers/:id/download`
 * pour blob/texte — l'intercepteur pose base URL et Authorization — et URL
 * absolue + Bearer pour le PDF, car ng2-pdf-viewer télécharge lui-même).
 */
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
