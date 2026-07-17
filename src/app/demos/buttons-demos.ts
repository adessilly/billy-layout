import { Component, inject, signal } from '@angular/core';
import { ButtonAjoutComponent, ButtonUploadComponent, ToastrService } from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

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
