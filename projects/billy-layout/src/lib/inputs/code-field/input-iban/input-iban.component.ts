import { Component, computed, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { IbanUtils } from '../../../core/utils/iban-utils';

/**
 * Entry of a bank account in IBAN format.
 *
 * Same contract as <billy-input-vat>: the model only ever receives the
 * canonical form — "BE68539007547034" — whatever spaces, dots or dashes are
 * typed, pasted or returned by the backend; the field displays
 * "BE 68 5390 0754 7034".
 *
 * The check digits (ISO 7064, modulo 97) are verified as soon as the IBAN is
 * complete — a typo shows up right away, whatever the country.
 *
 * ```html
 * <billy-input-iban inputId="cf-account" [formField]="formClient.account"></billy-input-iban>
 * ```
 */
@Component({
  selector: 'billy-input-iban',
  templateUrl: './input-iban.component.html',
  styleUrls: ['./input-iban.component.scss'],
  imports: [CodeGlyphComponent, CodeStatusComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputIbanComponent),
    multi: true,
  }],
})
export class InputIbanComponent extends CodeFieldBase {

  protected readonly i18n = inject(BillyI18nService);

  readonly info = computed(() => IbanUtils.describe(this.value(), this.i18n.locale()));

  protected sanitize(raw: string): string {
    return IbanUtils.sanitize(raw);
  }

  protected formatText(value: string): string {
    return IbanUtils.formatText(value);
  }

  protected normalize(value: string): string {
    return IbanUtils.normalize(value);
  }

}
