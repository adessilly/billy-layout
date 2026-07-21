import { Component, input } from '@angular/core';

@Component({
    selector: 'billy-consult-line',
    templateUrl: './consult-line.component.html',
    styleUrls: ['./consult-line.component.scss'],
})
export class ConsultLineComponent {

  label = input<string | null>(null);

}
