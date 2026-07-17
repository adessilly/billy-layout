import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'billy-attachment-button-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-button-list.component.html',
  styleUrls: ['./attachment-button-list.component.scss']
})
export class AttachmentButtonListComponent {
  files = input.required<File[]>();
  maxFiles = input<number>(3);

  deleteFile = output<number>();
  addFiles = output<void>();
  close = output<void>();

  onDeleteFile(index: number): void {
    this.deleteFile.emit(index);
  }

  onAddFiles(): void {
    this.addFiles.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  get canAddMore(): boolean {
    return this.files().length < this.maxFiles();
  }
}
