import { ApplicationConfig, computed, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { BILLY_SHELL_CONFIG, BillyMenuLink, BillyShellConfig, ToastrService } from 'billy-layout';

import { routes } from './app.routes';
import { DOC_CATEGORIES } from './site/doc-registry';
import { version as libraryVersion } from '../../projects/billy-layout/package.json';

/** Side menu: guide pages + one entry per component category. */
const MENU_LINKS: BillyMenuLink[] = [
  { text: 'Documentation', heading: true },
  { text: 'Home', link: '/', icon: 'home' },
  { text: 'UX guidelines', link: '/guidelines', icon: 'calendar' },
  { text: 'Styles & tokens', link: '/styles', icon: 'dark-mode' },
  { text: 'Components', heading: true },
  ...DOC_CATEGORIES.map((category): BillyMenuLink => ({
    text: category.label,
    link: `/c/${category.slug}`,
    icon: category.icon,
  })),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    {
      provide: BILLY_SHELL_CONFIG,
      useFactory: (): BillyShellConfig => {
        const toastr = inject(ToastrService);
        return {
          menuLinks: MENU_LINKS,
          version: libraryVersion,
          homeLink: '/',
          logout: () => toastr.info('This is the billy-layout showcase site: there is no session to close 😉', 'Log out'),
          // Badge per category: the number of doc pages, to demonstrate menuBadges.
          menuBadges: computed(() => Object.fromEntries(
            DOC_CATEGORIES.map(category => [category.label, String(category.entries.length)]),
          )),
          // Demo of the bell's global sync: a simple delay.
          syncNotifications: () => new Promise(resolve => setTimeout(resolve, 1200)),
        };
      },
    },
  ],
};
