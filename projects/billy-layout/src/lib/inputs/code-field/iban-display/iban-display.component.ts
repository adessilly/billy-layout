import { Component, booleanAttribute, computed, input } from '@angular/core';
import { IbanUtils } from '../../../core/utils/iban-utils';
import { CodeValueComponent } from '../code-value/code-value.component';

/**
 * Read-only display of an IBAN: "BE68539007547034" becomes
 * "BE 68 5390 0754 7034", country code and spaces in gray.
 *
 * ```html
 * <billy-iban-display [value]="client.account"></billy-iban-display>
 * ```
 */
@Component({
  selector: 'billy-iban-display',
  imports: [CodeValueComponent],
  template: `
    <billy-code-value kind="iban"
      [segments]="segments()"
      [raw]="raw()"
      [empty]="empty()"
      [glyph]="glyph()"
      [copyable]="copyable()">
    </billy-code-value>
  `,
  styles: `:host { display: inline-flex; max-width: 100%; }`,
})
export class IbanDisplayComponent {

  readonly value = input<string | null | undefined>('');
  /** Falls back to the i18n dictionary (codeDisplay.empty) inside <billy-code-value>. */
  readonly empty = input<string>();
  readonly glyph = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly raw = computed(() => IbanUtils.sanitize(this.value()));
  readonly segments = computed(() => IbanUtils.format(this.value()));

}
