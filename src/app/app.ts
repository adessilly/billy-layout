import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BillyNotificationsComponent, BillyShellComponent, ToastrListPanelComponent } from 'billy-layout';
import { DocSearchComponent } from './site/doc-search.component';
import { NotifNouveautesComponent } from './site/notif-nouveautes.component';
import { AccountMenuComponent } from './site/account-menu.component';

/**
 * Racine du site vitrine : le site est lui-même habillé par le shell de la
 * librairie (topbar + sidebar + notifications) — la meilleure démo possible.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BillyShellComponent,
    BillyNotificationsComponent,
    ToastrListPanelComponent,
    DocSearchComponent,
    NotifNouveautesComponent,
    AccountMenuComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
