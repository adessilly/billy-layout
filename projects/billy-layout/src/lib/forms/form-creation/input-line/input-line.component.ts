import { Component, input } from '@angular/core';


@Component({
    selector: 'billy-input-line',
    templateUrl: './input-line.component.html',
    styleUrls: ['./input-line.component.scss'],
    imports: []
})
export class InputLineComponent {

  label = input('');
  mandatory = input(false);
  info = input('');
  nomarginbottom = input(false);

}
