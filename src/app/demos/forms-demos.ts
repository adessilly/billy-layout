import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ConsultLineComponent,
  FormSidePanelComponent,
  InputLineComponent,
  InputPrefixeSuffixeComponent,
  LabelClipboardComponent,
  SaveBarComponent,
  ToastrService,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-input-line : la ligne label + champ projeté. */
@Component({
  selector: 'demo-input-line',
  imports: [FormsModule, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage titre="La ligne de formulaire canonique" description="Label, astérisque d'obligation, infobulle : le champ est projeté dedans." [center]="false">
      <div class="demo-form-block il-center">
        <billy-input-line label="Libellé de la facture" [mandatory]="true">
          <input class="demo-field" [(ngModel)]="libelle" placeholder="Prestation de juillet" />
        </billy-input-line>
        <billy-input-line label="Référence interne" info="Visible uniquement par vous, jamais sur la facture.">
          <input class="demo-field" [(ngModel)]="reference" placeholder="2026-042" />
        </billy-input-line>
      </div>
    </demo-stage>
  `,
  styles: `.il-center { margin: 0 auto; }`,
})
export class InputLineDemoComponent {
  readonly libelle = signal('');
  readonly reference = signal('');
}

/** billy-consult-line : le pendant lecture seule. */
@Component({
  selector: 'demo-consult-line',
  imports: [ConsultLineComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Relire sans éditer" description="Même gabarit qu'input-line, mais pour les écrans de consultation." [center]="false">
      <div class="demo-form-block cl-center">
        <billy-consult-line label="Client">Billy SPRL</billy-consult-line>
        <billy-consult-line label="Montant TVAC">1 210,00 €</billy-consult-line>
        <billy-consult-line label="Échéance">31/07/2026</billy-consult-line>
      </div>
    </demo-stage>
  `,
  styles: `.cl-center { margin: 0 auto; }`,
})
export class ConsultLineDemoComponent {}

/** billy-input-prefixe-suffixe : groupe champ + addons cliquables. */
@Component({
  selector: 'demo-input-prefixe-suffixe',
  imports: [FormsModule, InputPrefixeSuffixeComponent, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Préfixes et suffixes accolés" description="Les addons cliquables émettent prefixeClick / suffixeClick — ici le suffixe vide le champ." [center]="false">
      <div class="demo-form-block ips-center">
        <billy-input-line label="Montant hors TVA">
          <billy-input-prefixe-suffixe suffixe="€ HTVA">
            <input class="demo-field" type="number" [(ngModel)]="montant" placeholder="0.00" />
          </billy-input-prefixe-suffixe>
        </billy-input-line>
        <billy-input-line label="Site web">
          <billy-input-prefixe-suffixe prefixe="https://" suffixeIcon="fa-solid fa-xmark" [suffixeClickable]="true" (suffixeClick)="site.set('')">
            <input class="demo-field" [(ngModel)]="site" placeholder="billy.be" />
          </billy-input-prefixe-suffixe>
        </billy-input-line>
      </div>
    </demo-stage>
  `,
  styles: `.ips-center { margin: 0 auto; }`,
})
export class InputPrefixeSuffixeDemoComponent {
  readonly montant = signal<number | null>(null);
  readonly site = signal('');
}

/** billy-label-clipboard : libellé copiable. */
@Component({
  selector: 'demo-label-clipboard',
  imports: [LabelClipboardComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Copier d'un clic" description="Cliquez sur la valeur : elle part dans le presse-papier avec retour visuel.">
      <div class="lc-col">
        <billy-label-clipboard label="BE71 0961 2345 6769" />
        <billy-label-clipboard label="facture-2026-042" />
      </div>
    </demo-stage>
  `,
  styles: `
    .lc-col { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  `,
})
export class LabelClipboardDemoComponent {}

/** billy-save-bar : la conclusion de tout formulaire. */
@Component({
  selector: 'demo-save-bar',
  imports: [SaveBarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Enregistrer / Annuler" description="disabled = validité du formulaire, loading = requête en cours (le libellé bascule). En pied de dialogue, ajoutez class='no-theme'." [center]="false">
      <div stage-controls class="sb-controls">
        <label><input type="checkbox" [checked]="disabled()" (change)="disabled.set(!disabled())" /> disabled</label>
        <label><input type="checkbox" [checked]="noTheme()" (change)="noTheme.set(!noTheme())" /> no-theme</label>
      </div>
      <div class="sb-frame" [class.sb-frame--flat]="noTheme()">
        <billy-save-bar
          [class.no-theme]="noTheme()"
          [disabled]="disabled()"
          [loading]="loading()"
          (save)="fakeSave()"
          (cancel)="toastr.info('Retour arrière (simulé).', 'Annuler')" />
      </div>
    </demo-stage>
  `,
  styles: `
    .sb-controls {
      display: flex;
      gap: 14px;

      label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--billy-text-soft);
      }

      input { accent-color: var(--billy-accent); }
    }

    .sb-frame {
      border: 1px dashed var(--billy-surface-border);
      border-radius: 12px;
      padding: 10px;

      &--flat { background: var(--billy-section-bg); }
    }
  `,
})
export class SaveBarDemoComponent {

  readonly toastr = inject(ToastrService);
  readonly disabled = signal(false);
  readonly noTheme = signal(false);
  readonly loading = signal(false);

  fakeSave(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.toastr.success('Le formulaire fictif est sauvegardé.', 'Enregistré');
    }, 1400);
  }

}

/** billy-form-side-panel : panneau latéral avec overlay. */
@Component({
  selector: 'demo-form-side-panel',
  imports: [FormsModule, SaveBarComponent, FormSidePanelComponent, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Le panneau latéral" description="Overlay + verrou de scroll, fermeture au clic sur le fond (overlayClick). Le pied utilise une save-bar en no-theme.">
      <button type="button" class="demo-btn--submit" (click)="open.set(true)">Ouvrir le panneau</button>

      @if (open()) {
        <billy-form-side-panel (overlayClick)="open.set(false)">
          <div class="fsp-head">
            <h3>Paiement rapide</h3>
            <p>Un formulaire court, sans quitter la page.</p>
          </div>
          <div class="fsp-body">
            <billy-input-line label="Montant reçu" [mandatory]="true">
              <input class="demo-field" type="number" [(ngModel)]="montant" placeholder="0.00" />
            </billy-input-line>
            <billy-input-line label="Communication">
              <input class="demo-field" [(ngModel)]="communication" placeholder="+++123/4567/89012+++" />
            </billy-input-line>
          </div>
          <billy-save-bar class="no-theme" (save)="save()" (cancel)="open.set(false)" />
        </billy-form-side-panel>
      }
    </demo-stage>
  `,
  styles: `
    .fsp-head {
      padding: 20px 22px 8px;

      h3 { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--site-heading); }
      p { margin: 0; font-size: 12.5px; color: var(--billy-text-soft); }
    }

    .fsp-body {
      flex: 1;
      padding: 12px 22px;
      overflow-y: auto;
    }
  `,
})
export class FormSidePanelDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly open = signal(false);
  readonly montant = signal<number | null>(null);
  readonly communication = signal('');

  save(): void {
    this.open.set(false);
    this.toastr.success('Paiement fictif encodé.', 'Enregistré');
  }

}
