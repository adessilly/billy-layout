import { Component, computed, inject, input } from '@angular/core';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { CodeStatus } from '../../../core/utils/code-format';

/**
 * Status badge of a "code" field:
 * - typing in progress → progress ring that fills as you type
 * - verified           → check mark drawing itself
 * - not verifiable     → info (structure conforms, no known check digit)
 * - invalid            → alert
 */
@Component({
  selector: 'billy-code-status',
  templateUrl: './code-status.component.html',
  styleUrls: ['./code-status.component.scss'],
  host: {
    '[class]': '"cs--" + status()',
    '[attr.role]': '"img"',
    '[attr.aria-label]': 'label()',
  },
})
export class CodeStatusComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly status = input.required<CodeStatus>();
  /** Typing progress (0 → 1): fills the ring. */
  readonly progress = input(0);

  /** `pathLength="1"` on the circle: the ring is driven directly in 0 → 1. */
  readonly dashoffset = computed(() => 1 - Math.min(1, Math.max(0, this.progress())));

  readonly label = computed(() => {
    const strings = this.i18n.strings().codeField;
    switch (this.status()) {
      case 'valid':      return strings.verified;
      case 'invalid':    return strings.invalid;
      case 'unverified': return strings.validFormat;
      case 'partial':    return strings.typing;
      default:           return '';
    }
  });

}
