import { Component, OnInit, TemplateRef, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BillyIconComponent } from '../../core/icon/billy-icon.component';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { BILLY_SHELL_CONFIG, BillyShellLogo } from './billy-shell-config';
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
    NgTemplateOutlet,
    BillyIconComponent
],
})
export class BillyTopbarComponent implements OnInit {

  /** Default logo, kept for applications that configure nothing. */
  private static readonly DEFAULT_LOGO: Required<Pick<BillyShellLogo, 'src' | 'alt'>> = {
    src: 'assets/images/icon-384.png',
    alt: 'BILLy',
  };

  protected readonly i18n = inject(BillyI18nService);
  readonly shell = inject(BillyShellService);
  readonly theme = inject(BillyDarkModeService);
  private readonly config = inject(BILLY_SHELL_CONFIG, { optional: true });

  /**
   * Logo of the bar: an image URL or a `{ src, alt, srcDark }` descriptor.
   * Falls back to `BILLY_SHELL_CONFIG.logo`, then to the BILLy logo.
   */
  readonly logo = input<string | BillyShellLogo>();

  /** Fully custom logo markup (inline SVG, wordmark…) — wins over `logo`. */
  readonly logoTemplate = input<TemplateRef<unknown>>();

  readonly homeLink = this.config?.homeLink ?? '/';

  private readonly resolvedLogo = computed<BillyShellLogo>(() => {
    const logo = this.logo() ?? this.config?.logo;
    const descriptor = typeof logo === 'string' ? { src: logo } : logo;
    return {
      src: descriptor?.src || BillyTopbarComponent.DEFAULT_LOGO.src,
      alt: descriptor?.alt ?? BillyTopbarComponent.DEFAULT_LOGO.alt,
      srcDark: descriptor?.srcDark,
    };
  });

  /** Dark variant while `body.dark-mode` is on, otherwise the standard one. */
  protected readonly logoSrc = computed(() => {
    const { src, srcDark } = this.resolvedLogo();
    return (this.theme.darkMode() && srcDark) || src;
  });

  protected readonly logoAlt = computed(() => this.resolvedLogo().alt ?? '');

  /** An application logo drops the BILLy branding (square, radius, shadow). */
  protected readonly hasCustomLogo = computed(() => !!(this.logo() ?? this.config?.logo));

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
