import { Component, input } from '@angular/core';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';

/**
 * Carte de navigation : tuile cliquable avec pastille-icône, libellé,
 * badge de comptage, description et chevron de survol.
 *
 * Sélecteur d'attribut sur `<a>` ou `<button>` : la navigation (routerLink,
 * href, click) reste portée par le consommateur, la carte n'est que l'habillage.
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

  /** Libellé principal de la carte. */
  readonly label = input.required<string>();

  /** Icône de la pastille (jeu billy-icon). */
  readonly icon = input.required<BillyIconName>();

  /** Description courte sous le libellé. Chaîne vide = masquée. */
  readonly description = input('');

  /** Badge numérique après le libellé. `null` = pas de badge (un `0` s'affiche). */
  readonly badge = input<number | null>(null);

  /** Chevron « aller vers » révélé au survol. */
  readonly chevron = input(true);

  /** Index d'apparition : décale l'animation d'entrée de 60 ms par carte. */
  readonly stagger = input(0);

}
