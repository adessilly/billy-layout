import { Component, inject } from '@angular/core';
import { BillyShellService } from './billy-shell.service';
import { BillySidebarComponent } from './billy-sidebar.component';
import { BillyTopbarComponent } from './billy-topbar.component';

/**
 * Coque applicative BILLy : topbar + sidebar repliable + zone de contenu.
 * Le contenu de la page est projeté via <ng-content> (pas de footer).
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
