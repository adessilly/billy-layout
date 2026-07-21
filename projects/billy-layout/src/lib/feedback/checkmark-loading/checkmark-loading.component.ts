import { Component, computed, inject, input } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { CheckmarkColor } from '../checkmark/checkmark.component';

@Component({
  selector: 'billy-checkmark-loading',
  templateUrl: './checkmark-loading.component.html',
  styleUrls: ['./checkmark-loading.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkLoadingComponent {

  protected readonly i18n = inject(BillyI18nService);

  /** Label announced to screen readers. */
  readonly label = input<string>();

  /** Design system color. */
  readonly color = input<CheckmarkColor>('success');

  protected readonly labelText = computed(() => this.label() ?? this.i18n.strings().checkmark.loading);

}
