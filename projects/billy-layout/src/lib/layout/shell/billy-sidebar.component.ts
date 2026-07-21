import { Component, computed, inject } from '@angular/core';
import { BILLY_SHELL_CONFIG } from './billy-shell-config';
import { BillyNavItemComponent } from './billy-nav-item.component';
import { BillyShellService } from './billy-shell.service';

@Component({
  selector: 'billy-sidebar',
  templateUrl: './billy-sidebar.component.html',
  styleUrls: ['./billy-sidebar.component.scss'],
  imports: [BillyNavItemComponent],
})
export class BillySidebarComponent {

  readonly shell = inject(BillyShellService);
  private readonly config = inject(BILLY_SHELL_CONFIG, { optional: true });

  /** Links, version and badges provided by the application (BILLY_SHELL_CONFIG). */
  readonly links = this.config?.menuLinks ?? [];
  readonly version = this.config?.version ?? '';

  /** Badges by menu label (e.g. Peppol submissions in progress on "Sales"). */
  readonly badges = computed<Record<string, string | null>>(() =>
    this.config?.menuBadges?.() ?? {});

}
