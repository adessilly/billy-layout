import { InjectionToken, Provider } from '@angular/core';

/**
 * Default location of the pdf.js worker: the file copied into the application's
 * assets by `angular.json`. pdf.js v4 ships it as an ES module (`.mjs`), loaded
 * with `new Worker(src, { type: 'module' })` — it must therefore be same-origin.
 */
export const BILLY_DEFAULT_PDF_WORKER_SRC = '/assets/js/pdf.worker.min.mjs';

/**
 * URL of the pdf.js worker used by `billy-file-viewer-pdf`.
 *
 * Defaults to {@link BILLY_DEFAULT_PDF_WORKER_SRC}. Override it when the
 * application serves the worker from another path (deployment under a
 * sub-directory, hashed assets, own CDN…):
 *
 * ```ts
 * providers: [provideBillyPdfWorker('/static/pdf/pdf.worker.min.mjs')]
 * ```
 *
 * Provide `null` to let the viewer touch nothing: `ng2-pdf-viewer` then keeps
 * its own default (the jsDelivr CDN), or whatever `window.pdfWorkerSrc` the
 * application already set itself.
 */
export const BILLY_PDF_WORKER_SRC = new InjectionToken<string | null>('BILLY_PDF_WORKER_SRC', {
  providedIn: 'root',
  factory: () => BILLY_DEFAULT_PDF_WORKER_SRC,
});

/** Sets the pdf.js worker URL used by `billy-file-viewer-pdf` (`null` = leave the CDN default). */
export function provideBillyPdfWorker(src: string | null): Provider {
  return { provide: BILLY_PDF_WORKER_SRC, useValue: src };
}
