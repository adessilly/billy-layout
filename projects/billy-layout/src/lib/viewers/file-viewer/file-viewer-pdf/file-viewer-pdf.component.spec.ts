import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

// ng2-pdf-viewer imports pdfjs-dist and mutates its (frozen, in a test runner)
// module namespace at load time — it cannot be loaded here. Only the worker
// wiring is under test, so a stub module is enough.
vi.mock('ng2-pdf-viewer', async () => {
  const { Component, NgModule } = await import('@angular/core');

  @Component({ selector: 'pdf-viewer', template: '' })
  class PdfViewerComponent {}

  @NgModule({ imports: [PdfViewerComponent], exports: [PdfViewerComponent] })
  class PdfViewerModule {}

  return { PdfViewerComponent, PdfViewerModule };
});

const { FileViewerPdfComponent } = await import('./file-viewer-pdf.component');
const { BILLY_FILE_SOURCE } = await import('../billy-file-source');
const { BILLY_DEFAULT_PDF_WORKER_SRC, provideBillyPdfWorker } = await import('../billy-pdf-worker');

describe('FileViewerPdfComponent — pdf.js worker source', () => {

  const fileSource = {
    downloadUrl: (id: number) => `https://api.test/files/${id}/download`,
    authToken: () => 'token',
    downloadBlob: () => of(new Blob()),
    downloadText: () => of(''),
  };

  const globalWorkerSrc = (): unknown => (window as unknown as { pdfWorkerSrc?: unknown }).pdfWorkerSrc;

  const createWith = (...providers: unknown[]) => {
    TestBed.configureTestingModule({
      providers: [{ provide: BILLY_FILE_SOURCE, useValue: fileSource }, ...providers as never[]],
    });
    return TestBed.createComponent(FileViewerPdfComponent);
  };

  beforeEach(() => {
    delete (window as unknown as { pdfWorkerSrc?: unknown }).pdfWorkerSrc;
  });

  it('points pdf.js at the local .mjs worker by default', () => {
    createWith();

    expect(BILLY_DEFAULT_PDF_WORKER_SRC).toBe('/assets/js/pdf.worker.min.mjs');
    expect(globalWorkerSrc()).toBe(BILLY_DEFAULT_PDF_WORKER_SRC);
  });

  it('provideBillyPdfWorker overrides the worker path', () => {
    createWith(provideBillyPdfWorker('/static/pdf/pdf.worker.min.mjs'));

    expect(globalWorkerSrc()).toBe('/static/pdf/pdf.worker.min.mjs');
  });

  it('provideBillyPdfWorker(null) leaves the global untouched (ng2-pdf-viewer CDN default)', () => {
    createWith(provideBillyPdfWorker(null));

    expect(globalWorkerSrc()).toBeUndefined();
  });

});
