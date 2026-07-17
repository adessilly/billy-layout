import { Component, input, output } from '@angular/core';

@Component({
    selector: 'billy-save-bar',
    templateUrl: './save-bar.component.html',
    styleUrls: ['./save-bar.component.scss'],
    standalone: true
})
export class SaveBarComponent {

  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  labelSave = input<string>('Sauvegarder');
  iconSave = input<string>('fa-solid fa-floppy-disk');
  classSave = input<string>('sb-btn--info');
  labelSaveLoading = input<string>('Sauvegarde...');
  labelCancel = input<string>('Retour');
  iconCancel = input<string>('fa-solid fa-chevron-left');
  cancelVisible = input<boolean>(true);
  saveVisible = input<boolean>(true);

  save = output<void>();
  cancel = output<void>();

  askSave(): void {
    this.save.emit();
  }

  askCancel(): void {
    this.cancel.emit();
  }

}
