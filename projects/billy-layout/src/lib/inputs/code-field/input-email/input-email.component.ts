import { Component, computed, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { EmailUtils } from '../../../core/utils/email-utils';

/**
 * Entry of an email address — same shell, same badge and same states as
 * <billy-input-vat> and <billy-input-iban>, without a mask: an address does
 * not split into groups.
 *
 * The model only ever receives the canonical form: spaces (frequent when
 * copy-pasting from an email or a PDF) and forbidden characters are removed
 * while typing as well as on load. The case, however, is left untouched.
 *
 * The blue "to verify" state serves the typo here: "gmial.com" is a
 * structurally valid address that no validator will reject — the field offers
 * the correction, and one click applies it.
 *
 * ```html
 * <billy-input-email inputId="cf-email" [formField]="formClient.email"></billy-input-email>
 * ```
 */
@Component({
  selector: 'billy-input-email',
  templateUrl: './input-email.component.html',
  styleUrls: ['./input-email.component.scss'],
  imports: [CodeGlyphComponent, CodeStatusComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputEmailComponent),
    multi: true,
  }],
})
export class InputEmailComponent extends CodeFieldBase {

  protected readonly i18n = inject(BillyI18nService);

  readonly info = computed(() => EmailUtils.describe(this.value(), this.i18n.locale()));

  /** Typed domain — shown as a badge, like the country of a VAT number. */
  readonly domain = computed(() => EmailUtils.domain(this.value()));

  /** Suggested corrected address, or null if there is nothing to flag. */
  readonly suggestion = computed(() => EmailUtils.suggest(this.value()));

  /** Applies the suggested correction: the field owns the value. */
  applySuggestion(): void {
    const suggestion = this.suggestion();
    if (!suggestion) { return; }

    this.setFieldValue(suggestion);
  }

  // An address has no glue: everything `sanitize` keeps is significant.
  // The caret is therefore counted over all characters, and the base's
  // "delete across a separator" branches never trigger.
  protected override isSignificant(char: string): boolean {
    return EmailUtils.isAllowed(char);
  }

  protected sanitize(raw: string): string {
    return EmailUtils.sanitize(raw);
  }

  protected formatText(value: string): string {
    return value;
  }

  protected normalize(value: string): string {
    return value;
  }

}
