import { Component, OnInit, input, output } from '@angular/core';

@Component({
    selector: 'billy-file-viewer-toolbar',
    templateUrl: './file-viewer-toolbar.component.html',
    styleUrls: ['./file-viewer-toolbar.component.scss']
})
export class FileViewerToolbarComponent implements OnInit {

  readonly icon = input('');
  // `undefined` accepté : les viewers passent le fileName (optionnel) de BillyViewerFile.
  readonly filename = input.required<string | undefined>();
  readonly loading = input(false);
  readonly closeViewer = output<void>();

  constructor() { }

  ngOnInit(): void {
  }

  hide(): void {
    this.closeViewer.emit();
  }

}
