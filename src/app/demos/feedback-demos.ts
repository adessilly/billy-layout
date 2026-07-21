import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AppLoadingComponent,
  CheckmarkColor,
  CheckmarkComponent,
  CheckmarkFailedComponent,
  CheckmarkLoadingComponent,
  CircularLoadingComponent,
  EmptyStateComponent,
  SnackbarComponent,
  ToastrService,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';
import { DemoLocaleToggleComponent } from './demo-locale-toggle.component';
import { EmptyStateType, FilterToggleButtonsComponent } from 'billy-layout';

/** ToastrService : the four moods, stacked and timed in CSS. */
@Component({
  selector: 'demo-toastr',
  imports: [DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Push a toast" description="ToastrService.success / info / warning / error — CSS-animated timer, capped stack, compact pill on mobile.">
      <demo-locale-toggle stage-controls />
      <div class="toastr-row">
        <button type="button" class="demo-btn--submit" (click)="toastr.success('Invoice 2026-042 has been sent.', 'Sent')">success</button>
        <button type="button" class="demo-btn" (click)="toastr.info('3 purchases are awaiting your validation.')">info</button>
        <button type="button" class="demo-btn" (click)="toastr.warning('The client VAT number looks invalid.')">warning</button>
        <button type="button" class="demo-btn--destructive" (click)="toastr.error('The Peppol delivery failed, please retry.')">error</button>
      </div>
      <div class="demo-note">Toasts appear at the top right (billy-toastr-list-panel, mounted at the site root).</div>
    </demo-stage>
  `,
  styles: `
    .toastr-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
  `,
})
export class ToastrDemoComponent {
  readonly toastr = inject(ToastrService);
}

/** billy-snackbar : the global "new version" banner. */
@Component({
  selector: 'demo-snackbar',
  imports: [SnackbarComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="The update banner" description="A single use in BILLy: announcing a new front-end version, with an action button and a cross to dismiss.">
      <demo-locale-toggle stage-controls />
      <button type="button" class="demo-btn--submit" (click)="visible.set(true)">Simulate a new version</button>
      <billy-snackbar
        [(visible)]="visible"
        (buttonClick)="update()" />
    </demo-stage>
  `,
})
export class SnackbarDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly visible = signal(false);

  update(): void {
    this.visible.set(false);
    this.toastr.success('The site would reload with the new version.', 'Update');
  }

}

/** billy-loading : the loading overlay for an area. */
@Component({
  selector: 'demo-app-loading',
  imports: [AppLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage title="Cover a loading area" description="The parent must be position: relative; the overlay covers its whole surface while loading is true.">
      <div class="al-card">
        <div class="al-line w70"></div>
        <div class="al-line w90"></div>
        <div class="al-line w50"></div>
        <billy-loading [loading]="loading()" />
      </div>
      <button type="button" class="demo-btn--submit" (click)="reload()">Reload the area (2 s)</button>
    </demo-stage>
  `,
  styles: `
    .al-card {
      position: relative;
      width: 280px;
      min-height: 120px;
      padding: 20px;
      border-radius: 12px;
      background: var(--site-card-bg);
      border: 1px solid var(--billy-surface-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .al-line {
      height: 12px;
      border-radius: 6px;
      background: var(--billy-divider);

      &.w70 { width: 70%; }
      &.w90 { width: 90%; }
      &.w50 { width: 50%; }
    }
  `,
})
export class AppLoadingDemoComponent {

  readonly loading = signal(false);

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 2000);
  }

}

/** billy-checkmark + billy-checkmark-failed + billy-checkmark-loading : the animated check. */
@Component({
  selector: 'demo-checkmark',
  imports: [CheckmarkComponent, CheckmarkFailedComponent, CheckmarkLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage title="The success check and the failure cross" description="The green check, the red cross (with its error shake) and the spinner share the same geometry.">
      <div class="cm-row">
        <div class="cm-block">
          @if (played()) {
            <billy-checkmark />
          }
          <span class="demo-note">billy-checkmark</span>
        </div>
        <div class="cm-block">
          @if (played()) {
            <billy-checkmark-failed />
          }
          <span class="demo-note">billy-checkmark-failed</span>
        </div>
        <div class="cm-block">
          <billy-checkmark-loading />
          <span class="demo-note">billy-checkmark-loading</span>
        </div>
      </div>
      <div class="cm-actions">
        <button type="button" class="demo-btn" (click)="replay()">Replay</button>
      </div>
    </demo-stage>

    <demo-stage title="From loading to success or failure" description="The components share the same geometry: layered, the spinner fades out while the check or the cross draws itself on top, with no visual break.">
      <div class="cm-row">
        <div class="cm-block">
          <div class="cm-stack">
            <billy-checkmark-loading class="cm-layer" [class.cm-layer--hidden]="state() === 'done'" />
            @if (state() === 'done') {
              <billy-checkmark class="cm-layer" />
            }
          </div>
          <span class="demo-note">→ success</span>
        </div>
        <div class="cm-block">
          <div class="cm-stack">
            <billy-checkmark-loading class="cm-layer" [class.cm-layer--hidden]="state() === 'done'" />
            @if (state() === 'done') {
              <billy-checkmark-failed class="cm-layer" />
            }
          </div>
          <span class="demo-note">→ failure</span>
        </div>
      </div>
      <div class="cm-actions">
        <button type="button" class="demo-btn" (click)="run()">Run again</button>
      </div>
    </demo-stage>

    <demo-stage title="Design system colors" description="The color input accepts success, accent, danger, warning and info — applied to the check, the cross and the spinner. Defaults: success for the check and the spinner, danger for the cross.">
      <div class="cm-colors" role="group" aria-label="Color choice">
        @for (c of colors; track c) {
          <button
            type="button"
            class="demo-btn"
            [class.demo-btn--submit]="color() === c"
            [attr.aria-pressed]="color() === c"
            (click)="setColor(c)"
          >{{ c }}</button>
        }
      </div>
      <div class="cm-row cm-row--tight">
        <div class="cm-block cm-block--small">
          @if (colorPlayed()) {
            <billy-checkmark [color]="color()" />
          }
        </div>
        <div class="cm-block cm-block--small">
          @if (colorPlayed()) {
            <billy-checkmark-failed [color]="color()" />
          }
        </div>
        <div class="cm-block cm-block--small">
          <billy-checkmark-loading [color]="color()" />
        </div>
      </div>
    </demo-stage>
  `,
  styles: `
    .cm-row {
      display: flex;
      gap: 48px;
      align-items: flex-start;

      &.cm-row--tight { gap: 32px; }
    }

    .cm-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      min-width: 120px;
      min-height: 90px;
      justify-content: flex-end;

      &.cm-block--small {
        min-width: 96px;
        min-height: 96px;
        --billy-checkmark-size: 96px;
      }
    }

    .cm-stack {
      display: grid;
      place-items: center;

      .cm-layer {
        grid-area: 1 / 1;
        transition: opacity 0.4s ease-out;
      }

      .cm-layer--hidden {
        opacity: 0;
      }
    }

    .cm-colors {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 24px;
    }

    .cm-actions {
      display: flex;
      justify-content: center;
      margin-top: 18px;
    }
  `,
})
export class CheckmarkDemoComponent {

  readonly played = signal(true);

  /** Layering demo: the spinner gives way to the check or the cross. */
  readonly state = signal<'loading' | 'done'>('loading');
  private stateTimer?: ReturnType<typeof setTimeout>;

  /** Colors demo. */
  readonly colors: CheckmarkColor[] = ['success', 'accent', 'danger', 'warning', 'info'];
  readonly color = signal<CheckmarkColor>('success');
  readonly colorPlayed = signal(true);

  constructor() {
    this.run();
  }

  replay(): void {
    this.played.set(false);
    setTimeout(() => this.played.set(true), 50);
  }

  run(): void {
    clearTimeout(this.stateTimer);
    this.state.set('loading');
    this.stateTimer = setTimeout(() => this.state.set('done'), 2000);
  }

  setColor(color: CheckmarkColor): void {
    this.color.set(color);
    this.colorPlayed.set(false);
    setTimeout(() => this.colorPlayed.set(true), 50);
  }

}

/** billy-circular-loading : determinate progress ring. */
@Component({
  selector: 'demo-circular-loading',
  imports: [FormsModule, CircularLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage title="A determinate progress" description="The ring follows [percent] — drag to drive it.">
      <div class="cl-col">
        <billy-circular-loading [percent]="percent()" />
        <label class="cl-slider">
          <input type="range" min="0" max="100" [ngModel]="percent()" (ngModelChange)="percent.set($event)" />
          <span>{{ percent() }} %</span>
        </label>
      </div>
    </demo-stage>
  `,
  styles: `
    .cl-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }

    .cl-slider {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--billy-text-soft);

      input { accent-color: var(--billy-accent); width: 180px; }
    }
  `,
})
export class CircularLoadingDemoComponent {
  readonly percent = signal(65);
}

/** billy-empty-state : the 7 empty-state illustrations. */
@Component({
  selector: 'demo-empty-state',
  imports: [EmptyStateComponent, FilterToggleButtonsComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="The illustrated empty states" description="One type per business concept + the 'search' type (no CTA) for filterings with no result." [center]="false">
      <demo-locale-toggle stage-controls />
      <div stage-controls>
        <billy-filter-toggle-buttons [options]="options" [value]="type()" (valueChange)="pick($event)" />
      </div>
      <div class="es-stage">
        @if (visible()) {
          <billy-empty-state [type]="type()" (createClicked)="created()" />
        }
      </div>
    </demo-stage>
  `,
  styles: `
    .es-stage {
      display: flex;
      justify-content: center;
      min-height: 260px;
    }
  `,
})
export class EmptyStateDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly type = signal<EmptyStateType>('sale');
  readonly visible = signal(true);

  readonly options = [
    { value: 'sale', label: 'sale' },
    { value: 'purchase', label: 'purchase' },
    { value: 'quote', label: 'quote' },
    { value: 'client', label: 'client' },
    { value: 'search', label: 'search' },
  ];

  pick(value: string | null): void {
    if (!value) { return; }
    // Remount the component to replay the illustration's entrance animation.
    this.visible.set(false);
    this.type.set(value as EmptyStateType);
    setTimeout(() => this.visible.set(true), 30);
  }

  created(): void {
    this.toastr.info('The CTA relays the header primary action (see guidelines §2).', 'CTA');
  }

}
