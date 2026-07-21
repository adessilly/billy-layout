import { Component, computed, inject, input } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { CheckmarkColor } from '../checkmark/checkmark.component';

@Component({
  selector: 'billy-checkmark-failed',
  templateUrl: './checkmark-failed.component.html',
  styleUrls: ['./checkmark-failed.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkFailedComponent {

  protected readonly i18n = inject(BillyI18nService);

  /** Label announced to screen readers. */
  readonly label = input<string>();

  /** Design system color. */
  readonly color = input<CheckmarkColor>('danger');

  protected readonly labelText = computed(() => this.label() ?? this.i18n.strings().checkmark.failed);

}
