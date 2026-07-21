import { Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { BillyIconComponent } from '../../core/icon/billy-icon.component';

let nextUniqueId = 0;

export interface PasswordCriterion {
  key: string;
  label: string;
  met: boolean;
}

/**
 * Design-system password field: padlock icon, show/hide eye toggle,
 * and — optionally — an animated strength meter with a criteria list
 * (`checkStrength`) or a live match indicator (`compareTo`,
 * for a confirmation field).
 *
 * ControlValueAccessor: used with formControlName. The meter is purely
 * indicative; validity remains the responsibility of the form validators.
 */
@Component({
  selector: 'billy-input-password',
  imports: [BillyIconComponent],
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputPasswordComponent),
    multi: true
  }]
})
export class InputPasswordComponent implements ControlValueAccessor {

  protected readonly i18n = inject(BillyI18nService);

  label = input('');
  mandatory = input(false);
  placeholder = input('••••••••');
  autocomplete = input('new-password');
  /** Shows the strength meter and the criteria list below the field. */
  checkStrength = input(false);
  /** Value to match (confirmation field): shows the match indicator. */
  compareTo = input<string | null>(null);
  /** Invalid state driven by the parent (e.g. control touched and in error). */
  invalid = input(false);

  readonly inputId = `billy-password-${nextUniqueId++}`;

  readonly value = signal('');
  readonly show = signal(false);
  readonly focused = signal(false);
  readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly criteria = computed<PasswordCriterion[]>(() => {
    const v = this.value();
    const strings = this.i18n.strings().password;
    return [
      { key: 'length',  label: strings.minLength, met: v.length >= 8 },
      { key: 'lower',   label: strings.lowercase, met: /[a-z]/.test(v) },
      { key: 'upper',   label: strings.uppercase, met: /[A-Z]/.test(v) },
      { key: 'digit',   label: strings.digit,     met: /\d/.test(v) },
      { key: 'special', label: strings.special,   met: /[^A-Za-z0-9\s]/.test(v) }
    ];
  });

  readonly strength = computed(() => {
    if (!this.value().length) {
      return { level: 0, label: '', tone: 'none' };
    }
    const strings = this.i18n.strings().password;
    const met = this.criteria().filter(c => c.met).length;
    if (met <= 2) { return { level: 1, label: strings.weak,      tone: 'weak' }; }
    if (met === 3) { return { level: 2, label: strings.fair,      tone: 'fair' }; }
    if (met === 4) { return { level: 3, label: strings.good,      tone: 'good' }; }
    return { level: 4, label: strings.excellent, tone: 'strong' };
  });

  readonly matches = computed(() =>
    this.compareTo() !== null && this.value().length > 0 && this.value() === this.compareTo());

  // The strength panel unfolds on focus (expectations are visible before
  // typing) and stays open as long as the field is not empty.
  readonly panelOpen = computed(() =>
    this.checkStrength() && (this.focused() || this.value().length > 0));

  readonly segments = [1, 2, 3, 4];

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  toggleShow(): void {
    this.show.set(!this.show());
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

}
