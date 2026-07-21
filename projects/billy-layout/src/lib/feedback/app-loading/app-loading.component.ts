import { Component, inject, input } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

/**
 * Loading overlay replacing `ad-loading`.
 * Covers the parent's whole area (which must be `position: relative`)
 * and shows an SVG animation while `loading` is true.
 */
@Component({
  selector: 'billy-loading',
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss']
})
export class AppLoadingComponent {

  protected readonly i18n = inject(BillyI18nService);

  loading = input<boolean>(false);
}
