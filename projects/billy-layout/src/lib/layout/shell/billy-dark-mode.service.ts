import { Injectable, signal } from '@angular/core';

/**
 * Thème sombre du shell : persistance localStorage + classe `dark-mode` sur
 * le <body> (les feuilles globales de l'application s'y accrochent).
 *
 * La clé localStorage reprend celle de l'app historique (`billy_dark_mode`,
 * ex-LocalService) : les préférences existantes des utilisateurs restent lues.
 */
@Injectable({ providedIn: 'root' })
export class BillyDarkModeService {

  private static readonly STORAGE_KEY = 'billy_dark_mode';

  readonly darkMode = signal(localStorage.getItem(BillyDarkModeService.STORAGE_KEY) === 'true');

  /** Applique la préférence persistée au <body> (appelé par la topbar). */
  init(): void {
    this.applyBodyClass();
  }

  toggle(): void {
    this.darkMode.update(darkMode => !darkMode);
    localStorage.setItem(BillyDarkModeService.STORAGE_KEY, this.darkMode() + '');
    this.applyBodyClass();
  }

  private applyBodyClass(): void {
    document.body.classList.toggle('dark-mode', this.darkMode());
  }

}
