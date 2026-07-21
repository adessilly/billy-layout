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

  readonly file = input<BillyViewerFile | null>(null);
  readonly visible = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly imageUrlTrusted = signal<SafeUrl | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      this.file();
      this.refreshImage();
    })
  }

  async refreshImage(): Promise<void> {
    const file = this.file();
    if (!file) {
      return;
    }
    try {
      this.loading.set(true);
      if(!file.id) { throw new Error('File id is null'); }
      const imageBlob = await lastValueFrom(this.fileSource.downloadBlob(file.id));
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
