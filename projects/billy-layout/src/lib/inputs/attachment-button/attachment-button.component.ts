import { Component, output, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentButtonListComponent } from './attachment-button-list/attachment-button-list.component';
import { ClickOutsideDirective } from '../../core/click-outside/click-outside.directive';

@Component({
  selector: 'billy-attachment-button',
  standalone: true,
  imports: [CommonModule, AttachmentButtonListComponent, ClickOutsideDirective],
  templateUrl: './attachment-button.component.html',
  styleUrls: ['./attachment-button.component.scss']
})
export class AttachmentButtonComponent {
  readonly MAX_FILES = 3;

  readonly files = model<File[]>([]);
  readonly fileInput = signal<HTMLInputElement | null>(null);
  readonly showList = signal<boolean>(false);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files).filter(file =>
        file.type === 'application/pdf'
      );

      if (newFiles.length > 0) {
        const currentFiles = this.files();
        const availableSlots = this.MAX_FILES - currentFiles.length;
        const filesToAdd = newFiles.slice(0, availableSlots);

        if (filesToAdd.length > 0) {
          const updatedFiles = [...currentFiles, ...filesToAdd];
          this.files.set(updatedFiles);
        }
      }

      // Reset input pour permettre de sélectionner le même fichier à nouveau
      input.value = '';
    }
  }

  onButtonClick(): void {
    if (this.fileCount > 0) {
      this.showList.set(!this.showList());
    } else {
      this.triggerFileInput();
    }
  }

  triggerFileInput(): void {
    if (this.files().length >= this.MAX_FILES) {
      return;
    }
    this.showList.set(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.multiple = true;
    input.onchange = (e) => this.onFileSelect(e);
    input.click();
  }

  get fileCount(): number {
    return this.files().length;
  }

  getTooltip(): string {
    const count = this.fileCount;
    if (count >= this.MAX_FILES) {
      const fileNames = this.files().map(f => f.name).join('\n');
      return `Maximum de ${this.MAX_FILES} fichiers atteint\n\nFichiers joints :\n${fileNames}`;
    } else if (count > 0) {
      const fileNames = this.files().map(f => f.name).join('\n');
      return `Joindre des fichiers PDF (max ${this.MAX_FILES})\n\nFichiers joints :\n${fileNames}`;
    } else {
      return `Joindre des fichiers PDF (max ${this.MAX_FILES})`;
    }
  }

  deleteFile(index: number): void {
    const updatedFiles = this.files().filter((_, i) => i !== index);
    this.files.set(updatedFiles);

    if (updatedFiles.length === 0) {
      this.showList.set(false);
    }
  }

  closeList(): void {
    this.showList.set(false);
  }
}
