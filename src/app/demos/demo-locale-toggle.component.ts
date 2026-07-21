import { Component, inject } from '@angular/core';
import { BillyI18nService, BillyLocale } from 'billy-layout';

/**
 * EN/FR segmented toggle for demo stages whose component has built-in,
 * localizable strings. Drives the global BillyI18nService — switching here
 * is the live demo of `provideBillyI18n` / `setLocale`.
 */
@Component({
  selector: 'demo-locale-toggle',
  template: `
    <span class="locale-toggle" role="group" aria-label="Component language">
      @for (locale of locales; track locale) {
        <button type="button"
                class="locale-toggle-btn"
                [class.locale-toggle-btn--active]="i18n.locale() === locale"
                (click)="i18n.setLocale(locale)">{{ locale.toUpperCase() }}</button>
      }
    </span>
  `,
  styles: `
    :host { display: inline-flex; }

    .locale-toggle {
      display: inline-flex;
      border: 1px solid var(--billy-surface-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .locale-toggle-btn {
      border: none;
      background: transparent;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--billy-text-soft);
      cursor: pointer;
      transition: background .15s ease, color .15s ease;
    }

    .locale-toggle-btn:hover {
      color: var(--site-heading);
    }

    .locale-toggle-btn--active {
      background: var(--billy-accent);
      color: #fff;
    }
  `,
})
export class DemoLocaleToggleComponent {

  protected readonly i18n = inject(BillyI18nService);
  readonly locales: BillyLocale[] = ['en', 'fr'];

}
