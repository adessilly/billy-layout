import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextUniqueId = 0;

export interface PasswordCriterion {
  key: string;
  label: string;
  met: boolean;
}

/**
 * Champ mot de passe du design system : icône cadenas, œil afficher/masquer,
 * et — en option — jauge de robustesse animée avec liste de critères
 * (`checkStrength`) ou indicateur de correspondance live (`compareTo`,
 * pour un champ de confirmation).
 *
 * ControlValueAccessor : s'utilise avec formControlName. La jauge est purement
 * indicative, la validité reste portée par les validators du formulaire.
 */
@Component({
  selector: 'billy-input-password',
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputPasswordComponent),
    multi: true
  }]
})
export class InputPasswordComponent implements ControlValueAccessor {

  label = input('');
  mandatory = input(false);
  placeholder = input('••••••••');
  autocomplete = input('new-password');
  /** Affiche la jauge de robustesse et la liste des critères sous le champ. */
  checkStrength = input(false);
  /** Valeur à égaler (champ de confirmation) : affiche l'indicateur de correspondance. */
  compareTo = input<string | null>(null);
  /** État invalide piloté par le parent (ex. contrôle touché et en erreur). */
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
    return [
      { key: 'length',  label: '8 caractères minimum',   met: v.length >= 8 },
      { key: 'lower',   label: 'Une lettre minuscule',   met: /[a-z]/.test(v) },
      { key: 'upper',   label: 'Une lettre majuscule',   met: /[A-Z]/.test(v) },
      { key: 'digit',   label: 'Un chiffre',             met: /\d/.test(v) },
      { key: 'special', label: 'Un caractère spécial',   met: /[^A-Za-z0-9\s]/.test(v) }
    ];
  });

  readonly strength = computed(() => {
    if (!this.value().length) {
      return { level: 0, label: '', tone: 'none' };
    }
    const met = this.criteria().filter(c => c.met).length;
    if (met <= 2) { return { level: 1, label: 'Faible',    tone: 'weak' }; }
    if (met === 3) { return { level: 2, label: 'Moyen',     tone: 'fair' }; }
    if (met === 4) { return { level: 3, label: 'Bon',       tone: 'good' }; }
    return { level: 4, label: 'Excellent', tone: 'strong' };
  });

  readonly matches = computed(() =>
    this.compareTo() !== null && this.value().length > 0 && this.value() === this.compareTo());

  // Le panneau de robustesse se déplie au focus (les attentes sont visibles
  // avant de taper) et reste ouvert tant que le champ n'est pas vide.
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
