import { ApplicationConfig, LOCALE_ID, computed, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { BILLY_SHELL_CONFIG, BillyMenuLink, BillyShellConfig, ToastrService } from 'billy-layout';

import { routes } from './app.routes';
import { DOC_CATEGORIES } from './site/doc-registry';
import { version as libraryVersion } from '../../projects/billy-layout/package.json';

registerLocaleData(localeFr);

/** Menu latéral : pages du guide + une entrée par catégorie de composants. */
const MENU_LINKS: BillyMenuLink[] = [
  { text: 'Documentation', heading: true },
  { text: 'Accueil', link: '/', icon: 'accueil' },
  { text: 'Guidelines UX', link: '/guidelines', icon: 'agenda' },
  { text: 'Styles & tokens', link: '/styles', icon: 'dark-mode' },
  { text: 'Composants', heading: true },
  ...DOC_CATEGORIES.map((category): BillyMenuLink => ({
    text: category.label,
    link: `/c/${category.slug}`,
    icon: category.icon,
  })),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
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
          logout: () => toastr.info('Ceci est le site vitrine de billy-layout : il n’y a pas de session à fermer 😉', 'Déconnexion'),
          // Badge par catégorie : le nombre de fiches, pour démontrer menuBadges.
          menuBadges: computed(() => Object.fromEntries(
            DOC_CATEGORIES.map(category => [category.label, String(category.entries.length)]),
          )),
          // Démo de la synchro globale de la cloche : simple temporisation.
          syncNotifications: () => new Promise(resolve => setTimeout(resolve, 1200)),
        };
      },
    },
  ],
};
