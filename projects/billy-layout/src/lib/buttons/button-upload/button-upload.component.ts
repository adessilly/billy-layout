import { Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
    selector: 'billy-button-upload',
    templateUrl: './button-upload.component.html',
    styleUrls: ['./button-upload.component.scss']
})
export class ButtonUploadComponent {

  readonly label = input('Importer');
  readonly subtitle = input('Depuis un fichier');
  readonly accept = input('.pdf,.jpg,.jpeg,.png,.gif');
  readonly loading = input(false);

  readonly fileSelected = output<File>();

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  trigger(): void {
    this.fileInput().nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    const fileInput = this.fileInput();
    if (fileInput?.nativeElement) {
      fileInput.nativeElement.value = '';
    }
  }

}
