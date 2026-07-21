import { Component, input } from '@angular/core';

export type BillyIconName =
  | 'home' | 'purchases' | 'quotes' | 'sales' | 'services' | 'calendar'
  | 'clients' | 'account' | 'peppol'
  | 'bell' | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'sync' | 'check' | 'clock'
  | 'search' | 'dark-mode' | 'logout' | 'open' | 'upload' | 'plus'
  | 'close' | 'refresh' | 'bolt' | 'lock' | 'eye' | 'eye-off';

/**
 * SVG icons from the "Billy - App shell" design (rounded stroke, viewBox 24).
 * Reusable anywhere: <billy-icon name="purchases" [size]="21" />
 */
@Component({
  selector: 'billy-icon',
  templateUrl: './billy-icon.component.html',
  styleUrls: ['./billy-icon.component.scss'],
})
export class BillyIconComponent {

  readonly name = input.required<BillyIconName | string>();
  readonly size = input(21);
  readonly strokeWidth = input(1.9);

}
