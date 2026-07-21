import { Component, inject, input, output } from '@angular/core';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-file-viewer-toolbar',
    templateUrl: './file-viewer-toolbar.component.html',
    styleUrls: ['./file-viewer-toolbar.component.scss']
})
export class FileViewerToolbarComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly icon = input('');
  // `undefined` accepted: the viewers pass the (optional) fileName of BillyViewerFile.
  readonly filename = input.required<string | undefined>();
  readonly loading = input(false);
  readonly closeViewer = output<void>();

  hide(): void {
    this.closeViewer.emit();
  }

}
