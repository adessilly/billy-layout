import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { VatUtils } from '../../../core/utils/vat-utils';

/**
 * Entry of an intra-community VAT number.
 *
 * The model only ever receives the canonical form — "BE0123456749" — whatever
 * is typed or pasted: dots, spaces and dashes are ignored while typing, and a
 * dirty value coming from the backend is cleaned for display then handed back
 * clean to the form. The field itself shows "BE 0123.456.749".
 *
 * The Belgian number is verified (modulo 97). Other known countries are
 * checked by length; unknown ones are displayed without ever being declared
 * wrong.
 *
 * ```html
 * <billy-input-vat inputId="cf-vat" [formField]="formClient.vat"></billy-input-vat>
 * ```
 */
@Component({
  selector: 'billy-input-vat',
  templateUrl: './input-vat.component.html',
  styleUrls: ['./input-vat.component.scss'],
  imports: [CodeGlyphComponent, CodeStatusComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputVatComponent),
    multi: true,
  }],
})
export class InputVatComponent extends CodeFieldBase {

  protected readonly i18n = inject(BillyI18nService);

  /** Country assumed when only digits are typed (prefix added on output). */
  readonly defaultCountry = input('BE');

  readonly info = computed(() => VatUtils.describe(this.value(), this.i18n.locale()));

  protected sanitize(raw: string): string {
    return VatUtils.sanitize(raw);
  }

  protected formatText(value: string): string {
    return VatUtils.formatText(value);
  }

  protected normalize(value: string): string {
    return VatUtils.normalize(value, this.defaultCountry());
  }

}
