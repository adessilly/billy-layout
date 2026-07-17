import { Component, booleanAttribute, computed, input } from '@angular/core';
import { IbanUtils } from '../../../core/utils/iban-utils';
import { CodeValueComponent } from '../code-value/code-value.component';

/**
 * Affichage d'un IBAN en lecture : « BE68539007547034 » devient
 * « BE 68 5390 0754 7034 », code pays et espaces en gris.
 *
 * ```html
 * <billy-iban-display [value]="client.compte"></billy-iban-display>
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
  readonly empty = input('Non renseigné');
  readonly glyph = input(false, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly raw = computed(() => IbanUtils.sanitize(this.value()));
  readonly segments = computed(() => IbanUtils.format(this.value()));

}
