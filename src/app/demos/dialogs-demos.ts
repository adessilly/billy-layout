import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AutofocusDirective,
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
import { DemoLocaleToggleComponent } from './demo-locale-toggle.component';

/** billy-delete-dialog : delete confirmation, promise-based. */
@Component({
  selector: 'demo-delete-dialog',
  imports: [DeleteDialogComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Confirm a deletion" description="openDialogAndWait(title, subtitle, label) returns a promise resolved when Delete is clicked. Escape, backdrop click and the close cross dismiss without deleting. Focus enters the dialog on opening and returns to this button on closing; the page behind is inert meanwhile.">
      <demo-locale-toggle stage-controls />
      <button type="button" class="demo-btn--destructive" (click)="ask()">
        <i class="fa-solid fa-trash-can"></i> Delete the sample invoice
      </button>
      <billy-delete-dialog />
    </demo-stage>
  `,
})
export class DeleteDialogDemoComponent {

  private readonly toastr = inject(ToastrService);
  private readonly dialog = viewChild.required(DeleteDialogComponent);

  ask(): void {
    // The promise only resolves on a "Delete" click; Escape,
    // backdrop click and the cross close the dialog without resolving it.
    void this.dialog().openDialogAndWait(
      'Delete this sale?',
      'Invoice 2026-042 · Billy SPRL',
      '€1,210.00 incl. VAT',
    ).then(() => this.toastr.success('The sample invoice was deleted.', 'Deleted'));
  }

}

/** billy-dialog-form : the generic header/body/footer dialog. */
@Component({
  selector: 'demo-dialog-form',
  imports: [FormsModule, AutofocusDirective, DialogFormComponent, DialogFormHeaderComponent, DialogFormBodyComponent, DialogFormFooterComponent, InputLineComponent, SaveBarComponent, DemoStageComponent],
  template: `
    <demo-stage title="A form dialog" description="The .billy-modal shell opens as soon as the component renders, moves itself under <body> and wires up Escape / backdrop click / the header cross. It is modal: focus jumps into the dialog (here on the field, thanks to billyAutofocus), Tab cycles inside it, the page behind is inert, and focus comes back to this button on closing.">
      <button type="button" class="demo-btn--submit" (click)="open.set(true)">Open the dialog</button>

      @if (open()) {
        <billy-dialog-form (closed)="open.set(false)">
          <billy-dialog-form-header>
            <h4>Rename the invoice</h4>
          </billy-dialog-form-header>
          <billy-dialog-form-body>
            <billy-input-line label="New label" [mandatory]="true">
              <input billyAutofocus class="demo-field" [(ngModel)]="label" placeholder="July services" />
            </billy-input-line>
          </billy-dialog-form-body>
          <billy-dialog-form-footer>
            <billy-save-bar class="no-theme" labelSave="Rename" (save)="save()" (cancel)="close()" />
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
  readonly label = signal('July services');

  save(): void {
    this.dialog()?.closeThen(() => {
      this.toastr.success(`New label: "${this.label()}".`, 'Renamed');
    });
  }

  close(): void {
    this.dialog()?.askCloseDialog();
  }

}
