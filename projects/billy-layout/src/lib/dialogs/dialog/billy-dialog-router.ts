import { InjectionToken } from '@angular/core';

/**
 * Pont de navigation des dialogues routés.
 *
 * `billy-dialog-form` est utilisé par des dialogues portés par une route
 * « overlay » : quand l'utilisateur ferme le dialogue par un geste (Échap,
 * clic sur le fond), il faut aussi quitter la route. La librairie ne connaît
 * pas le routeur de l'application : celle-ci fournit ce token (optionnel) —
 * sans lui, la fermeture visuelle fonctionne mais aucune navigation n'a lieu.
 *
 * Côté billy-client : `{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService }`.
 */
export interface BillyDialogRouter {
  closeOverlay(): void;
}

export const BILLY_DIALOG_ROUTER = new InjectionToken<BillyDialogRouter>('BILLY_DIALOG_ROUTER');
