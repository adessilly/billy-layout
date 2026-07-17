import { Component, computed, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { IbanUtils } from '../../../core/utils/iban-utils';

/**
 * Saisie d'un compte bancaire au format IBAN.
 *
 * Même contrat que <billy-input-tva> : le modèle ne reçoit que la forme canonique
 * — « BE68539007547034 » — quels que soient les espaces, points ou tirets tapés,
 * collés ou renvoyés par le backend ; le champ affiche « BE 68 5390 0754 7034 ».
 *
 * La clé de contrôle (ISO 7064, modulo 97) est vérifiée dès que l'IBAN est
 * complet — une faute de frappe se voit tout de suite, quel que soit le pays.
 *
 * ```html
 * <billy-input-iban inputId="cf-compte" [formField]="formClient.compte"></billy-input-iban>
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

  readonly info = computed(() => IbanUtils.describe(this.value()));

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
