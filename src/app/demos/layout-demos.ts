import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionBarComponent, BillyActionBarTab, BillyDarkModeService, BillyShellService, ToastrService } from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-shell : le site entier est la démo — schéma des zones + interactions. */
@Component({
  selector: 'demo-shell',
  imports: [DemoStageComponent],
  template: `
    <demo-stage titre="Vous êtes dedans" description="Ce site est rendu par <billy-shell> : la topbar, la sidebar et cette zone de contenu sont les trois zones de la coque." [center]="true">
      <svg viewBox="0 0 360 220" class="shell-map" aria-hidden="true">
        <rect x="8" y="8" width="344" height="204" rx="12" class="sm-frame" />
        <rect x="8" y="8" width="344" height="34" rx="12" class="sm-topbar" />
        <text x="180" y="30" class="sm-label sm-label--light">billy-topbar · slots search / notifications / account</text>
        <rect x="16" y="50" width="70" height="154" rx="8" class="sm-sidebar" />
        <text x="51" y="132" class="sm-label" transform="rotate(-90 51 132)">billy-sidebar</text>
        <rect x="94" y="50" width="250" height="154" rx="8" class="sm-content" />
        <text x="219" y="122" class="sm-label">ng-content · vos pages</text>
        <text x="219" y="140" class="sm-label sm-label--muted">(cette page-ci)</text>
      </svg>
      <div class="shell-actions">
        <button type="button" class="demo-btn" (click)="shell.toggleSidebar()">Replier / déplier la sidebar</button>
        <div class="demo-note">L'état replié est persisté (localStorage <code>billy-shell.sidebar-collapsed</code>).</div>
      </div>
    </demo-stage>
  `,
  styles: `
    .shell-map {
      width: min(420px, 100%);

      .sm-frame { fill: none; stroke: var(--billy-surface-border); stroke-width: 1.5; }
      .sm-topbar { fill: var(--billy-accent); opacity: .9; }
      .sm-sidebar { fill: var(--billy-accent-soft); stroke: var(--billy-accent-border); }
      .sm-content { fill: var(--billy-section-bg); stroke: var(--billy-surface-border); stroke-dasharray: 4 4; }

      .sm-label {
        font-size: 10px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        fill: var(--billy-text-soft);
        text-anchor: middle;

        &--light { fill: #fff; font-size: 9px; }
        &--muted { fill: var(--billy-text-muted); font-size: 9px; }
      }
    }

    .shell-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
  `,
})
export class ShellDemoComponent {
  readonly shell = inject(BillyShellService);
}

/** billy-topbar : pilotage du mode sombre via BillyDarkModeService. */
@Component({
  selector: 'demo-topbar',
  imports: [DemoStageComponent],
  template: `
    <demo-stage titre="La topbar est au-dessus de vous" description="Burger, logo, recherche projetée, dark mode, cloche et compte : tout vient de la lib. Le bouton ci-dessous appelle le même BillyDarkModeService que l'icône lune de la topbar.">
      <button type="button" class="demo-btn--submit" (click)="darkMode.toggle()">
        Basculer le mode {{ darkMode.darkMode() ? 'clair' : 'sombre' }}
      </button>
      <div class="demo-note">Préférence persistée (localStorage <code>billy_dark_mode</code>), portée par <code>body.dark-mode</code>.</div>
    </demo-stage>
  `,
})
export class TopbarDemoComponent {
  readonly darkMode = inject(BillyDarkModeService);
}

/** billy-sidebar : liens, badges et repli — configurés par BILLY_SHELL_CONFIG. */
@Component({
  selector: 'demo-sidebar',
  imports: [DemoStageComponent],
  template: `
    <demo-stage titre="La sidebar est à votre gauche" description="Ses sections, liens, icônes et badges viennent du token BILLY_SHELL_CONFIG (menuLinks + menuBadges) : ici, chaque catégorie porte en badge son nombre de fiches (variante 'info' discrète par défaut ; 'notification' en rouge pour les éléments à traiter).">
      <button type="button" class="demo-btn" (click)="shell.toggleSidebar()">
        {{ shell.sidebarCollapsed() ? 'Déplier' : 'Replier' }} la sidebar
      </button>
      <div class="demo-note">Sur mobile, elle devient un tiroir avec backdrop (même bouton burger).</div>
    </demo-stage>
  `,
})
export class SidebarDemoComponent {
  readonly shell = inject(BillyShellService);
}

/** billy-notifications : la cloche de la topbar est la démo vivante. */
@Component({
  selector: 'demo-notifications',
  imports: [DemoStageComponent],
  template: `
    <demo-stage titre="La cloche, en haut à droite" description="La cloche de ce site projette une catégorie de démonstration (« À découvrir ») qui étend BillyNotifCategory : compteur, navigation à deux niveaux et synchro globale simulée.">
      <div class="notif-cue" aria-hidden="true">
        <span class="notif-cue__label">La cloche 🔔<br />est ici, en haut</span>
        <svg class="notif-cue__arrow" viewBox="0 0 84 64" width="72" height="55">
          <path d="M6 54 C 30 52, 62 40, 74 12" fill="none" stroke="var(--billy-accent)" stroke-width="2" stroke-linecap="round" stroke-dasharray="0.5 8" class="na-path" />
          <path d="M64 12 L75 7 L74 20" fill="none" stroke="var(--billy-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="demo-note">
        Ouvrez la cloche 🔔 dans la topbar : niveau catégories → liste, bouton retour,
        et « Synchroniser maintenant » (délégué à <code>BILLY_SHELL_CONFIG.syncNotifications</code>).
      </div>
    </demo-stage>
  `,
  styles: `
    .notif-cue {
      position: absolute;
      top: 16px;
      right: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }

    .notif-cue__label {
      text-align: right;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.35;
      color: var(--billy-accent);
      white-space: nowrap;
    }

    .notif-cue__arrow { display: block; }

    .na-path {
      stroke-dashoffset: 0;
      animation: naDash 1.4s linear infinite;
    }

    @keyframes naDash {
      from { stroke-dashoffset: 17; }
      to { stroke-dashoffset: 0; }
    }
  `,
})
export class NotificationsDemoComponent {}

/** billy-action-bar : la navigation mobile, présentée dans un cadre téléphone. */
@Component({
  selector: 'demo-action-bar',
  imports: [ActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Navigation mobile" description="Sur billy-client, cette barre est fixée en bas d'écran sur mobile. Ici, elle est mise en scène dans un cadre : les onglets sont de vrais BillyActionBarTab.">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-page">
            <div class="phone-line w60"></div>
            <div class="phone-line w90"></div>
            <div class="phone-line w75"></div>
            <div class="phone-hint">Onglet actif : <strong>{{ active() }}</strong></div>
          </div>
          <billy-action-bar class="phone-bar" [tabs]="tabs" />
        </div>
      </div>
    </demo-stage>
  `,
  styles: `
    .phone {
      width: 300px;
      border: 10px solid #1f2937;
      border-radius: 34px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(17, 24, 39, .25);
      background: var(--site-page-bg);
    }

    .phone-screen {
      position: relative;
      height: 360px;
      display: flex;
      flex-direction: column;
    }

    .phone-page {
      flex: 1;
      padding: 26px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .phone-line {
      height: 12px;
      border-radius: 6px;
      background: var(--billy-divider);

      &.w60 { width: 60%; }
      &.w90 { width: 90%; }
      &.w75 { width: 75%; }
    }

    .phone-hint {
      margin-top: auto;
      font-size: 12px;
      color: var(--billy-text-soft);
      text-align: center;
    }

    // La barre est fixed dans la lib : on la re-scope au cadre du téléphone.
    .phone-bar ::ng-deep .action-bar {
      position: absolute;
      left: 50%;
      right: auto;
      top: auto;
    }
  `,
})
export class ActionBarDemoComponent {

  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly bar = viewChild(ActionBarComponent);

  readonly active = signal('Accueil');

  readonly tabs: BillyActionBarTab[] = [
    { icon: 'accueil', label: 'Accueil', isActive: () => this.active() === 'Accueil', go: () => this.pick('Accueil') },
    { icon: 'achats', label: 'Achats', isActive: () => this.active() === 'Achats', go: () => this.pick('Achats') },
    { icon: 'ventes', label: 'Ventes', isActive: () => this.active() === 'Ventes', go: () => this.pick('Ventes') },
    { icon: 'clients', label: 'Clients', isActive: () => this.active() === 'Clients', go: () => this.pick('Clients') },
  ];

  private pick(label: string): void {
    this.active.set(label);
    // Pas de navigation réelle : on redemande à la barre de recalculer le halo.
    this.bar()?.refreshNav(this.router.url);
    this.toastr.info(`Navigation vers « ${label} » (simulée).`, 'Action-bar');
  }

}
