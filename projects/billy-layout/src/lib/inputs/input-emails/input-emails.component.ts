import { Component, forwardRef, input, ElementRef, viewChild, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputEmailsPopupSuggestionComponent } from './input-emails-popup-suggestion/input-emails-popup-suggestion.component';
import { InputEmailTagComponent } from './input-email-tag/input-email-tag.component';

@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputEmailsComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InputEmailsComponent),
            multi: true
        }
    ],
    selector: 'billy-input-emails',
    templateUrl: './input-emails.component.html',
    styleUrls: ['./input-emails.component.scss'],
    imports: [
        FormsModule,
        CommonModule,
        InputEmailsPopupSuggestionComponent,
        InputEmailTagComponent
    ]
})
export class InputEmailsComponent implements ControlValueAccessor, Validator {

  emails = signal<string[]>([]);
  inputValue = signal<string>('');
  showSuggestions = signal<boolean>(false);

  onChangeCallback: any;
  onTouchedCallback: any;

  inputElement = viewChild<ElementRef>('emailInput');
  placeholder = input<string>('Entrez des emails');
  disabled = false;

  // Regex pour valider les emails
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Liste de tous les emails disponibles pour l'autocomplétion, fournie par le
  // consommateur (découplé de ClientService lors de l'extraction en librairie).
  availableEmails = input<string[]>([]);

  // @Override ControlValueAccessor
  writeValue(value: string | null) {
    this.setValueFromParent(value);
  }

  // @Override ControlValueAccessor
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  // @Override ControlValueAccessor
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  // @Override ControlValueAccessor
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  setValueFromParent(value: string | null) {
    if (!value || value.trim() === '') {
      this.emails.set([]);
    } else {
      // Séparer par virgule ou point-virgule et nettoyer
      this.emails.set(value
        .split(/[,;]/)
        .map(email => email.trim())
        .filter(email => email.length > 0));
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    // Les touches directionnelles et Escape sont gérées par la popup elle-même
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Escape') {
      return;
    }

    // Créer un tag sur Espace, Virgule, Point-virgule ou Entrée
    if (event.key === ' ' || event.key === ',' || event.key === ';' || event.key === 'Enter') {
      // Si c'est Enter et que la popup est visible, elle gérera la sélection elle-même
      // On vérifie si l'événement a été preventDefault par la popup
      if (event.key === 'Enter' && this.showSuggestions()) {
        // Laisser la popup gérer d'abord, si elle ne le fait pas, on ajoute l'email
        setTimeout(() => {
          if (!event.defaultPrevented && value) {
            this.addEmail(value);
            input.value = '';
            this.inputValue.set('');
            this.showSuggestions.set(false);
          }
        }, 0);
        return;
      }

      event.preventDefault();
      if (value) {
        this.addEmail(value);
      }
      input.value = '';
      this.inputValue.set('');
      this.showSuggestions.set(false);
    }
    // Supprimer le dernier tag sur Backspace si l'input est vide
    else if (event.key === 'Backspace' && value === '' && this.emails().length > 0) {
      this.removeEmail(this.emails().length - 1);
    }
  }

  onInputChange(value: string) {
    this.inputValue.set(value);
    this.showSuggestions.set(value.trim().length >= 2);
  }

  onInputBlur() {
    // Petite temporisation pour permettre le clic sur une suggestion
    setTimeout(() => {
      // Ajouter l'email restant dans l'input au blur
      const value = this.inputValue().trim();
      if (value) {
        this.addEmail(value);
        this.inputValue.set('');
      }
      this.showSuggestions.set(false);
      this.onTouchedCallback?.();
    }, 200);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';

    // Extraire tous les emails du texte collé
    const newEmails = pastedText
      .split(/[,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    newEmails.forEach(email => this.addEmail(email));
    this.inputValue.set('');
  }

  selectSuggestion(email: string) {
    this.addEmail(email);
    this.inputValue.set('');
    this.showSuggestions.set(false);
    this.focusInput();
  }

  addEmail(email: string) {
    if (email && !this.emails().includes(email)) {
      this.emails.update(emails => [...emails, email]);
      this.emitValue();
    }
  }

  removeEmail(index: number) {
    this.emails.update(emails => emails.filter((_, i) => i !== index));
    this.emitValue();
  }

  emitValue() {
    const emails = this.emails();
    const value = emails.length > 0 ? emails.join(', ') : null;
    this.onChangeCallback?.(value);
  }

  focusInput() {
    this.inputElement()?.nativeElement.focus();
  }

  isValidEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  // @Override Validator
  validate(control: AbstractControl): ValidationErrors | null {
    // Si pas d'emails, on considère que c'est valide (la validation "required" est gérée séparément)
    const emails = this.emails();
    if (emails.length === 0) {
      return null;
    }

    // Vérifier si au moins un email est invalide
    const invalidEmails = emails.filter(email => !this.isValidEmail(email));

    if (invalidEmails.length > 0) {
      return {
        invalidEmails: {
          value: control.value,
          invalidEmails: invalidEmails
        }
      };
    }

    return null;
  }

}
