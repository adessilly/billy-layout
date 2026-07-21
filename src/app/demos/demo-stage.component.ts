import { Component, input } from '@angular/core';

/**
 * Demo stage: a dotted-background card that puts the component in
 * context, with a heading and an optional controls area
 * (slot [stage-controls]).
 */
@Component({
  selector: 'demo-stage',
  template: `
    <section class="stage">
      <header class="stage-head">
        <div class="stage-titles">
          <h3 class="stage-title">{{ title() }}</h3>
          @if (description()) {
            <p class="stage-sub">{{ description() }}</p>
          }
        </div>
        <div class="stage-controls">
          <ng-content select="[stage-controls]" />
        </div>
      </header>
      <div class="stage-canvas" [class.stage-canvas--center]="center()">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .stage {
      background: var(--site-card-bg);
      border: 1px solid var(--billy-surface-border);
      border-radius: 16px;
      box-shadow: var(--billy-card-shadow);
      margin-bottom: 16px;
    }

    .stage-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 16px 22px;
      border-bottom: 1px solid var(--billy-divider);
    }

    .stage-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--site-heading);
      margin: 0;
    }

    .stage-sub {
      font-size: 12.5px;
      color: var(--billy-text-soft);
      margin: 3px 0 0;
    }

    .stage-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .stage-canvas {
      position: relative;
      padding: 30px;
      background-image: radial-gradient(var(--billy-divider) 1px, transparent 1px);
      background-size: 18px 18px;
      border-radius: 0 0 16px 16px;
    }

    .stage-canvas--center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
      min-height: 160px;
    }
  `,
})
export class DemoStageComponent {

  readonly title = input.required<string>();
  readonly description = input('');
  /** Centers the stage content ("object" components vs full layouts). */
  readonly center = input(true);

}
