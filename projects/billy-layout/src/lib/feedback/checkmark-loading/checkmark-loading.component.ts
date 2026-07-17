import { Component, input } from '@angular/core';
import { CheckmarkColor } from '../checkmark/checkmark.component';

@Component({
  selector: 'billy-checkmark-loading',
  templateUrl: './checkmark-loading.component.html',
  styleUrls: ['./checkmark-loading.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkLoadingComponent {

  /** Libellé annoncé aux lecteurs d'écran. */
  readonly label = input('Chargement en cours');

  /** Couleur du design system. */
  readonly color = input<CheckmarkColor>('success');

}
