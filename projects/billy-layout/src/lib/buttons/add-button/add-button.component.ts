import { Component, input, output } from '@angular/core';

@Component({
    selector: 'billy-button-ajout',
    templateUrl: './button-ajout.component.html',
    styleUrls: ['./button-ajout.component.scss']
})
export class ButtonAjoutComponent {

  readonly label = input('Ajouter');
  readonly subtitle = input('');
  readonly icon = input('fa-solid fa-pen-to-square');

  readonly clicked = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clicked.emit(event);
  }

}
