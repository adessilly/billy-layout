import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AttachmentButtonComponent,
  ButtonSwitchComponent,
  DatepickerComponent,
  DropdownComponent,
  DropdownOption,
  IbanDisplayComponent,
  InputEmailComponent,
  InputEmailsComponent,
  InputIbanComponent,
  InputPasswordComponent,
  InputVatComponent,
  VatDisplayComponent,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';
import { DemoLocaleToggleComponent } from './demo-locale-toggle.component';

/** billy-datepicker : CVA 'yyyy-MM-dd' | null, desktop popover. */
@Component({
  selector: 'demo-datepicker',
  imports: [FormsModule, DatepickerComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Pick a date" description="ControlValueAccessor in 'yyyy-MM-dd' format: calendar popover on desktop, bottom sheet on mobile (shrink the window).">
      <demo-locale-toggle stage-controls />
      <div class="demo-form-block dp-block">
        <billy-datepicker [(ngModel)]="date" />
        <div class="demo-note">Model value: <code>{{ date() ?? 'null' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .dp-block { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class DatepickerDemoComponent {
  readonly date = signal<string | null>('2026-07-17');
}

/** billy-dropdown : {id, text, value} options, search mode. */
@Component({
  selector: 'demo-dropdown',
  imports: [FormsModule, DropdownComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Dropdown list with search" description="select2 parity: search with highlighting, keyboard navigation, the model receives option.value.">
      <demo-locale-toggle stage-controls />
      <div class="demo-form-block dd-block">
        <billy-dropdown [values]="options" [(ngModel)]="country" placeholder="Pick a country…" />
        <div class="demo-note">Selection: <code>{{ country() ?? 'none' }}</code></div>
      </div>
      <div class="demo-form-block dd-block">
        <billy-dropdown [values]="options" [multiple]="true" [(ngModel)]="countriesMulti" placeholder="Pick one or more countries…" />
        <div class="demo-note">Selection: <code>{{ countriesMulti().length ? countriesMulti().join(', ') : 'none' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .dd-block { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class DropdownDemoComponent {

  readonly options: DropdownOption[] = [
    { id: 'BE', text: 'Belgium', value: 'BE' },
    { id: 'FR', text: 'France', value: 'FR' },
    { id: 'LU', text: 'Luxembourg', value: 'LU' },
    { id: 'NL', text: 'Netherlands', value: 'NL' },
    { id: 'DE', text: 'Germany', value: 'DE' },
    { id: 'IT', text: 'Italy', value: 'IT' },
    { id: 'ES', text: 'Spain', value: 'ES' },
  ];

  readonly country = signal<string | null>(null);
  readonly countriesMulti = signal<string[]>(['FR', 'LU']);

}

/** The code-field family: formatted input + read-only displays. */
@Component({
  selector: 'demo-code-field',
  imports: [FormsModule, InputVatComponent, InputIbanComponent, InputEmailComponent, VatDisplayComponent, IbanDisplayComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Codes formatted and validated as you type" description="Grouped segments, country glyph, status (partial / invalid / valid): try BE 0403 200 393 or BE71 0961 2345 6769." [center]="false">
      <demo-locale-toggle stage-controls />
      <div class="cf-grid">
        <div class="cf-block">
          <label class="cf-label">billy-input-vat</label>
          <billy-input-vat [(ngModel)]="vat" placeholder="BE 0123 456 749" />
          <label class="cf-label cf-label--read">billy-vat-display</label>
          <billy-vat-display [value]="vat()" glyph />
        </div>
        <div class="cf-block">
          <label class="cf-label">billy-input-iban</label>
          <billy-input-iban [(ngModel)]="iban" placeholder="BE00 0000 0000 0000" />
          <label class="cf-label cf-label--read">billy-iban-display</label>
          <billy-iban-display [value]="iban()" glyph />
        </div>
        <div class="cf-block">
          <label class="cf-label">billy-input-email</label>
          <billy-input-email [(ngModel)]="email" placeholder="firstname@domain.be" />
          <div class="demo-note">Type "firstname&#64;gmial.com" to see the suggestion.</div>
        </div>
      </div>
    </demo-stage>
  `,
  styles: `
    .cf-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 22px;
    }

    .cf-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cf-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--billy-text-muted);

      &--read { margin-top: 10px; }
    }
  `,
})
export class CodeFieldDemoComponent {
  readonly vat = signal('');
  readonly iban = signal('');
  readonly email = signal('');
}

/** billy-input-emails : multi-email tags + autocompletion. */
@Component({
  selector: 'demo-input-emails',
  imports: [FormsModule, InputEmailsComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Multi-recipient input" description="Enter, comma or semicolon to confirm a tag; autocompletion comes from [availableEmails], supplied by the consumer.">
      <demo-locale-toggle stage-controls />
      <div class="demo-form-block ie-block">
        <billy-input-emails [(ngModel)]="emails" [availableEmails]="addressBook" />
        <div class="demo-note">Model (string): <code>{{ emails() || 'null' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .ie-block { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class InputEmailsDemoComponent {

  readonly emails = signal<string | null>('accounting@billy.be');

  readonly addressBook = [
    'accounting@billy.be',
    'management@billy.be',
    'support@billy.be',
    'billing@client-demo.be',
    'contact@client-demo.be',
  ];

}

/** billy-input-password : strength gauge + match check. */
@Component({
  selector: 'demo-input-password',
  imports: [FormsModule, InputPasswordComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Password and confirmation" description="checkStrength shows the strength gauge; compareTo validates that both fields match." [center]="false">
      <demo-locale-toggle stage-controls />
      <div class="ip-grid">
        <billy-input-password label="New password" [checkStrength]="true" [(ngModel)]="password" />
        <billy-input-password label="Confirmation" [compareTo]="password()" [(ngModel)]="confirm" />
      </div>
    </demo-stage>
  `,
  styles: `
    .ip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 22px;
      max-width: 640px;
    }
  `,
})
export class InputPasswordDemoComponent {
  readonly password = signal('');
  readonly confirm = signal('');
}

/** billy-button-switch : boolean CVA toggle. */
@Component({
  selector: 'demo-button-switch',
  imports: [FormsModule, ButtonSwitchComponent, DemoStageComponent],
  template: `
    <demo-stage title="iOS-style switch" description="Boolean ControlValueAccessor, with optional labels and icons on either side.">
      <div class="bs-col">
        <billy-button-switch [(ngModel)]="simple" />
        <billy-button-switch labelOff="excl. VAT" labelOn="incl. VAT" [(ngModel)]="inclVat" />
        <billy-button-switch iconOff="fa-regular fa-moon" iconOn="fa-solid fa-sun" [(ngModel)]="day" />
        <div class="demo-note">simple: <code>{{ simple() }}</code> · inclVat: <code>{{ inclVat() }}</code> · day: <code>{{ day() }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .bs-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class ButtonSwitchDemoComponent {
  readonly simple = signal(false);
  readonly inclVat = signal(true);
  readonly day = signal(false);
}

/** billy-attachment-button : attachments with two-way binding. */
@Component({
  selector: 'demo-attachment-button',
  imports: [AttachmentButtonComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Attach files" description="The paperclip carries the counter; the list panel lets you add and remove ([(files)], capped at 5).">
      <demo-locale-toggle stage-controls />
      <billy-attachment-button [(files)]="files" />
      <div class="demo-note">{{ files().length }} file(s) in the model</div>
    </demo-stage>
  `,
})
export class AttachmentButtonDemoComponent {
  readonly files = signal<File[]>([]);
}
