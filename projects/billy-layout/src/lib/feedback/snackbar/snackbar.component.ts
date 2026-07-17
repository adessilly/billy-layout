import { Component, input, model, output } from '@angular/core';

@Component({
    selector: 'billy-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  message = input('Nouvelle version disponible.');
  buttonTitle = input('Cliquez ici pour rafraîchir et mettre à jour');
  buttonLabel = input('Mettre à jour');
  closeTitle = input('ignorer ce message');

  visible = model(false);
  buttonClick = output();

  askClose(): void {
    this.visible.set(false);
  }

  askButtonClick(): void {
    this.buttonClick.emit();
  }

}
