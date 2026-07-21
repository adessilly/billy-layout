import { Component, computed, inject, input, output } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly title = input.required<string>();
  readonly subtitle = input('');

  /** Shows the back button, placed before the title. */
  readonly backVisible = input(false);
  readonly backLabel = input<string>();
  readonly back = output<void>();

  protected readonly backLabelText = computed(() => this.backLabel() ?? this.i18n.strings().pageHeader.back);

}
