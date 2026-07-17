import { Component, input, output, viewChild, ElementRef, model } from '@angular/core';
import { Dialog } from '../dialog/dialog-utils';
import { first } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

export enum MessageDialogClick {
  PRIMARY = 1,
  SECONDARY = 2,
  CANCEL = 3
}

@Component({
    selector: 'billy-delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss'],
    imports: [CurrencyPipe]
})
export class DeleteDialogComponent {

  readonly message = model('Voulez-vous supprimer cet enregistrement ?');
  readonly productName = model('');
  readonly prix = model(0);
  readonly label = model('');
  readonly titre = model('Confirmation suppression');
  readonly labelValidate = model('Supprimer');
  readonly delete = output<string>();
  readonly modalDelete = viewChild.required<ElementRef>('modalDelete');

  private promiseResolver: (any);

  askDelete(): void {
    this.delete.emit('delete');
    if(this.promiseResolver) {
      this.promiseResolver();
    }
  }

  openDialog(): void {
    document.body.appendChild(this.modalDelete()?.nativeElement);
    const modal = new Dialog(this.modalDelete()?.nativeElement);
    modal.show();
    modal.listenClose().pipe(first()).subscribe(dialog => {
      document.body.removeChild(this.modalDelete()?.nativeElement);
    });
  }

  openDialogAndWait(titre: string, sousTitre: string, label: string): Promise<MessageDialogClick> {
    this.titre.set(titre);
    this.productName.set(sousTitre);
    this.label.set(label);
    this.openDialog();
    return new Promise( (resolve, reject) => {
      this.promiseResolver = resolve;
    });
  }

}
