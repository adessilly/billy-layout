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

// The visual shell (.billy-modal*) is global: src/styles-dialog.scss.
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

  // Overlay-close navigation provided by the application (optional).
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
    // Open the modal
    this.modal = new Dialog( this.modalElement()?.nativeElement );
    this.modal.show();
    this.modal.listenClose().pipe(first()).subscribe(dialog => {
      if (this.afterClose) {
        // closeThen chaining: the action drives the navigation.
        this.afterClose();
      } else if (!this.destroyed) {
        // Component already destroyed = close driven by the router (overlay
        // replaced or cleared): do not navigate again, we would clobber a
        // freshly opened overlay.
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
   * Closes the dialog (animation included) then runs `action`, which owns the
   * navigation (another overlay or a page). Navigating without waiting for the
   * end of the animation lets the <body> scroll lock be released afterwards,
   * which breaks scrolling in the next dialog.
   */
  closeThen(action: () => void): void {
    this.afterClose = action;
    this.askCloseDialog();
  }

}
