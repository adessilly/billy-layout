import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';

/**
 * Bouton de navigation réutilisable de la sidebar :
 * icône billy-icon + libellé, état actif (routerLinkActive) et badge optionnel.
 */
@Component({
  selector: 'billy-nav-item',
  templateUrl: './billy-nav-item.component.html',
  styleUrls: ['./billy-nav-item.component.scss'],
  imports: [RouterLink, RouterLinkActive, BillyIconComponent],
})
export class BillyNavItemComponent {

  readonly link = input.required<string>();
  readonly icon = input.required<BillyIconName>();
  readonly label = input.required<string>();
  readonly collapsed = input(false);
  readonly badge = input<string | null>(null);
  /** `info` (défaut) : compteur discret. `notification` : pastille rouge qui appelle l'action. */
  readonly badgeVariant = input<'info' | 'notification'>('info');

}
