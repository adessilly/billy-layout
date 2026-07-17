import { Component, booleanAttribute, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Interrupteur « maison » BILLy — bascule gauche/droite façon iOS.
 * Remplace l'ancien `ad-button-switch` (thème « switch ») de ad-library.
 *
 * - ControlValueAccessor → compatible [ngModel], [(ngModel)], formControlName
 *   et le directive signal-forms [formField].
 * - Aligné sur la charte des formulaires (tokens --billy-*), animé,
 *   accessible (role=switch, clavier espace/entrée).
 * - `labelOn`/`labelOff` : libellé optionnel affiché à droite reflétant l'état.
 */
@Component({
  selector: 'billy-button-switch',
  standalone: true,
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

  /** Libellé affiché quand l'état est actif (optionnel). */
  readonly labelOn = input('');
  /** Libellé affiché quand l'état est inactif (optionnel). */
  readonly labelOff = input('');
  /** Icône (classe font) affichée dans le curseur à l'état actif (optionnel). */
  readonly iconOn = input('');
  /** Icône (classe font) affichée dans le curseur à l'état inactif (optionnel). */
  readonly iconOff = input('');
  /** Désactivation statique (en plus de l'état porté par le formulaire). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Émis à chaque changement de valeur (en plus du CVA). */
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
