import { Component, booleanAttribute, computed, input } from '@angular/core';
import { VatUtils } from '../../../core/utils/vat-utils';
import { CodeValueComponent } from '../code-value/code-value.component';

/**
 * Read-only display of a VAT number: "BE0123456749" becomes
 * "BE 0123.456.749", country prefix and dots in gray.
 *
 * Robust by construction: a dirty value is cleaned first, and a country with
 * no splitting rule is shown as-is behind its prefix.
 *
 * ```html
 * <billy-vat-display [value]="client.vat"></billy-vat-display>
 * ```
 */
@Component({
  selector: 'billy-vat-display',
  imports: [CodeValueComponent],
  template: `
    <billy-code-value kind="vat"
      [segments]="segments()"
      [raw]="raw()"
      [empty]="empty()"
      [glyph]="glyph()"
      [copyable]="copyable()">
    </billy-code-value>
  `,
  styles: `:host { display: inline-flex; max-width: 100%; }`,
})
export class VatDisplayComponent {

  readonly value = input<string | null | undefined>('');
  /** Falls back to the i18n dictionary (codeDisplay.empty) inside <billy-code-value>. */
  readonly empty = input<string>();
  readonly glyph = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly raw = computed(() => VatUtils.sanitize(this.value()));
  readonly segments = computed(() => VatUtils.format(this.value()));

}
