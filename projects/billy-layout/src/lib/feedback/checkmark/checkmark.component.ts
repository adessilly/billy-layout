import { Component, input } from '@angular/core';

/** Couleurs du design system utilisables par la coche et son spinner. */
export type CheckmarkColor = 'success' | 'accent' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'billy-checkmark',
  templateUrl: './checkmark.component.html',
  styleUrls: ['./checkmark.component.scss'],
  host: { '[attr.data-color]': 'color()' },
})
export class CheckmarkComponent {

  /** Libellé annoncé aux lecteurs d'écran. */
  readonly label = input('Succès');

  /** Couleur du design system. */
  readonly color = input<CheckmarkColor>('success');

}
