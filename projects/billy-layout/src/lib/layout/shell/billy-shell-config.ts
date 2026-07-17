import { InjectionToken, Signal } from '@angular/core';
import { BillyIconName } from '../../core/icon/billy-icon.component';

/** Entrée du menu latéral : un heading de section ou un lien routé. */
export interface BillyMenuLink {
  text: string;
  heading?: boolean;
  link?: string;
  icon?: BillyIconName;
}

/**
 * Configuration applicative du shell BILLy (topbar + sidebar + notifications).
 *
 * La librairie ne connaît ni les routes, ni les services métier : tout ce qui
 * en dépend est fourni ici par l'application (billy-client : voir
 * `app.config.ts`). Tous les champs sauf `menuLinks` sont optionnels — sans
 * eux, la fonctionnalité correspondante est simplement inerte.
 */
export interface BillyShellConfig {
  /** Liens du menu latéral (et de leurs sections). */
  menuLinks: BillyMenuLink[];
  /** Version affichée en pied de sidebar. */
  version?: string;
  /** Cible du logo de la topbar (défaut : '/'). */
  homeLink?: string;
  /** Action du bouton « Me déconnecter » de la topbar. */
  logout?: () => void;
  /** Badges du menu, par libellé d'entrée (ex. { Ventes: '3' }). */
  menuBadges?: Signal<Record<string, string | null>>;
  /** Synchronisation globale déclenchée depuis la cloche de notifications. */
  syncNotifications?: () => Promise<unknown>;
}

export const BILLY_SHELL_CONFIG = new InjectionToken<BillyShellConfig>('BILLY_SHELL_CONFIG');
