import { Component, input } from '@angular/core';

export type CodeGlyphKind = 'vat' | 'iban' | 'email';

/**
 * Symbol of a "code" field: a tax administration's perforated stamp (VAT), the
 * bank card (IBAN) or the envelope (email). Hand-drawn rather than taken from
 * an icon font — at 26px, two crisp strokes beat a generic glyph, and they
 * tint themselves with the field's state.
 */
@Component({
  selector: 'billy-code-glyph',
  styleUrls: ['./code-glyph.component.scss'],
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      @if (kind() === 'vat') {
        <!-- Tax stamp: serrated plate + percent sign -->
        <rect class="cg-plate" x="2.75" y="3.75" width="18.5" height="16.5" rx="4.25"/>
        <path class="cg-perf" d="M7.25 4.5v15"/>
        <circle class="cg-line" cx="12.4" cy="9.6" r="1.75"/>
        <circle class="cg-line" cx="17.1" cy="15.1" r="1.75"/>
        <path class="cg-line" d="M17.9 8.7 11.6 16.1"/>
      } @else if (kind() === 'iban') {
        <!-- Bank card: stripe, chip, number -->
        <rect class="cg-plate" x="2.75" y="4.75" width="18.5" height="14.5" rx="3.75"/>
        <path class="cg-band" d="M2.75 9.4h18.5"/>
        <rect class="cg-line" x="6" y="12.4" width="4.6" height="3.4" rx="1.1"/>
        <path class="cg-line" d="M13.4 14.1h4.6"/>
      } @else {
        <!-- Envelope: flap diving down, side folds rising up -->
        <rect class="cg-plate" x="2.75" y="5.25" width="18.5" height="13.5" rx="3.75"/>
        <path class="cg-line" d="M4.4 7.7 12 13.1l7.6-5.4"/>
        <path class="cg-line" d="M4.5 16.6 9.7 12.3M19.5 16.6 14.3 12.3"/>
      }
    </svg>
  `,
})
export class CodeGlyphComponent {
  readonly kind = input.required<CodeGlyphKind>();
}
