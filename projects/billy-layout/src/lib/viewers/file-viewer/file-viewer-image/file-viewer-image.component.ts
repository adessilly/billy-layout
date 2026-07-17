import { Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BILLY_FILE_SOURCE, BillyViewerFile } from '../billy-file-source';
import { lastValueFrom } from 'rxjs';
import { FileViewerToolbarComponent } from '../file-viewer-toolbar/file-viewer-toolbar.component';

@Component({
    selector: 'billy-file-viewer-image',
    templateUrl: './file-viewer-image.component.html',
    styleUrls: ['./file-viewer-image.component.scss'],
    imports: [FileViewerToolbarComponent]
})
export class FileViewerImageComponent {

  private readonly fileSource = inject(BILLY_FILE_SOURCE);

  readonly fichier = input<BillyViewerFile | null>(null);
  readonly visible = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly imageUrlTrusted = signal<SafeUrl | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      this.fichier();
      this.refreshImage();
    })
  }

  async refreshImage(): Promise<void> {
    const fichier = this.fichier();
    if (!fichier) {
      return;
    }
    try {
      this.loading.set(true);
      if(!fichier.id) { throw new Error('Fichier id is null'); }
      const imageBlob = await lastValueFrom(this.fileSource.downloadBlob(fichier.id));
      const imageUrl = window.URL.createObjectURL(imageBlob);
      this.imageUrlTrusted.set(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
    } catch (ex) {
      console.error(ex);
    } finally {
      this.loading.set(false);
    }
  }

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }

}
