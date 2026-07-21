import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BillyNotificationsComponent, BillyShellComponent, ToastrListPanelComponent } from 'billy-layout';
import { DocSearchComponent } from './site/doc-search.component';
import { NotifWhatsNewComponent } from './site/notif-whats-new.component';
import { AccountMenuComponent } from './site/account-menu.component';

/**
 * Root of the showcase site: the site is itself dressed by the library's
 * shell (topbar + sidebar + notifications) — the best possible demo.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BillyShellComponent,
    BillyNotificationsComponent,
    ToastrListPanelComponent,
    DocSearchComponent,
    NotifWhatsNewComponent,
    AccountMenuComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
