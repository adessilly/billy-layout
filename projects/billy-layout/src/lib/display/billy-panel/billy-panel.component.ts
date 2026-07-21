import { Component, booleanAttribute, input } from '@angular/core';

/**
 * "Billy" floating panel shell: rounded glass card, soft shadow and
 * opening animation (extracted from the notifications panel, isolated here
 * for reuse). Purely presentational: the `open` state and closing
 * (outside click, escape…) are driven by the calling component.
 *
 *   <billy-panel [open]="open()" heading="My account">…</billy-panel>
 *
 * Anchoring (position, alignment) is left to the parent, which places this
 * component inside a `position: relative` container.
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

  /** Is the panel expanded? */
  readonly open = input(false, { transform: booleanAttribute });

  /** Optional title shown in the header. */
  readonly heading = input<string>();

  /** Optional subtitle (below the title). */
  readonly subheading = input<string>();

}
