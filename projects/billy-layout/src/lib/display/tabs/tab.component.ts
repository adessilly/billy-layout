import { Component, input, signal } from '@angular/core';

/**
 * Panneau d'un onglet. À projeter dans <billy-tabs>.
 * Le contenu reste dans le DOM (masqué via [hidden]) pour préserver l'état
 * des composants enfants et éviter de relancer leurs appels réseau au switch.
 *
 *   <billy-tabs>
 *     <billy-tab label="Encodage" icon="fa-solid fa-user"> … </billy-tab>
 *   </billy-tabs>
 */
@Component({
  selector: 'billy-tab',
  standalone: true,
  template: `
    <div class="app-tab-panel" role="tabpanel" [hidden]="!active()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .app-tab-panel[hidden] { display: none; }
  `],
})
export class TabComponent {
  /** Libellé affiché dans la barre d'onglets. */
  readonly label = input('');
  /** Classe d'icône FontAwesome optionnelle (ex. "fa-solid fa-user"). */
  readonly icon = input('');

  /** Piloté par <billy-tabs> : true quand cet onglet est sélectionné. */
  readonly active = signal(false);
}
