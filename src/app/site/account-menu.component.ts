import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillyIconComponent, BillyIconName, BillyPanelComponent, ClickOutsideDirective, ToastrService } from 'billy-layout';

interface AccountLink {
  icon: BillyIconName;
  iconBg: string;
  iconColor: string;
  text: string;
  sub: string;
  link?: string;
}

/**
 * Menu du slot [shell-account] : accès rapides du site, présenté dans un
 * billy-panel ancré sous l'avatar (même pattern que billy-client).
 */
@Component({
  selector: 'site-account-menu',
  imports: [BillyIconComponent, BillyPanelComponent, ClickOutsideDirective],
  template: `
    <li class="nav-item billy-topbar-action account-menu" (clickOutside)="close()" [listenClickOutside]="open()">

      <a class="nav-link account-menu-trigger" [class.active]="open()" (click)="toggle()" title="À propos de billy-layout">
        <span class="account-avatar">B</span>
      </a>

      <billy-panel [open]="open()" heading="billy-layout" subheading="Design system BILLy · v0.0.1">
        @for (item of links; track item.text) {
          <button type="button" class="account-menu-item" (click)="go(item)">
            <span class="account-menu-icon" [style.background]="item.iconBg" [style.color]="item.iconColor">
              <billy-icon [name]="item.icon" [size]="18" [strokeWidth]="1.8" />
            </span>
            <span class="account-menu-texts">
              <span class="account-menu-label">{{ item.text }}</span>
              <span class="account-menu-sub">{{ item.sub }}</span>
            </span>
            <billy-icon class="account-menu-chevron" name="chevron-right" [size]="16" [strokeWidth]="2" />
          </button>
        }
      </billy-panel>

    </li>
  `,
  styleUrl: './account-menu.component.scss',
})
export class AccountMenuComponent {

  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly open = signal(false);

  readonly links: AccountLink[] = [
    { icon: 'agenda', iconBg: '#E6F7FC', iconColor: '#0E97BB', text: 'Guidelines UX', sub: 'Assembler un écran BILLy', link: '/guidelines' },
    { icon: 'dark-mode', iconBg: '#F3E8FF', iconColor: '#7C3AED', text: 'Styles & tokens', sub: 'Variables --billy-* et mixins', link: '/styles' },
    { icon: 'open', iconBg: '#DCFCE7', iconColor: '#15803D', text: 'Publier la librairie', sub: 'ng build billy-layout puis npm publish' },
  ];

  toggle(): void {
    this.open.update(value => !value);
  }

  close(): void {
    this.open.set(false);
  }

  go(item: AccountLink): void {
    this.close();
    if (item.link) {
      void this.router.navigateByUrl(item.link);
    } else {
      this.toastr.info('ng build billy-layout → dist/billy-layout, puis npm publish depuis ce dossier.', 'Publication');
    }
  }

}
