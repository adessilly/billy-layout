import { Component, input, signal } from '@angular/core';

/**
 * Tab panel. To be projected into <billy-tabs>.
 * The content stays in the DOM (hidden via [hidden]) to preserve the state
 * of child components and avoid re-triggering their network calls on switch.
 *
 *   <billy-tabs>
 *     <billy-tab label="Entry" icon="fa-solid fa-user"> … </billy-tab>
 *   </billy-tabs>
 */
@Component({
  selector: 'billy-tab',
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
  /** Label shown in the tab bar. */
  readonly label = input('');
  /** Optional FontAwesome icon class (e.g. "fa-solid fa-user"). */
  readonly icon = input('');

  /** Driven by <billy-tabs>: true when this tab is selected. */
  readonly active = signal(false);
}
