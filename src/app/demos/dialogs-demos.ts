import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DeleteDialogComponent,
  DialogFormBodyComponent,
  DialogFormComponent,
  DialogFormFooterComponent,
  DialogFormHeaderComponent,
  InputLineComponent,
  SaveBarComponent,
  ToastrService,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-delete-dialog : confirmation de suppression, promesse à la clé. */
@Component({
  selector: 'demo-delete-dialog',
  imports: [DeleteDialogComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Confirmer une suppression" description="openDialogAndWait(titre, sousTitre, label) rend une promesse résolue au clic sur Supprimer. Échap, clic-fond et croix ferment sans supprimer.">
      <button type="button" class="demo-btn--destructive" (click)="ask()">
        <i class="fa-solid fa-trash-can"></i> Supprimer la facture fictive
      </button>
      <billy-delete-dialog />
    </demo-stage>
  `,
})
export class DeleteDialogDemoComponent {

  private readonly toastr = inject(ToastrService);
  private readonly dialog = viewChild.required(DeleteDialogComponent);

  ask(): void {
    // La promesse n'est résolue qu'au clic sur « Supprimer » ; Échap,
    // clic-fond et croix ferment le dialogue sans la résoudre.
    void this.dialog().openDialogAndWait(
      'Supprimer cette vente ?',
      'Facture 2026-042 · Billy SPRL',
      '1 210,00 € TVAC',
    ).then(() => this.toastr.success('La facture fictive est supprimée.', 'Supprimé'));
  }

}

/** billy-dialog-form : le dialogue générique header/body/footer. */
@Component({
  selector: 'demo-dialog-form',
  imports: [FormsModule, DialogFormComponent, DialogFormHeaderComponent, DialogFormBodyComponent, DialogFormFooterComponent, InputLineComponent, SaveBarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Un dialogue de formulaire" description="La coque .billy-modal s'ouvre dès l'affichage du composant, se déplace sous <body> et articule Échap / clic-fond / croix du header.">
      <button type="button" class="demo-btn--submit" (click)="open.set(true)">Ouvrir le dialogue</button>

      @if (open()) {
        <billy-dialog-form (closed)="open.set(false)">
          <billy-dialog-form-header>
            <h4>Renommer la facture</h4>
          </billy-dialog-form-header>
          <billy-dialog-form-body>
            <billy-input-line label="Nouveau libellé" [mandatory]="true">
              <input class="demo-field" [(ngModel)]="libelle" placeholder="Prestation de juillet" />
            </billy-input-line>
          </billy-dialog-form-body>
          <billy-dialog-form-footer>
            <billy-save-bar class="no-theme" labelSave="Renommer" (save)="save()" (cancel)="close()" />
          </billy-dialog-form-footer>
        </billy-dialog-form>
      }
    </demo-stage>
  `,
})
export class DialogFormDemoComponent {

  private readonly toastr = inject(ToastrService);
  private readonly dialog = viewChild(DialogFormComponent);

  readonly open = signal(false);
  readonly libelle = signal('Prestation de juillet');

  save(): void {
    this.dialog()?.closeThen(() => {
      this.toastr.success(`Nouveau libellé : « ${this.libelle()} ».`, 'Renommé');
    });
  }

  close(): void {
    this.dialog()?.askCloseDialog();
  }

}
