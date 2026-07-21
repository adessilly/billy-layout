import { Component, booleanAttribute, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * In-house BILLy switch — iOS-style left/right toggle.
 * Replaces the legacy `ad-button-switch` ("switch" theme) from ad-library.
 *
 * - ControlValueAccessor → compatible with [ngModel], [(ngModel)], formControlName
 *   and the signal-forms [formField] directive.
 * - Aligned with the form guidelines (--billy-* tokens), animated,
 *   accessible (role=switch, space/enter keys).
 * - `labelOn`/`labelOff`: optional label shown on the right reflecting the state.
 */
@Component({
  selector: 'billy-button-switch',
  imports: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ButtonSwitchComponent),
    multi: true,
  }],
  templateUrl: './button-switch.component.html',
  styleUrls: ['./button-switch.component.scss'],
})
export class ButtonSwitchComponent implements ControlValueAccessor {

  /** Label shown when the state is active (optional). */
  readonly labelOn = input('');
  /** Label shown when the state is inactive (optional). */
  readonly labelOff = input('');
  /** Icon (font class) shown inside the knob in the active state (optional). */
  readonly iconOn = input('');
  /** Icon (font class) shown inside the knob in the inactive state (optional). */
  readonly iconOff = input('');
  /** Static disabling (in addition to the state carried by the form). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted on each value change (in addition to the CVA). */
  readonly valueChange = output<boolean>();

  private readonly innerValue = signal(false);
  private readonly disabledFromForm = signal(false);

  readonly checked = computed(() => this.innerValue());
  readonly isDisabled = computed(() => this.disabled() || this.disabledFromForm());

  readonly currentLabel = computed(() =>
    this.innerValue() ? this.labelOn() : this.labelOff());
  readonly currentIcon = computed(() =>
    this.innerValue() ? this.iconOn() : this.iconOff());

  private onChangeCallback: (v: boolean) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  toggle(): void {
    if (this.isDisabled()) { return; }
    const next = !this.innerValue();
    this.innerValue.set(next);
    this.onChangeCallback(next);
    this.onTouchedCallback();
    this.valueChange.emit(next);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────
  writeValue(v: unknown): void {
    this.innerValue.set(!!v);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledFromForm.set(isDisabled);
  }
}
