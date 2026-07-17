import {
  Component, ChangeDetectorRef, AfterViewInit, OnDestroy, ElementRef,
  inject, input, output, viewChild,
  contentChild } from '@angular/core';
import { DialogFormBodyComponent } from './dialog-form-body/dialog-form-body.component';
import { DialogFormHeaderComponent } from './dialog-form-header/dialog-form-header.component';
import { DialogFormFooterComponent } from './dialog-form-footer/dialog-form-footer.component';
import { Dialog } from '../dialog/dialog-utils';
import { BILLY_DIALOG_ROUTER } from '../dialog/billy-dialog-router';
import { NgTemplateOutlet } from '@angular/common';
import { first } from 'rxjs';

// La coque visuelle (.billy-modal*) est globale : src/styles-dialog.scss.
@Component({
    selector: 'billy-dialog-form',
    templateUrl: './dialog-form.component.html',
    imports: [NgTemplateOutlet]
})
export class DialogFormComponent implements AfterViewInit, OnDestroy {

  large = input<boolean>(false);
  maxWidth = input<number | null>(null);
  closed = output<void>();
  modalElement = viewChild<ElementRef>('dialogRoot');
  body = contentChild(DialogFormBodyComponent);
  header = contentChild(DialogFormHeaderComponent);
  footer = contentChild(DialogFormFooterComponent);

  dialogClosed = false;
  modal: Dialog | null = null;
  destroyed = false;
  closeFromButtonAction = false;
  private afterClose: (() => void) | null = null;

  // Navigation de fermeture d'overlay fournie par l'application (optionnelle).
  private dialogRouter = inject(BILLY_DIALOG_ROUTER, { optional: true });

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.detectChanges();
    this.openDialog();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if(!this.closeFromButtonAction) {
      this.hideDialog();
    }
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  openDialog(): void {
    document.body.appendChild(this.modalElement()?.nativeElement);
    // Ouvrir le modal
    this.modal = new Dialog( this.modalElement()?.nativeElement );
    this.modal.show();
    this.modal.listenClose().pipe(first()).subscribe(dialog => {
      if (this.afterClose) {
        // Enchaînement closeThen : c'est l'action qui pilote la navigation.
        this.afterClose();
      } else if (!this.destroyed) {
        // Composant déjà détruit = fermeture pilotée par le routeur (overlay
        // remplacé ou effacé) : ne pas re-naviguer, on écraserait un overlay
        // fraîchement ouvert.
        this.closeDialog();
      }
      const closeFromStandardCancelDialog = (!this.closeFromButtonAction && !this.destroyed)
      if(this.closeFromButtonAction || closeFromStandardCancelDialog) {
        this.closed.emit();
      }
      this.dialogClosed = true;
      document.body.removeChild(this.modalElement()?.nativeElement);
    });
  }

  closeDialog(): void {
    this.dialogRouter?.closeOverlay();
  }

  private hideDialog(): void {
    if (!this.dialogClosed) {
      this.modal?.hide();
    }
  }

  askCloseDialog(): void {
    this.closeFromButtonAction = true;
    this.hideDialog();
  }

  /**
   * Ferme le dialogue (animation comprise) puis exécute `action`, à qui revient
   * la navigation (autre overlay ou page). Naviguer sans attendre la fin de
   * l'animation laisse le verrou de scroll du <body> être levé après coup, ce
   * qui casse le scroll du dialogue suivant.
   */
  closeThen(action: () => void): void {
    this.afterClose = action;
    this.askCloseDialog();
  }

}
