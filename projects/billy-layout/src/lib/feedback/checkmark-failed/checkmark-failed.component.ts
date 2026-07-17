import { Component, input } from '@angular/core';
import { CheckmarkColor } from '../checkmark/checkmark.component';

@Component({
  selector: 'billy-checkmark-failed',
  templateUrl: './checkmark-failed.component.html',
  styleUrls: ['./checkmark-failed.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkFailedComponent {

  /** Libellé annoncé aux lecteurs d'écran. */
  readonly label = input('Échec');

  /** Couleur du design system. */
  readonly color = input<CheckmarkColor>('danger');

}
