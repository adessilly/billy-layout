import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillyI18nService, BillyIconComponent, BillyIconName, BillyLocale, BillyPanelComponent, ClickOutsideDirective, ToastrService } from 'billy-layout';

interface AccountLink {
  icon: BillyIconName;
  iconBg: string;
  iconColor: string;
  text: string;
  sub: string;
  link?: string;
}

/**
 * Menu for the [shell-account] slot: the site's quick links, presented in a
 * billy-panel anchored under the avatar (same pattern as billy-client).
 */
@Component({
  selector: 'site-account-menu',
  imports: [BillyIconComponent, BillyPanelComponent, ClickOutsideDirective],
  template: `
    <li class="nav-item billy-topbar-action account-menu" (clickOutside)="close()" [listenClickOutside]="open()">

      <a class="nav-link account-menu-trigger" [class.active]="open()" (click)="toggle()" title="About billy-layout">
        <span class="account-avatar">B</span>
      </a>

      <billy-panel [open]="open()" heading="billy-layout" subheading="BILLy design system · v0.0.1">
        <div class="account-menu-lang" role="group" aria-label="Component language">
          <span class="account-menu-lang-label">Component language</span>
          <span class="account-menu-lang-switch">
            @for (locale of locales; track locale) {
              <button type="button"
                      class="account-menu-lang-btn"
                      [class.account-menu-lang-btn--active]="i18n.locale() === locale"
                      (click)="i18n.setLocale(locale)">{{ locale.toUpperCase() }}</button>
            }
          </span>
        </div>
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
  protected readonly i18n = inject(BillyI18nService);

  readonly open = signal(false);
  readonly locales: BillyLocale[] = ['en', 'fr'];

  readonly links: AccountLink[] = [
    { icon: 'calendar', iconBg: '#E6F7FC', iconColor: '#0E97BB', text: 'UX guidelines', sub: 'Assembling a BILLy screen', link: '/guidelines' },
    { icon: 'dark-mode', iconBg: '#F3E8FF', iconColor: '#7C3AED', text: 'Styles & tokens', sub: '--billy-* variables and mixins', link: '/styles' },
    { icon: 'open', iconBg: '#DCFCE7', iconColor: '#15803D', text: 'Publish the library', sub: 'ng build billy-layout then npm publish' },
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
      this.toastr.info('ng build billy-layout → dist/billy-layout, then npm publish from that folder.', 'Publishing');
    }
  }

}
