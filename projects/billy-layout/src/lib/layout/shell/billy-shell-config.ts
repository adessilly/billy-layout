import { InjectionToken, Signal } from '@angular/core';
import { BillyIconName } from '../../core/icon/billy-icon.component';

/** Sidebar menu entry: a section heading or a routed link. */
export interface BillyMenuLink {
  text: string;
  heading?: boolean;
  link?: string;
  icon?: BillyIconName;
}

/**
 * Topbar logo: image URL + accessible text (and an optional dark-mode variant).
 * A bare string is accepted anywhere a `BillyShellLogo` is: it is the `src`.
 */
export interface BillyShellLogo {
  /** Image URL (relative to the host application, or absolute / data URI). */
  src: string;
  /** Alternative text of the image (default: `'BILLy'`). */
  alt?: string;
  /** Variant used while dark mode is active (default: `src`). */
  srcDark?: string;
}

/**
 * Application configuration of the BILLy shell (topbar + sidebar + notifications).
 *
 * The library knows neither the routes nor the business services: everything
 * that depends on them is provided here by the application (billy-client: see
 * `app.config.ts`). All fields except `menuLinks` are optional — without
 * them, the corresponding feature is simply inert.
 */
export interface BillyShellConfig {
  /** Sidebar menu links (and their sections). */
  menuLinks: BillyMenuLink[];
  /** Version displayed at the bottom of the sidebar. */
  version?: string;
  /** Target of the topbar logo (default: '/'). */
  homeLink?: string;
  /** Topbar logo (default: `assets/images/icon-384.png`, alt `BILLy`). */
  logo?: string | BillyShellLogo;
  /** Action of the topbar "Log out" button. */
  logout?: () => void;
  /** Menu badges, by entry label (e.g. { Sales: '3' }). */
  menuBadges?: Signal<Record<string, string | null>>;
  /** Global synchronization triggered from the notification bell. */
  syncNotifications?: () => Promise<unknown>;
}

export const BILLY_SHELL_CONFIG = new InjectionToken<BillyShellConfig>('BILLY_SHELL_CONFIG');
