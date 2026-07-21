import { InjectionToken } from '@angular/core';

/**
 * Navigation bridge for routed dialogs.
 *
 * `billy-dialog-form` is used by dialogs carried by an "overlay" route: when
 * the user closes the dialog with a gesture (Escape, click on the backdrop),
 * the route must be left as well. The library does not know the application's
 * router: the application provides this (optional) token — without it, the
 * visual close still works but no navigation takes place.
 *
 * On the billy-client side: `{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService }`.
 */
export interface BillyDialogRouter {
  closeOverlay(): void;
}

export const BILLY_DIALOG_ROUTER = new InjectionToken<BillyDialogRouter>('BILLY_DIALOG_ROUTER');
