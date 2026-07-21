import { Component, computed, inject, input, output, viewChild, ElementRef, model } from '@angular/core';
import { Dialog } from '../dialog/dialog-utils';
import { first } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

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

  protected readonly i18n = inject(BillyI18nService);

  readonly message = model<string | undefined>(undefined);
  readonly productName = model('');
  readonly price = model(0);
  readonly label = model('');
  readonly title = model<string | undefined>(undefined);
  readonly labelValidate = model<string | undefined>(undefined);

  protected readonly messageText = computed(() => this.message() ?? this.i18n.strings().deleteDialog.message);
  protected readonly titleText = computed(() => this.title() ?? this.i18n.strings().deleteDialog.title);
  protected readonly labelValidateText = computed(() => this.labelValidate() ?? this.i18n.strings().deleteDialog.confirm);
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

  openDialogAndWait(title: string, subtitle: string, label: string): Promise<MessageDialogClick> {
    this.title.set(title);
    this.productName.set(subtitle);
    this.label.set(label);
    this.openDialog();
    return new Promise( (resolve, reject) => {
      this.promiseResolver = resolve;
    });
  }

}
