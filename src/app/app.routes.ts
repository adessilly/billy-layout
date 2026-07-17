import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent),
    title: 'billy-layout — Design system BILLy',
  },
  {
    path: 'guidelines',
    loadComponent: () => import('./pages/doc/guidelines-page.component').then(m => m.GuidelinesPageComponent),
    title: 'Guidelines UX — billy-layout',
  },
  {
    path: 'styles',
    loadComponent: () => import('./pages/doc/styles-page.component').then(m => m.StylesPageComponent),
    title: 'Styles & tokens — billy-layout',
  },
  {
    path: 'composants',
    loadComponent: () => import('./pages/composants/composants-page.component').then(m => m.ComposantsPageComponent),
    title: 'Composants — billy-layout',
  },
  {
    path: 'c/:category',
    loadComponent: () => import('./pages/category/category-page.component').then(m => m.CategoryPageComponent),
  },
  {
    path: 'c/:category/:slug',
    loadComponent: () => import('./pages/component/component-page.component').then(m => m.ComponentPageComponent),
  },
  { path: '**', redirectTo: '' },
];
