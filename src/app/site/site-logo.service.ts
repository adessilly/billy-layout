import { Service, computed, signal } from '@angular/core';
import { BillyShellLogo } from 'billy-layout';

/** The three ways to dress the topbar logo, demoed live by the site. */
export type SiteLogoMode = 'default' | 'image' | 'template';

const MODES: SiteLogoMode[] = ['default', 'image', 'template'];

export const SITE_LOGO_LABELS: Record<SiteLogoMode, string> = {
  default: 'Library default (no logo configured)',
  image: 'logo input — image + dark variant',
  template: 'logoTemplate input — custom markup',
};

/**
 * Drives the logo of the site's own <billy-shell> (see app.html): the topbar
 * demo cycles through the modes to show `logo` / `logoTemplate` at work.
 */
@Service()
export class SiteLogoService {

  readonly mode = signal<SiteLogoMode>('default');

  /** Passed to <billy-shell [logo]> — undefined lets the library default win. */
  readonly logo = computed<BillyShellLogo | undefined>(() => this.mode() === 'image'
    ? { src: 'assets/images/logo.svg', alt: 'billy-layout', srcDark: 'assets/images/logo-white.svg' }
    : undefined);

  readonly label = computed(() => SITE_LOGO_LABELS[this.mode()]);

  next(): void {
    this.mode.update(mode => MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }

}
