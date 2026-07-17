import { Component, effect, inject, input, signal, viewChild } from '@angular/core';
import { PDFDocumentProxy, PDFProgressData, PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';
import { BILLY_FILE_SOURCE, BillyViewerFile } from '../billy-file-source';
import { FileViewerToolbarComponent } from '../file-viewer-toolbar/file-viewer-toolbar.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'billy-file-viewer-pdf',
    templateUrl: './file-viewer-pdf.component.html',
    styleUrls: ['./file-viewer-pdf.component.scss'],
    imports: [FileViewerToolbarComponent, NgTemplateOutlet, PdfViewerModule]
})
export class FileViewerPdfComponent {

  private readonly fileSource = inject(BILLY_FILE_SOURCE);

  readonly fichier = input<BillyViewerFile | null>(null);
  readonly pdfComponent = viewChild<PdfViewerComponent>(PdfViewerComponent);

  readonly visible = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  pdfViewerHeight = 100;
  currentPage = 0;
  totalPages = 0;
  zoom = 1;
  maxZoom = 2;
  urlObject: any;
  btnPrevDisabled = false;
  btnNextDisabled = false;
  btnZoomInDisabled = false;
  btnZoomOutDisabled = false;

  constructor() {
    // Chargement local du webworker (pour éviter le cdn cloudflare)
    const localAsset = '/assets/js/pdf.worker.min.js';
    if((window as any).pdfWorkerSrc !== localAsset) {
      (window as any).pdfWorkerSrc = localAsset;
    }
    effect(() => {
      if(this.fichier()) {
        this.initPdf();
      }
    });
   }

  initPdf(): void {
    const fichier = this.fichier();
    if(!fichier) {
      return;
    }
    this.currentPage = 0;
    this.totalPages = 0;
    this.zoom = 1;
    this.urlObject = null;
    if (fichier?.id) {
      this.urlObject = {
        url : this.fileSource.downloadUrl(fichier.id),
        withCredentials: true,
        httpHeaders: { Authorization: 'Bearer ' + this.fileSource.authToken() },
      };
    }
    this.refreshButtons();
    this.refreshButtonsZoom();
  }

  public pageRendered(e: CustomEvent) {
    console.log('Page rendered: ',  (this.pdfComponent()?.pdfViewer?.viewer?.clientHeight ?? 0) + 30);
    this.pdfViewerHeight = (this.pdfComponent()?.pdfViewer?.viewer?.clientHeight ?? 0) + 30;
  }

  refreshButtons(): void {
    this.btnPrevDisabled = this.currentPage <= 0;
    this.btnNextDisabled = this.currentPage >= this.totalPages - 1;
  }

  refreshButtonsZoom(): void {
    this.btnZoomInDisabled = this.zoom >= this.maxZoom;
    this.btnZoomOutDisabled = this.zoom <= 0.1;
  }

  prevPage(): void {
    this.currentPage--;
    if (this.currentPage < 0) {
      this.currentPage = 0;
    }
    this.refreshButtons();
  }

  nextPage(): void {
    this.currentPage++;
    if ( this.currentPage >= this.totalPages ) {
      this.currentPage = this.totalPages - 1;
    }
    this.refreshButtons();
  }

  zoomIn(): void {
    this.zoom += 0.1;
    if (this.zoom > this.maxZoom) {
      this.zoom = this.maxZoom;
    }
    this.refreshButtonsZoom();
  }

  zoomOut(): void {
    this.zoom -= 0.1;
    if (this.zoom < 0.1) {
      this.zoom = 0.1;
    }
    this.refreshButtonsZoom();
  }

  pdfLoaded(event: PDFDocumentProxy): void {
    this.totalPages = event.numPages;
    this.refreshButtons();
  }

  pdfLoading(progressData: PDFProgressData): void {
    this.loading.set(progressData.total ? progressData.loaded !== progressData.total : true);
  }

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
    this.currentPage = 0;
  }

}
