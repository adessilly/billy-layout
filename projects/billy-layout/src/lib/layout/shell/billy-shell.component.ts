import { Component, inject } from '@angular/core';
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

}
