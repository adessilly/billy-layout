import { Component, DestroyRef, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { CodeSegment } from '../../../core/utils/code-format';
import { CodeGlyphComponent, CodeGlyphKind } from '../code-glyph/code-glyph.component';

/**
 * Read-only rendering of an already-split code: the `muted` segments (country
 * code, dots, spaces) turn gray, the digits keep the text color.
 *
 * Pure presentation — the splitting is the business of VatUtils / IbanUtils,
 * and the <billy-vat-display> and <billy-iban-display> components wire them in
 * here.
 */
@Component({
  selector: 'billy-code-value',
  templateUrl: './code-value.component.html',
  styleUrls: ['./code-value.component.scss'],
  imports: [CodeGlyphComponent],
})
export class CodeValueComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly segments = input.required<CodeSegment[]>();
  readonly kind = input.required<CodeGlyphKind>();
  /** Canonical value: that's what gets copied, not the rendering with separators. */
  readonly raw = input('');
  /** Text shown when there is nothing to display. */
  readonly empty = input<string>();
  /** The input always wins; otherwise the dictionary of the active locale. */
  protected readonly emptyText = computed(() => this.empty() ?? this.i18n.strings().codeDisplay.empty);
  readonly glyph = input(true, { transform: booleanAttribute });
  readonly copyable = input(true, { transform: booleanAttribute });

  readonly copied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    // The row may disappear (navigation, client change) while the check mark
    // is still showing: the timer must not outlive it.
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  askCopy(): void {
    const value = this.raw();
    if (!value) { return; }

    // The check mark only shows once the copy has really happened: outside a
    // secure context, `navigator.clipboard` does not exist, and the permission
    // may be denied — announcing "copied" would then be a lie.
    navigator.clipboard?.writeText(value).then(() => {
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1800);
    }).catch(() => {});
  }

}
