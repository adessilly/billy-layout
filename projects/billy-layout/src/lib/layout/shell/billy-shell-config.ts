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
  /** Action of the topbar "Log out" button. */
  logout?: () => void;
  /** Menu badges, by entry label (e.g. { Sales: '3' }). */
  menuBadges?: Signal<Record<string, string | null>>;
  /** Global synchronization triggered from the notification bell. */
  syncNotifications?: () => Promise<unknown>;
}

export const BILLY_SHELL_CONFIG = new InjectionToken<BillyShellConfig>('BILLY_SHELL_CONFIG');
