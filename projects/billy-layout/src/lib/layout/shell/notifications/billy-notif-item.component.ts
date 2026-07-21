import { Component, computed, input } from '@angular/core';

/**
 * Generic row of a notification list: initial avatar, title, subtitle, and
 * right-hand column (amount + status). The click is handled on the host
 * element, by the calling component.
 */
@Component({
  selector: 'billy-notif-item',
  templateUrl: './billy-notif-item.component.html',
  styleUrls: ['./billy-notif-item.component.scss'],
})
export class BillyNotifItemComponent {

  readonly accentBg = input.required<string>();
  readonly accentColor = input.required<string>();
  /** Text whose first letter is used as the avatar's initial. */
  readonly initialSource = input<string | number | null | undefined>(null);
  readonly title = input.required<string>();
  readonly sub = input('');
  readonly amount = input<string | null>(null);
  readonly status = input('');
  /** Status color; defaults to the category's accent color. */
  readonly statusColor = input<string | null>(null);

  readonly initial = computed(() =>
    String(this.initialSource() ?? '?').trim().charAt(0).toUpperCase() || '?');

}
