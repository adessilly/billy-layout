import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionBarComponent, BillyActionBarTab, BillyDarkModeService, BillyShellService, ToastrService } from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';
import { SiteLogoService } from '../site/site-logo.service';

/** billy-shell : the whole site is the demo — zone diagram + interactions. */
@Component({
  selector: 'demo-shell',
  imports: [DemoStageComponent],
  template: `
    <demo-stage title="You are inside it" description="This site is rendered by <billy-shell>: the topbar, the sidebar and this content area are the shell's three zones." [center]="true">
      <svg viewBox="0 0 360 220" class="shell-map" aria-hidden="true">
        <rect x="8" y="8" width="344" height="204" rx="12" class="sm-frame" />
        <rect x="8" y="8" width="344" height="34" rx="12" class="sm-topbar" />
        <text x="180" y="30" class="sm-label sm-label--light">billy-topbar · slots search / notifications / account</text>
        <rect x="16" y="50" width="70" height="154" rx="8" class="sm-sidebar" />
        <text x="51" y="132" class="sm-label" transform="rotate(-90 51 132)">billy-sidebar</text>
        <rect x="94" y="50" width="250" height="154" rx="8" class="sm-content" />
        <text x="219" y="122" class="sm-label">ng-content · your pages</text>
        <text x="219" y="140" class="sm-label sm-label--muted">(this very page)</text>
      </svg>
      <div class="shell-actions">
        <button type="button" class="demo-btn" (click)="shell.toggleSidebar()">Collapse / expand the sidebar</button>
        <div class="demo-note">The collapsed state is persisted (localStorage <code>billy-shell.sidebar-collapsed</code>).</div>
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

/** billy-topbar : driving dark mode via BillyDarkModeService. */
@Component({
  selector: 'demo-topbar',
  imports: [DemoStageComponent],
  template: `
    <demo-stage title="The topbar is above you" description="Burger, logo, projected search, dark mode, bell and account: all from the lib. The button below calls the same BillyDarkModeService as the topbar's moon icon.">
      <button type="button" class="demo-btn--submit" (click)="darkMode.toggle()">
        Switch to {{ darkMode.darkMode() ? 'light' : 'dark' }} mode
      </button>
      <div class="demo-note">Preference persisted (localStorage <code>billy_dark_mode</code>), carried by <code>body.dark-mode</code>.</div>
    </demo-stage>

    <demo-stage title="The logo is yours" description="Nothing is hard-coded: the image and its alt text come from BILLY_SHELL_CONFIG.logo, from the [logo] input of <billy-shell> / <billy-topbar> ({ src, alt, srcDark }), or from [logoTemplate] for fully custom markup. Configure none of them and the BILLy logo stays in place.">
      <button type="button" class="demo-btn--submit" (click)="siteLogo.next()">Change the logo (top left)</button>
      <div class="demo-note">
        Current: <code>{{ siteLogo.label() }}</code>.
        The <code>image</code> mode also carries a <code>srcDark</code> variant — toggle dark mode to see it swap.
      </div>
    </demo-stage>
  `,
})
export class TopbarDemoComponent {
  readonly darkMode = inject(BillyDarkModeService);
  readonly siteLogo = inject(SiteLogoService);
}

/** billy-sidebar : links, badges and collapsing — configured via BILLY_SHELL_CONFIG. */
@Component({
  selector: 'demo-sidebar',
  imports: [DemoStageComponent],
  template: `
    <demo-stage title="The sidebar is on your left" description="Its sections, links, icons and badges come from the BILLY_SHELL_CONFIG token (menuLinks + menuBadges): here, each category carries its page count as a badge (discreet 'info' variant by default; 'notification' in red for items needing attention).">
      <button type="button" class="demo-btn" (click)="shell.toggleSidebar()">
        {{ shell.sidebarCollapsed() ? 'Expand' : 'Collapse' }} the sidebar
      </button>
      <div class="demo-note">On mobile, it becomes a drawer with a backdrop (same burger button).</div>
    </demo-stage>
  `,
})
export class SidebarDemoComponent {
  readonly shell = inject(BillyShellService);
}

/** billy-notifications : the topbar bell is the living demo. */
@Component({
  selector: 'demo-notifications',
  imports: [DemoStageComponent],
  template: `
    <demo-stage title="The bell, top right" description="This site's bell projects a demo category ('Discover') that extends BillyNotifCategory: counter, two-level navigation and simulated global sync.">
      <div class="notif-cue" aria-hidden="true">
        <span class="notif-cue__label">The bell 🔔<br />is here, at the top</span>
        <svg class="notif-cue__arrow" viewBox="0 0 84 64" width="72" height="55">
          <path d="M6 54 C 30 52, 62 40, 74 12" fill="none" stroke="var(--billy-accent)" stroke-width="2" stroke-linecap="round" stroke-dasharray="0.5 8" class="na-path" />
          <path d="M64 12 L75 7 L74 20" fill="none" stroke="var(--billy-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="demo-note">
        Open the bell 🔔 in the topbar: categories level → list, back button,
        and "Sync now" (delegated to <code>BILLY_SHELL_CONFIG.syncNotifications</code>).
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

/** billy-action-bar : the mobile navigation, staged in a phone frame. */
@Component({
  selector: 'demo-action-bar',
  imports: [ActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage title="Mobile navigation" description="On billy-client, this bar is pinned to the bottom of the screen on mobile. Here, it is staged inside a frame: the tabs are real BillyActionBarTab.">
      <div class="phone">
        <div class="phone-screen">
          <div class="phone-page">
            <div class="phone-line w60"></div>
            <div class="phone-line w90"></div>
            <div class="phone-line w75"></div>
            <div class="phone-hint">Active tab: <strong>{{ active() }}</strong></div>
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

    // The bar is fixed in the lib: re-scope it to the phone frame.
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

  readonly active = signal('Home');

  readonly tabs: BillyActionBarTab[] = [
    { icon: 'home', label: 'Home', isActive: () => this.active() === 'Home', go: () => this.pick('Home') },
    { icon: 'purchases', label: 'Purchases', isActive: () => this.active() === 'Purchases', go: () => this.pick('Purchases') },
    { icon: 'sales', label: 'Sales', isActive: () => this.active() === 'Sales', go: () => this.pick('Sales') },
    { icon: 'clients', label: 'Clients', isActive: () => this.active() === 'Clients', go: () => this.pick('Clients') },
  ];

  private pick(label: string): void {
    this.active.set(label);
    // No real navigation: just ask the bar to recompute the halo.
    this.bar()?.refreshNav(this.router.url);
    this.toastr.info(`Navigating to "${label}" (simulated).`, 'Action-bar');
  }

}
