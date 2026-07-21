import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BillyIconComponent } from '../../core/icon/billy-icon.component';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { BILLY_SHELL_CONFIG } from './billy-shell-config';
import { BillyDarkModeService } from './billy-dark-mode.service';
import { BillyShellService } from './billy-shell.service';

/**
 * Top bar of the shell. The business areas (global search, notification
 * bell, account menu) are projected by the application via the
 * `[shell-search]`, `[shell-notifications]` and `[shell-account]` slots
 * (forwarded by billy-shell).
 */
@Component({
  selector: 'billy-topbar',
  templateUrl: './billy-topbar.component.html',
  styleUrls: ['./billy-topbar.component.scss'],
  imports: [
    RouterLink,
    BillyIconComponent
],
})
export class BillyTopbarComponent implements OnInit {

  protected readonly i18n = inject(BillyI18nService);
  readonly shell = inject(BillyShellService);
  readonly theme = inject(BillyDarkModeService);
  private readonly config = inject(BILLY_SHELL_CONFIG, { optional: true });

  readonly homeLink = this.config?.homeLink ?? '/';

  ngOnInit(): void {
    this.theme.init();
  }

  toggleDarkMode(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.config?.logout?.();
  }

}
