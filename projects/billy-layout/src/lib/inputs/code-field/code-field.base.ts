import {
  Directive, ElementRef, booleanAttribute, computed, effect, input, signal, viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CodeInfo, isAlnum } from '../../core/utils/code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Base of the "code" fields (VAT number, IBAN): a masked field.
//
// The model only sees the canonical value ("BE0123456749"), the DOM only shows
// the formatted value ("BE 0123.456.749"). Between the two, on every
// keystroke: we sanitize (disallowed characters never get in), reformat, and
// put the caret back where it was — counting it in significant characters, not
// in position, otherwise the separators would shift it.
//
// The DOM value is driven by hand rather than through a [value] binding:
// rewriting the input on every keystroke would send the caret to the end.
//
// ControlValueAccessor → compatible with [ngModel], formControlName and the
// signal-forms [formField] directive.
// ═══════════════════════════════════════════════════════════════════════════

@Directive()
export abstract class CodeFieldBase implements ControlValueAccessor {

  /** id set on the inner `<input>`, so an external `<label for>` can target it. */
  readonly inputId = input('');
  readonly placeholder = input('');
  /** Text shown below the field as long as nothing is typed. */
  readonly hint = input('');
  /**
   * Static disabling, on top of the one carried by the form.
   *
   * Deliberately not named `disabled`: signal-forms reserves that name and
   * writes the field's state into the host's `disabled` input *after* the
   * template bindings — a static `disabled` would thus be overwritten by the
   * form.
   */
  readonly forceDisabled = input(false, { transform: booleanAttribute });

  /** Canonical value, the one sent to the backend. */
  readonly value = signal('');
  /** Displayed value, with its separators. */
  readonly display = signal('');

  readonly focused = signal(false);
  readonly touched = signal(false);

  private readonly disabledFromForm = signal(false);
  readonly isDisabled = computed(() => this.forceDisabled() || this.disabledFromForm());

  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('codeInput');

  /** Diagnosis of the code (status, country, message, progress) — provided by the concrete field. */
  abstract readonly info: () => CodeInfo;

  readonly status = computed(() => this.info().status);
  readonly progress = computed(() => this.info().progress);

  /**
   * The border only turns red once the field has been left: while typing, an
   * incomplete number is not an error. The status badge, however, follows the
   * input live.
   */
  readonly showError = computed(() => this.touched() && this.status() === 'invalid');

  readonly message = computed(() => {
    const info = this.info();
    return info.status === 'empty' ? this.hint() : info.message;
  });

  private static sequence = 0;
  protected readonly uid = `billy-code-${++CodeFieldBase.sequence}`;

  private onChangeCallback: (value: string) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  constructor() {
    // The field is only rewritten when the DOM diverges from the model (load,
    // reset). While typing, it is already up to date: we leave it alone, so
    // the caret does not move.
    effect(() => {
      const element = this.inputRef()?.nativeElement;
      const text = this.display();
      if (element && element.value !== text) {
        element.value = text;
      }
    });
  }

  /** Canonical form of an input: every disallowed character disappears. */
  protected abstract sanitize(raw: string): string;
  /** Flat rendering of a canonical value — the field's mask. */
  protected abstract formatText(value: string): string;
  /** Final touches when leaving the field (country prefix, leading zero…). */
  protected abstract normalize(value: string): string;

  /**
   * Character that carries information, as opposed to the glue the mask itself
   * lays down (dots, spaces). That boundary is what drives the caret: we track
   * it by the number of significant characters before it, never by its
   * position, which the separators shift.
   *
   * Default: alphanumeric — the case of codes (VAT, IBAN). A field without a
   * mask (email) widens the definition, and the "delete across a separator"
   * branches below then never trigger.
   */
  protected isSignificant(char: string): boolean {
    return isAlnum(char);
  }

  private countSignificant(text: string): number {
    let count = 0;
    for (const char of text) {
      if (this.isSignificant(char)) { count++; }
    }
    return count;
  }

  onInput(): void {
    const element = this.inputRef()?.nativeElement;
    if (!element) { return; }

    const caret = element.selectionStart ?? element.value.length;
    const typed = this.countSignificant(element.value.slice(0, caret));

    const value = this.sanitize(element.value);
    const text = this.formatText(value);

    element.value = text;
    element.setSelectionRange(...this.caretAfter(text, typed));

    this.display.set(text);
    this.setValue(value);
  }

  /**
   * Deletion against a separator. Without this, the key would delete a dot
   * that the mask would immediately put back: nothing would disappear, and the
   * caret would jump. So we delete the significant character the user was
   * aiming at, on the other side of the separator.
   *
   * Only applies to a lone caret: a selection deletes itself, and `onInput`
   * will reformat the rest.
   */
  onKeydown(event: KeyboardEvent): void {
    const element = this.inputRef()?.nativeElement;
    if (!element) { return; }

    const backspace = event.key === 'Backspace';
    const del = event.key === 'Delete';
    if (!backspace && !del) { return; }

    // Word / line deletion (Ctrl, Alt, Cmd): let the browser play,
    // `onInput` will reformat what remains.
    if (event.ctrlKey || event.altKey || event.metaKey) { return; }

    const caret = element.selectionStart ?? 0;
    if (caret !== element.selectionEnd) { return; }

    const text = element.value;

    if (backspace) {
      if (caret === 0 || this.isSignificant(text[caret - 1])) { return; }

      let target = caret - 1;
      while (target >= 0 && !this.isSignificant(text[target])) { target--; }
      if (target < 0) { return; }

      event.preventDefault();
      element.value = text.slice(0, target) + text.slice(caret);
      element.setSelectionRange(target, target);
    } else {
      if (caret >= text.length || this.isSignificant(text[caret])) { return; }

      let target = caret;
      while (target < text.length && !this.isSignificant(text[target])) { target++; }
      if (target >= text.length) { return; }

      event.preventDefault();
      element.value = text.slice(0, caret) + text.slice(target + 1);
      element.setSelectionRange(caret, caret);
    }

    this.onInput();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);

    // `normalize` may lengthen the value (country prefix): we run it through
    // `sanitize` again so the model never leaves the field's bounds.
    const value = this.sanitize(this.normalize(this.value()));
    this.display.set(this.formatText(value));
    this.setValue(value);

    this.onTouchedCallback();
  }

  /** Caret position right after the `count`-th significant character. */
  private caretAfter(text: string, count: number): [number, number] {
    let position = 0;
    let seen = 0;

    while (position < text.length && seen < count) {
      if (this.isSignificant(text[position])) { seen++; }
      position++;
    }

    return [position, position];
  }

  /**
   * Writes a value into the field as if it had been typed — the DOM follows
   * through the effect above. Used for corrections offered by the field itself
   * (e.g. the typo in an email domain).
   */
  protected setFieldValue(raw: string): void {
    const value = this.sanitize(raw);
    this.display.set(this.formatText(value));
    this.setValue(value);
  }

  private setValue(value: string): void {
    if (value === this.value()) { return; }
    this.value.set(value);
    this.onChangeCallback(value);
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  writeValue(value: unknown): void {
    const raw = value === null || value === undefined ? '' : String(value);
    const clean = this.sanitize(raw);

    this.value.set(clean);
    this.display.set(this.formatText(clean));

    // "Dirty" value coming from the backend: we hand it back cleaned to the
    // model, deferred — writing while the form is itself writing would loop.
    // On the next round, clean === raw: the cycle stops there.
    if (clean !== raw) {
      queueMicrotask(() => this.onChangeCallback(clean));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromForm.set(isDisabled);
  }

}
