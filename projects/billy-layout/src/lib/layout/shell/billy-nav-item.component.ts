import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';

/**
 * Reusable navigation button of the sidebar:
 * billy-icon icon + label, active state (routerLinkActive) and optional badge.
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
  /** `info` (default): discreet counter. `notification`: red dot that calls for action. */
  readonly badgeVariant = input<'info' | 'notification'>('info');

}
