import { Component, input } from '@angular/core';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';

/**
 * Navigation card: clickable tile with an icon chip, label,
 * count badge, description and hover chevron.
 *
 * Attribute selector on `<a>` or `<button>`: navigation (routerLink,
 * href, click) stays with the consumer, the card is only the dressing.
 */
@Component({
  selector: 'a[billy-nav-card], button[billy-nav-card]',
  templateUrl: './nav-card.component.html',
  styleUrls: ['./nav-card.component.scss'],
  imports: [BillyIconComponent],
  host: {
    '[style.--billy-nav-card-stagger]': 'stagger()',
  },
})
export class NavCardComponent {

  /** Main label of the card. */
  readonly label = input.required<string>();

  /** Chip icon (billy-icon set). */
  readonly icon = input.required<BillyIconName>();

  /** Short description below the label. Empty string = hidden. */
  readonly description = input('');

  /** Numeric badge after the label. `null` = no badge (a `0` is displayed). */
  readonly badge = input<number | null>(null);

  /** "Go to" chevron revealed on hover. */
  readonly chevron = input(true);

  /** Appearance index: offsets the entrance animation by 60 ms per card. */
  readonly stagger = input(0);

}
