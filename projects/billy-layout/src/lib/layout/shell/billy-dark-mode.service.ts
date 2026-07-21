import { Injectable, signal } from '@angular/core';

/**
 * Dark theme of the shell: localStorage persistence + `dark-mode` class on
 * the <body> (the application's global stylesheets hook into it).
 *
 * The localStorage key reuses the legacy app's one (`billy_dark_mode`,
 * ex-LocalService): users' existing preferences are still read.
 */
@Injectable({ providedIn: 'root' })
export class BillyDarkModeService {

  private static readonly STORAGE_KEY = 'billy_dark_mode';

  readonly darkMode = signal(localStorage.getItem(BillyDarkModeService.STORAGE_KEY) === 'true');

  /** Applies the persisted preference to the <body> (called by the topbar). */
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
