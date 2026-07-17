import { Injectable, effect, signal } from '@angular/core';

const SIDEBAR_COLLAPSED_KEY = 'billy-shell.sidebar-collapsed';

/**
 * État partagé du shell applicatif (topbar + sidebar).
 * L'état replié de la sidebar est persisté dans le localStorage.
 */
@Injectable({ providedIn: 'root' })
export class BillyShellService {

  readonly sidebarCollapsed = signal<boolean>(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');

  /** Sur mobile la sidebar devient un tiroir superposé au contenu. */
  readonly mobileSidebarOpen = signal(false);

  constructor() {
    effect(() => localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(this.sidebarCollapsed())));
  }

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.mobileSidebarOpen.update(open => !open);
    } else {
      this.sidebarCollapsed.update(collapsed => !collapsed);
    }
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

}
