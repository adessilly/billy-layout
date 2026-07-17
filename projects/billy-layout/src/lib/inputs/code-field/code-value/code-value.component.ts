import { Component, DestroyRef, booleanAttribute, inject, input, signal } from '@angular/core';
import { CodeSegment } from '../../../core/utils/code-format';
import { CodeGlyphComponent, CodeGlyphKind } from '../code-glyph/code-glyph.component';

/**
 * Rendu en lecture d'un code déjà découpé : les segments `muted` (code pays,
 * points, espaces) passent en gris, les chiffres gardent la couleur du texte.
 *
 * Présentation pure — le découpage est l'affaire de TvaUtils / IbanUtils, et
 * les composants <billy-tva-display> et <billy-iban-display> les branchent ici.
 */
@Component({
  selector: 'billy-code-value',
  templateUrl: './code-value.component.html',
  styleUrls: ['./code-value.component.scss'],
  imports: [CodeGlyphComponent],
})
export class CodeValueComponent {

  readonly segments = input.required<CodeSegment[]>();
  readonly kind = input.required<CodeGlyphKind>();
  /** Valeur canonique : c'est elle qu'on copie, pas le rendu avec séparateurs. */
  readonly raw = input('');
  /** Texte affiché quand il n'y a rien à montrer. */
  readonly empty = input('Non renseigné');
  readonly glyph = input(true, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly copied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    // La ligne peut disparaître (navigation, changement de client) pendant que
    // la coche est encore affichée : le minuteur ne doit pas lui survivre.
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  askCopy(): void {
    const value = this.raw();
    if (!value) { return; }

    // La coche ne s'affiche qu'une fois la copie réellement faite : hors
    // contexte sécurisé, `navigator.clipboard` n'existe pas, et la permission
    // peut être refusée — annoncer « copié » serait alors un mensonge.
    navigator.clipboard?.writeText(value).then(() => {
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1800);
    }).catch(() => {});
  }

}
