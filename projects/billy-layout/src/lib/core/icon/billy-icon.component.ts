import { Component, input } from '@angular/core';

export type BillyIconName =
  | 'accueil' | 'achats' | 'devis' | 'ventes' | 'prestations' | 'agenda'
  | 'clients' | 'compte' | 'peppol'
  | 'bell' | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'sync' | 'check' | 'clock'
  | 'search' | 'dark-mode' | 'logout' | 'open' | 'upload' | 'plus'
  | 'close' | 'refresh' | 'bolt' | 'lock' | 'eye' | 'eye-off';

/**
 * Icônes SVG du design « Billy - Coque applicative » (trait arrondi, viewBox 24).
 * Réutilisable partout : <billy-icon name="achats" [size]="21" />
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
