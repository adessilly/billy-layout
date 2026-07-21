import { Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { TvaUtils } from '../../../core/utils/tva-utils';

/**
 * Saisie d'un numéro de TVA intracommunautaire.
 *
 * Le modèle ne reçoit que la forme canonique — « BE0690614660 » — quoi qu'on
 * tape ou colle : les points, espaces et tirets sont ignorés à la frappe, et
 * une valeur déjà sale venue du backend est nettoyée à l'affichage puis
 * renvoyée propre au formulaire. Le champ, lui, montre « BE 0690.614.660 ».
 *
 * Le numéro belge est vérifié (modulo 97). Les autres pays connus sont vérifiés
 * en longueur ; les inconnus sont affichés sans jamais être déclarés faux.
 *
 * ```html
 * <billy-input-tva inputId="cf-tva" [formField]="formClient.tva"></billy-input-tva>
 * ```
 */
@Component({
  selector: 'billy-input-tva',
  templateUrl: './input-tva.component.html',
  styleUrls: ['./input-tva.component.scss'],
  imports: [CodeGlyphComponent, CodeStatusComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputTvaComponent),
    multi: true,
  }],
})
export class InputTvaComponent extends CodeFieldBase {

  /** Pays présumé quand seuls des chiffres sont saisis (préfixe ajouté à la sortie). */
  readonly defaultCountry = input('BE');

  readonly info = computed(() => TvaUtils.describe(this.value()));

  protected sanitize(raw: string): string {
    return TvaUtils.sanitize(raw);
  }

  protected formatText(value: string): string {
    return TvaUtils.formatText(value);
  }

  protected normalize(value: string): string {
    return TvaUtils.normalize(value, this.defaultCountry());
  }

}
