import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonComponent, BillyButtonColor } from '../../buttons/button/button.component';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

/**
 * Bar skins.
 * `floating` = the default sticky card that hovers above the scrolling page.
 * `embedded` = compact transparent row, for a bar placed inside a surface that
 * already provides its own card chrome (panel, consult-card…) — avoids the
 * white-on-white "card on a card" effect.
 */
export type BillySaveBarVariant = 'floating' | 'embedded';

@Component({
    selector: 'billy-save-bar',
    templateUrl: './save-bar.component.html',
    styleUrls: ['./save-bar.component.scss'],
    imports: [ButtonComponent],
    host: {
      '[class.embedded]': "variant() === 'embedded'",
    },
})
export class SaveBarComponent {

  protected readonly i18n = inject(BillyI18nService);

  /**
   * Skin of the bar. `embedded` drops the surface, border, shadow and sticky
   * positioning, and tightens the spacing: the bar becomes a compact row of
   * actions inside an already-white container.
   */
  variant = input<BillySaveBarVariant>('floating');

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
