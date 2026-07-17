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
import { EmptyStateType, FilterToggleButtonsComponent } from 'billy-layout';

/** ToastrService : les quatre humeurs, empilées et minutées en CSS. */
@Component({
  selector: 'demo-toastr',
  imports: [DemoStageComponent],
  template: `
    <demo-stage titre="Pousser un toast" description="ToastrService.success / info / warning / error — minuteur en animation CSS, pile plafonnée, pilule compacte sur mobile.">
      <div class="toastr-row">
        <button type="button" class="demo-btn--submit" (click)="toastr.success('La facture 2026-042 est envoyée.', 'Envoyé')">success</button>
        <button type="button" class="demo-btn" (click)="toastr.info('3 achats attendent votre validation.')">info</button>
        <button type="button" class="demo-btn" (click)="toastr.warning('Le n° de TVA du client semble invalide.')">warning</button>
        <button type="button" class="demo-btn--destructive" (click)="toastr.error('L’envoi Peppol a échoué, réessayez.', 'Erreur')">error</button>
      </div>
      <div class="demo-note">Les toasts apparaissent en haut à droite (billy-toastr-list-panel, monté à la racine du site).</div>
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

/** billy-snackbar : le bandeau global « nouvelle version ». */
@Component({
  selector: 'demo-snackbar',
  imports: [SnackbarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Le bandeau de mise à jour" description="Un seul usage dans BILLy : signaler une nouvelle version du front, avec bouton d'action et croix pour ignorer.">
      <button type="button" class="demo-btn--submit" (click)="visible.set(true)">Simuler une nouvelle version</button>
      <billy-snackbar
        message="Nouvelle version disponible."
        buttonLabel="Mettre à jour"
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
    this.toastr.success('Le site serait rechargé avec la nouvelle version.', 'Mise à jour');
  }

}

/** billy-loading : l'overlay de chargement d'une zone. */
@Component({
  selector: 'demo-app-loading',
  imports: [AppLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Recouvrir une zone en chargement" description="Le parent doit être en position: relative ; l'overlay recouvre toute sa surface tant que loading est vrai.">
      <div class="al-card">
        <div class="al-line w70"></div>
        <div class="al-line w90"></div>
        <div class="al-line w50"></div>
        <billy-loading [loading]="loading()" />
      </div>
      <button type="button" class="demo-btn--submit" (click)="reload()">Recharger la zone (2 s)</button>
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

/** billy-checkmark + billy-checkmark-failed + billy-checkmark-loading : la coche animée. */
@Component({
  selector: 'demo-checkmark',
  imports: [CheckmarkComponent, CheckmarkFailedComponent, CheckmarkLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage titre="La coche de succès et la croix d'échec" description="La coche verte, la croix rouge (avec son shake d'erreur) et le spinner partagent la même géométrie.">
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
        <button type="button" class="demo-btn" (click)="replay()">Rejouer</button>
      </div>
    </demo-stage>

    <demo-stage titre="Du chargement au succès ou à l'échec" description="Les composants partagent la même géométrie : superposé, le spinner s'estompe pendant que la coche ou la croix se dessine par-dessus, sans rupture visuelle.">
      <div class="cm-row">
        <div class="cm-block">
          <div class="cm-stack">
            <billy-checkmark-loading class="cm-layer" [class.cm-layer--hidden]="state() === 'done'" />
            @if (state() === 'done') {
              <billy-checkmark class="cm-layer" />
            }
          </div>
          <span class="demo-note">→ succès</span>
        </div>
        <div class="cm-block">
          <div class="cm-stack">
            <billy-checkmark-loading class="cm-layer" [class.cm-layer--hidden]="state() === 'done'" />
            @if (state() === 'done') {
              <billy-checkmark-failed class="cm-layer" />
            }
          </div>
          <span class="demo-note">→ échec</span>
        </div>
      </div>
      <div class="cm-actions">
        <button type="button" class="demo-btn" (click)="run()">Relancer</button>
      </div>
    </demo-stage>

    <demo-stage titre="Couleurs du design system" description="L'input color accepte success, accent, danger, warning et info — appliqué à la coche, à la croix et au spinner. Défauts : success pour la coche et le spinner, danger pour la croix.">
      <div class="cm-colors" role="group" aria-label="Choix de la couleur">
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

  /** Démo superposition : le spinner laisse place à la coche ou à la croix. */
  readonly state = signal<'loading' | 'done'>('loading');
  private stateTimer?: ReturnType<typeof setTimeout>;

  /** Démo couleurs. */
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

  setColor(couleur: CheckmarkColor): void {
    this.color.set(couleur);
    this.colorPlayed.set(false);
    setTimeout(() => this.colorPlayed.set(true), 50);
  }

}

/** billy-circular-loading : anneau de progression déterminé. */
@Component({
  selector: 'demo-circular-loading',
  imports: [FormsModule, CircularLoadingComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Une progression déterminée" description="L'anneau suit [percent] — glissez pour le piloter.">
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

/** billy-empty-state : les 7 illustrations d'états vides. */
@Component({
  selector: 'demo-empty-state',
  imports: [EmptyStateComponent, FilterToggleButtonsComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Les états vides illustrés" description="Un type par concept métier + le type 'recherche' (sans CTA) pour les filtrages sans résultat." [center]="false">
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

  readonly type = signal<EmptyStateType>('vente');
  readonly visible = signal(true);

  readonly options = [
    { value: 'vente', label: 'vente' },
    { value: 'achat', label: 'achat' },
    { value: 'devis', label: 'devis' },
    { value: 'client', label: 'client' },
    { value: 'recherche', label: 'recherche' },
  ];

  pick(value: string | null): void {
    if (!value) { return; }
    // Re-monte le composant pour rejouer l'animation d'entrée de l'illustration.
    this.visible.set(false);
    this.type.set(value as EmptyStateType);
    setTimeout(() => this.visible.set(true), 30);
  }

  created(): void {
    this.toastr.info('Le CTA relaie l’action primary du header (cf. guidelines §2).', 'CTA');
  }

}
