import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BillyIconComponent } from '../../core/icon/billy-icon.component';
import { BILLY_SHELL_CONFIG } from './billy-shell-config';
import { BillyDarkModeService } from './billy-dark-mode.service';
import { BillyShellService } from './billy-shell.service';

/**
 * Barre supérieure du shell. Les zones métier (recherche globale, cloche de
 * notifications, menu du compte) sont projetées par l'application via les
 * slots `[shell-search]`, `[shell-notifications]` et `[shell-account]`
 * (transmis par billy-shell).
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
