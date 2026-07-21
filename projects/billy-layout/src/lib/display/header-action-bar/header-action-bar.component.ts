import { Component, input } from '@angular/core';
import { HeaderAction } from './header-action';

@Component({
    selector: 'billy-header-action-bar',
    templateUrl: './header-action-bar.component.html',
    styleUrls: ['./header-action-bar.component.scss']
})
export class HeaderActionBarComponent {

  readonly actions = input<HeaderAction[]>([]);

  get visibleActions(): HeaderAction[] {
    return this.actions().filter(a => !a.hidden);
  }

  /** Neutral actions → grouped in a segmented button group. */
  get groupedActions(): HeaderAction[] {
    return this.visibleActions.filter(a => !a.variant || a.variant === 'default');
  }

  /** Highlighted actions (primary / danger) → standalone pills. */
  get standaloneActions(): HeaderAction[] {
    return this.visibleActions.filter(a => a.variant === 'primary' || a.variant === 'danger');
  }

}
