import { Component, ElementRef, computed, inject, input, output, viewChild } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-upload-button',
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly label = input<string>();
  readonly subtitle = input<string>();

  protected readonly labelText = computed(() => this.label() ?? this.i18n.strings().uploadButton.label);
  protected readonly subtitleText = computed(() => this.subtitle() ?? this.i18n.strings().uploadButton.subtitle);
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
