import { Component, computed, inject, input } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

/** Design system colors usable by the checkmark and its spinner. */
export type CheckmarkColor = 'success' | 'accent' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'billy-checkmark',
  templateUrl: './checkmark.component.html',
  styleUrls: ['./checkmark.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkComponent {

  protected readonly i18n = inject(BillyI18nService);

  /** Label announced to screen readers. */
  readonly label = input<string>();

  /** Design system color. */
  readonly color = input<CheckmarkColor>('success');

  protected readonly labelText = computed(() => this.label() ?? this.i18n.strings().checkmark.success);

}
