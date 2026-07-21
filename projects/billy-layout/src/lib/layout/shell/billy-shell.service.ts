import { Injectable, effect, signal } from '@angular/core';

const SIDEBAR_COLLAPSED_KEY = 'billy-shell.sidebar-collapsed';

/**
 * Shared state of the application shell (topbar + sidebar).
 * The collapsed state of the sidebar is persisted in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class BillyShellService {

  readonly sidebarCollapsed = signal<boolean>(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');

  /** On mobile the sidebar becomes a drawer overlaid on the content. */
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
