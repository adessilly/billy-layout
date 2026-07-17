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
  InputTvaComponent,
  TvaDisplayComponent,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-datepicker : CVA 'yyyy-MM-dd' | null, popover desktop. */
@Component({
  selector: 'demo-datepicker',
  imports: [FormsModule, DatepickerComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Choisir une date" description="ControlValueAccessor au format 'yyyy-MM-dd' : popover calendrier sur desktop, bottom-sheet sur mobile (réduisez la fenêtre).">
      <div class="demo-form-block dp-block">
        <billy-datepicker [(ngModel)]="date" />
        <div class="demo-note">Valeur du modèle : <code>{{ date() ?? 'null' }}</code></div>
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

/** billy-dropdown : options {id, text, value}, mode recherche. */
@Component({
  selector: 'demo-dropdown',
  imports: [FormsModule, DropdownComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Liste déroulante avec recherche" description="Parité select2 : recherche avec mise en évidence, navigation clavier, le modèle reçoit option.value.">
      <div class="demo-form-block dd-block">
        <billy-dropdown [values]="options" [(ngModel)]="pays" placeholder="Choisir un pays…" />
        <div class="demo-note">Sélection : <code>{{ pays() ?? 'aucune' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .dd-block { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class DropdownDemoComponent {

  readonly options: DropdownOption[] = [
    { id: 'BE', text: 'Belgique', value: 'BE' },
    { id: 'FR', text: 'France', value: 'FR' },
    { id: 'LU', text: 'Luxembourg', value: 'LU' },
    { id: 'NL', text: 'Pays-Bas', value: 'NL' },
    { id: 'DE', text: 'Allemagne', value: 'DE' },
    { id: 'IT', text: 'Italie', value: 'IT' },
    { id: 'ES', text: 'Espagne', value: 'ES' },
  ];

  readonly pays = signal<string | null>(null);

}

/** La famille code-field : saisie formatée + affichages lecture. */
@Component({
  selector: 'demo-code-field',
  imports: [FormsModule, InputTvaComponent, InputIbanComponent, InputEmailComponent, TvaDisplayComponent, IbanDisplayComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Codes formatés et validés en frappe" description="Segments groupés, glyphe pays, statut (partiel / invalide / valide) : essayez BE 0403 200 393 ou BE71 0961 2345 6769." [center]="false">
      <div class="cf-grid">
        <div class="cf-block">
          <label class="cf-label">billy-input-tva</label>
          <billy-input-tva [(ngModel)]="tva" placeholder="BE 0123 456 749" />
          <label class="cf-label cf-label--read">billy-tva-display</label>
          <billy-tva-display [value]="tva()" glyph />
        </div>
        <div class="cf-block">
          <label class="cf-label">billy-input-iban</label>
          <billy-input-iban [(ngModel)]="iban" placeholder="BE00 0000 0000 0000" />
          <label class="cf-label cf-label--read">billy-iban-display</label>
          <billy-iban-display [value]="iban()" glyph />
        </div>
        <div class="cf-block">
          <label class="cf-label">billy-input-email</label>
          <billy-input-email [(ngModel)]="email" placeholder="prenom@domaine.be" />
          <div class="demo-note">Tapez « prenom&#64;gmial.com » pour voir la suggestion.</div>
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
  readonly tva = signal('');
  readonly iban = signal('');
  readonly email = signal('');
}

/** billy-input-emails : tags multi-emails + autocomplétion. */
@Component({
  selector: 'demo-input-emails',
  imports: [FormsModule, InputEmailsComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Saisie multi-destinataires" description="Entrée, virgule ou point-virgule pour valider un tag ; l'autocomplétion vient de [availableEmails], fourni par le consommateur.">
      <div class="demo-form-block ie-block">
        <billy-input-emails [(ngModel)]="emails" [availableEmails]="carnet" placeholder="Ajouter un destinataire…" />
        <div class="demo-note">Modèle (string) : <code>{{ emails() || 'null' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .ie-block { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class InputEmailsDemoComponent {

  readonly emails = signal<string | null>('compta@billy.be');

  readonly carnet = [
    'compta@billy.be',
    'direction@billy.be',
    'support@billy.be',
    'facturation@client-demo.be',
    'contact@client-demo.be',
  ];

}

/** billy-input-password : jauge de robustesse + correspondance. */
@Component({
  selector: 'demo-input-password',
  imports: [FormsModule, InputPasswordComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Mot de passe et confirmation" description="checkStrength affiche la jauge de robustesse ; compareTo valide la correspondance des deux champs." [center]="false">
      <div class="ip-grid">
        <billy-input-password label="Nouveau mot de passe" [checkStrength]="true" [(ngModel)]="password" />
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

/** billy-button-switch : toggle booléen CVA. */
@Component({
  selector: 'demo-button-switch',
  imports: [FormsModule, ButtonSwitchComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Interrupteur façon iOS" description="ControlValueAccessor booléen, avec libellés et icônes optionnels de part et d'autre.">
      <div class="bs-col">
        <billy-button-switch [(ngModel)]="simple" />
        <billy-button-switch labelOff="HTVA" labelOn="TVAC" [(ngModel)]="tvac" />
        <billy-button-switch iconOff="fa-regular fa-moon" iconOn="fa-solid fa-sun" [(ngModel)]="jour" />
        <div class="demo-note">simple : <code>{{ simple() }}</code> · tvac : <code>{{ tvac() }}</code> · jour : <code>{{ jour() }}</code></div>
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
  readonly tvac = signal(true);
  readonly jour = signal(false);
}

/** billy-attachment-button : pièces jointes en two-way binding. */
@Component({
  selector: 'demo-attachment-button',
  imports: [AttachmentButtonComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Joindre des fichiers" description="Le trombone porte le compteur ; le panneau liste permet d'ajouter et de retirer ([(files)], plafonné à 5).">
      <billy-attachment-button [(files)]="files" />
      <div class="demo-note">{{ files().length }} fichier(s) dans le modèle</div>
    </demo-stage>
  `,
})
export class AttachmentButtonDemoComponent {
  readonly files = signal<File[]>([]);
}
