import { Component, computed, forwardRef, inject, input, ElementRef, viewChild, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
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

  protected readonly i18n = inject(BillyI18nService);

  emails = signal<string[]>([]);
  inputValue = signal<string>('');
  showSuggestions = signal<boolean>(false);

  onChangeCallback: any;
  onTouchedCallback: any;

  inputElement = viewChild<ElementRef>('emailInput');
  placeholder = input<string>();
  /** The input always wins; otherwise the dictionary of the active locale. */
  protected readonly placeholderText = computed(() => this.placeholder() ?? this.i18n.strings().inputEmails.placeholder);
  disabled = false;

  // Regex to validate the emails
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // List of all emails available for autocompletion, provided by the
  // consumer (decoupled from ClientService when extracted into the library).
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
      // Split on comma or semicolon and clean up
      this.emails.set(value
        .split(/[,;]/)
        .map(email => email.trim())
        .filter(email => email.length > 0));
    }
  }

  onInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    // Arrow keys and Escape are handled by the popup itself
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Escape') {
      return;
    }

    // Create a tag on Space, Comma, Semicolon or Enter
    if (event.key === ' ' || event.key === ',' || event.key === ';' || event.key === 'Enter') {
      // If it's Enter and the popup is visible, the popup will handle the selection itself
      // We check whether the event was preventDefault-ed by the popup
      if (event.key === 'Enter' && this.showSuggestions()) {
        // Let the popup handle it first; if it doesn't, we add the email
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
    // Remove the last tag on Backspace when the input is empty
    else if (event.key === 'Backspace' && value === '' && this.emails().length > 0) {
      this.removeEmail(this.emails().length - 1);
    }
  }

  onInputChange(value: string) {
    this.inputValue.set(value);
    this.showSuggestions.set(value.trim().length >= 2);
  }

  onInputBlur() {
    // Small delay to allow clicking on a suggestion
    setTimeout(() => {
      // Add the email remaining in the input on blur
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

    // Extract all the emails from the pasted text
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
    // No emails is considered valid (the "required" validation is handled separately)
    const emails = this.emails();
    if (emails.length === 0) {
      return null;
    }

    // Check whether at least one email is invalid
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
