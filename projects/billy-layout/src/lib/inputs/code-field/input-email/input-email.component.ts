import { Component, computed, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeFieldBase } from '../code-field.base';
import { CodeGlyphComponent } from '../code-glyph/code-glyph.component';
import { CodeStatusComponent } from '../code-status/code-status.component';
import { EmailUtils } from '../../../core/utils/email-utils';

/**
 * Saisie d'une adresse email — même coque, même pastille et mêmes états que
 * <billy-input-tva> et <billy-input-iban>, sans masque : une adresse ne se découpe
 * pas en groupes.
 *
 * Le modèle ne reçoit que la forme canonique : espaces (fréquents au copier-
 * coller depuis un mail ou un PDF) et caractères interdits sont retirés à la
 * frappe comme au chargement. La casse, elle, est laissée intacte.
 *
 * L'état bleu « à vérifier » sert ici à la faute de frappe : « gmial.com » est
 * une adresse structurellement valide, qu'aucun validateur ne refusera — le
 * champ propose la correction, et un clic l'applique.
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

  readonly info = computed(() => EmailUtils.describe(this.value()));

  /** Domaine saisi — affiché en pastille, comme le pays d'un n° de TVA. */
  readonly domain = computed(() => EmailUtils.domain(this.value()));

  /** Adresse corrigée proposée, ou null s'il n'y a rien à redire. */
  readonly suggestion = computed(() => EmailUtils.suggest(this.value()));

  /** Applique la correction proposée : le champ est le propriétaire de la valeur. */
  applySuggestion(): void {
    const suggestion = this.suggestion();
    if (!suggestion) { return; }

    this.setFieldValue(suggestion);
  }

  // Une adresse n'a pas de liant : tout ce que `sanitize` garde est significatif.
  // Le curseur se compte donc sur l'ensemble des caractères, et les branches
  // « effacer par-dessus un séparateur » du socle ne se déclenchent jamais.
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
