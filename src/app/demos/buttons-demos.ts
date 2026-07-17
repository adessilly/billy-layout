import { Component, inject, signal } from '@angular/core';
import {
  ButtonAjoutComponent,
  ButtonComponent,
  ButtonUploadComponent,
  ToastrService,
  type BillyButtonColor,
  type BillyButtonSize,
  type BillyButtonVariant,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-button : le bouton d'action polyvalent (couleurs × variantes × tailles). */
@Component({
  selector: 'demo-button',
  imports: [ButtonComponent, DemoStageComponent],
  template: `
    <demo-stage
      titre="Couleurs × variantes"
      [center]="false"
      description="Les 5 teintes du design system déclinées sur les 6 variantes. Survolez pour voir le motion design (élévation des pleins, pilule des « text-rounded »).">
      <div class="btn-grid">
        @for (variant of variants; track variant) {
          <div class="btn-grid__row">
            <span class="btn-grid__tag">{{ variant }}</span>
            @for (color of colors; track color) {
              <billy-button [label]="colorLabels[color]" [color]="color" [variant]="variant"
                (clicked)="toastr.info(color + ' · ' + variant, 'Clic')" />
            }
          </div>
        }
      </div>
    </demo-stage>

    <demo-stage
      titre="Tailles & icônes"
      description="small / normal / big. Le label et l'icône sont indépendants : label seul, icône + label, ou icône seule (bouton carré, pensez à ariaLabel).">
      <div class="btn-line">
        <billy-button label="Small" size="small" icon="fa-solid fa-bolt" color="primary" />
        <billy-button label="Normal" size="normal" icon="fa-solid fa-bolt" color="primary" />
        <billy-button label="Big" size="big" icon="fa-solid fa-bolt" color="primary" />
      </div>
      <div class="btn-line">
        <billy-button label="Icône à droite" icon="fa-solid fa-arrow-right" iconPosition="right" variant="outline" color="info" />
        <billy-button icon="fa-solid fa-heart" ariaLabel="Favori" variant="plain-rounded" color="error" />
        <billy-button icon="fa-solid fa-gear" ariaLabel="Réglages" variant="text-rounded" color="neutral" />
        <billy-button icon="fa-solid fa-plus" ariaLabel="Ajouter" variant="outline-rounded" color="primary" size="big" />
      </div>
    </demo-stage>

    <demo-stage
      titre="Ghost / Retour"
      description="La variante « ghost » reprend à l'identique le bouton d'annulation de la save-bar : fantôme discret sur les tokens d'input du DS. Insensible à color — idéale pour un « Retour » ou une action secondaire à côté d'un bouton plein.">
      <div class="btn-line">
        <billy-button label="Retour" icon="fa-solid fa-chevron-left" variant="ghost" (clicked)="toastr.info('Retour', 'Navigation')" />
        <billy-button label="Enregistrer" icon="fa-solid fa-floppy-disk" color="primary" />
      </div>
      <div class="btn-line">
        <billy-button label="Annuler" variant="ghost-rounded" />
        <billy-button icon="fa-solid fa-arrow-left" ariaLabel="Retour" variant="ghost" />
      </div>
    </demo-stage>

    <demo-stage
      titre="États"
      description="loading (spinner + clics neutralisés), disabled, et pleine largeur via [block].">
      <div class="btn-line">
        <billy-button label="Enregistrer" icon="fa-solid fa-floppy-disk" color="primary"
          [loading]="saving()" (clicked)="simulateSave()" />
        <billy-button label="Indisponible" color="neutral" variant="outline" [disabled]="true" />
        <billy-button label="Supprimer" icon="fa-solid fa-trash" color="error" variant="text" />
      </div>
      <div class="btn-block">
        <billy-button label="Action pleine largeur" icon="fa-solid fa-paper-plane" color="info" [block]="true" />
      </div>
    </demo-stage>
  `,
  styles: `
    .btn-grid { display: flex; flex-direction: column; gap: 14px; }
    .btn-grid__row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
    .btn-grid__tag {
      width: 128px;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      color: var(--billy-text-soft);
    }
    .btn-line { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
    .btn-line:last-child { margin-bottom: 0; }
    .btn-block { max-width: 360px; margin: 4px auto 0; }
    @media (max-width: 640px) {
      .btn-grid__row { flex-direction: column; align-items: stretch; }
      .btn-grid__tag { width: auto; }
    }
  `,
})
export class ButtonDemoComponent {
  readonly toastr = inject(ToastrService);
  readonly saving = signal(false);

  readonly colors: BillyButtonColor[] = ['neutral', 'info', 'primary', 'warning', 'error'];
  readonly variants: BillyButtonVariant[] = [
    'plain', 'plain-rounded', 'outline', 'outline-rounded', 'text', 'text-rounded',
  ];
  readonly sizes: BillyButtonSize[] = ['small', 'normal', 'big'];
  readonly colorLabels: Record<BillyButtonColor, string> = {
    neutral: 'Neutral',
    info: 'Info',
    primary: 'Primary',
    warning: 'Warning',
    error: 'Error',
  };

  simulateSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toastr.success('Modifications enregistrées (simulation).', 'Enregistré');
    }, 1400);
  }
}

/** billy-button-ajout : la tuile « ajouter » des écrans d'accueil. */
@Component({
  selector: 'demo-button-ajout',
  imports: [ButtonAjoutComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Les tuiles d'action de l'accueil" description="Label + sous-titre + icône FontAwesome ; réservées aux écrans home-actions (cf. guidelines §1).">
      <div class="ba-row">
        <billy-button-ajout label="Ajouter une vente" subtitle="Facture ou note de crédit" icon="fa-solid fa-file-invoice" (clicked)="toastr.info('Ouverture du formulaire de vente (simulée).', 'Ajouter')" />
        <billy-button-ajout label="Ajouter un client" subtitle="Particulier ou société" icon="fa-solid fa-user-plus" (clicked)="toastr.info('Ouverture du formulaire client (simulée).', 'Ajouter')" />
      </div>
    </demo-stage>
  `,
  styles: `
    .ba-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
  `,
})
export class ButtonAjoutDemoComponent {
  readonly toastr = inject(ToastrService);
}

/** billy-button-upload : la tuile d'import de fichier. */
@Component({
  selector: 'demo-button-upload',
  imports: [ButtonUploadComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Importer un fichier" description="Input file caché, re-sélection du même fichier possible, état loading pendant le traitement.">
      <billy-button-upload label="Importer un achat" subtitle="PDF, JPG ou PNG" [loading]="loading()" (fileSelected)="onFile($event)" />
      <div class="demo-note">{{ lastFile() ?? 'Aucun fichier sélectionné pour l’instant.' }}</div>
    </demo-stage>
  `,
})
export class ButtonUploadDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly loading = signal(false);
  readonly lastFile = signal<string | null>(null);

  onFile(file: File): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.lastFile.set(`Reçu : ${file.name} (${Math.round(file.size / 1024)} Ko)`);
      this.toastr.success(`${file.name} traité (simulation).`, 'Import terminé');
    }, 1200);
  }

}
