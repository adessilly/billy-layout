import { Component, input } from '@angular/core';

@Component({
    selector: 'billy-form-panel',
    templateUrl: './form-panel.component.html',
    styleUrls: ['./form-panel.component.scss'],
    standalone: true
})
export class FormPanelComponent {

  titre = input('');
  subpanel = input(false);

}
