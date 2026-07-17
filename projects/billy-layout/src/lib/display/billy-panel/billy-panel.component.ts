import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Coque de panneau flottant « Billy » : carte glass arrondie, ombre douce et
 * animation d'ouverture (issue du panneau de notifications, ici isolée pour
 * être réutilisable). Purement présentationnel : l'état `open` et la fermeture
 * (clic extérieur, échap…) sont pilotés par le composant appelant.
 *
 *   <billy-panel [open]="open()" heading="Mon compte">…</billy-panel>
 *
 * L'ancrage (position, alignement) est laissé au parent, qui place ce composant
 * dans un conteneur `position: relative`.
 */
@Component({
  selector: 'billy-panel',
  template: `
    <div class="billy-panel" [class.open]="open()">
      @if (heading()) {
        <div class="billy-panel-header">
          <span class="billy-panel-title">{{ heading() }}</span>
          @if (subheading()) {
            <span class="billy-panel-sub">{{ subheading() }}</span>
          }
        </div>
      }
      <div class="billy-panel-body">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './billy-panel.component.scss',
})
export class BillyPanelComponent {

  /** Le panneau est-il déployé ? */
  readonly open = input(false, { transform: booleanAttribute });

  /** Titre optionnel affiché dans l'entête. */
  readonly heading = input<string>();

  /** Sous-titre optionnel (sous le titre). */
  readonly subheading = input<string>();

}
