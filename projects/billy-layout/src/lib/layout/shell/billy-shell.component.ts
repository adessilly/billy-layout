import { Component, TemplateRef, inject, input } from '@angular/core';
import { BillyShellLogo } from './billy-shell-config';
import { BillyShellService } from './billy-shell.service';
import { BillySidebarComponent } from './billy-sidebar.component';
import { BillyTopbarComponent } from './billy-topbar.component';

/**
 * BILLy application shell: topbar + collapsible sidebar + content area.
 * The page content is projected via <ng-content> (no footer).
 */
@Component({
  selector: 'billy-shell',
  templateUrl: './billy-shell.component.html',
  styleUrls: ['./billy-shell.component.scss'],
  imports: [BillyTopbarComponent, BillySidebarComponent],
})
export class BillyShellComponent {

  readonly shell = inject(BillyShellService);

  /** Topbar logo — forwarded to `billy-topbar` (see BillyTopbarComponent.logo). */
  readonly logo = input<string | BillyShellLogo>();

  /** Custom logo markup — forwarded to `billy-topbar`. */
  readonly logoTemplate = input<TemplateRef<unknown>>();

}
