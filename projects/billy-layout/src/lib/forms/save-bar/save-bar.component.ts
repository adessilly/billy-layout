import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonComponent, BillyButtonColor } from '../../buttons/button/button.component';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-save-bar',
    templateUrl: './save-bar.component.html',
    styleUrls: ['./save-bar.component.scss'],
    imports: [ButtonComponent],
})
export class SaveBarComponent {

  protected readonly i18n = inject(BillyI18nService);

  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  labelSave = input<string>();
  iconSave = input<string>('fa-solid fa-floppy-disk');
  /** Tint of the save button (billy-button `color`). */
  colorSave = input<BillyButtonColor>('primary');
  labelSaveLoading = input<string>();
  labelCancel = input<string>();

  protected readonly labelSaveText = computed(() => this.labelSave() ?? this.i18n.strings().saveBar.save);
  protected readonly labelSaveLoadingText = computed(() => this.labelSaveLoading() ?? this.i18n.strings().saveBar.saving);
  protected readonly labelCancelText = computed(() => this.labelCancel() ?? this.i18n.strings().saveBar.back);
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
