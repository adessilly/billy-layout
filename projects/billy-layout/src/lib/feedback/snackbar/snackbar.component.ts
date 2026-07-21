import { Component, computed, inject, input, model, output } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { BillyIconComponent } from '../../core/icon/billy-icon.component';

@Component({
    selector: 'billy-snackbar',
    imports: [BillyIconComponent],
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  protected readonly i18n = inject(BillyI18nService);

  message = input<string>();
  buttonTitle = input<string>();
  buttonLabel = input<string>();
  closeTitle = input<string>();

  protected readonly messageText = computed(() => this.message() ?? this.i18n.strings().snackbar.message);
  protected readonly buttonTitleText = computed(() => this.buttonTitle() ?? this.i18n.strings().snackbar.buttonTitle);
  protected readonly buttonLabelText = computed(() => this.buttonLabel() ?? this.i18n.strings().snackbar.buttonLabel);
  protected readonly closeTitleText = computed(() => this.closeTitle() ?? this.i18n.strings().snackbar.closeTitle);

  visible = model(false);
  buttonClick = output();

  askClose(): void {
    this.visible.set(false);
  }

  askButtonClick(): void {
    this.buttonClick.emit();
  }

}
