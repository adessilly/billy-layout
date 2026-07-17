import { Component, booleanAttribute, computed, input } from '@angular/core';
import { TvaUtils } from '../../../core/utils/tva-utils';
import { CodeValueComponent } from '../code-value/code-value.component';

/**
 * Affichage d'un numéro de TVA en lecture : « BE0690614660 » devient
 * « BE 0690.614.660 », préfixe pays et points en gris.
 *
 * Robuste par construction : une valeur sale est d'abord nettoyée, un pays sans
 * règle de découpage est affiché tel quel derrière son préfixe.
 *
 * ```html
 * <billy-tva-display [value]="client.tva"></billy-tva-display>
 * ```
 */
@Component({
  selector: 'billy-tva-display',
  imports: [CodeValueComponent],
  template: `
    <billy-code-value kind="tva"
      [segments]="segments()"
      [raw]="raw()"
      [empty]="empty()"
      [glyph]="glyph()"
      [copyable]="copyable()">
    </billy-code-value>
  `,
  styles: `:host { display: inline-flex; max-width: 100%; }`,
})
export class TvaDisplayComponent {

  readonly value = input<string | null | undefined>('');
  readonly empty = input('Non renseigné');
  readonly glyph = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly raw = computed(() => TvaUtils.sanitize(this.value()));
  readonly segments = computed(() => TvaUtils.format(this.value()));

}
