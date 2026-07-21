import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

/**
 * Tab of the mobile navigation bar. The library does not know the routes:
 * activation and navigation are provided by the application.
 */
export interface BillyActionBarTab {
  icon: BillyIconName;
  label: string;
  isActive: (url: string) => boolean;
  go: () => void;
}

@Component({
    selector: 'billy-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss'],
    imports: [BillyIconComponent]
})
export class ActionBarComponent implements OnInit {

  protected readonly i18n = inject(BillyI18nService);

  readonly tabs = input.required<BillyActionBarTab[]>();

  readonly activeIndex = signal(-1);
  // Last active tab: the halo fades out in place (instead of jumping to
  // position 0) when navigating to a page outside the bar.
  private readonly lastIndex = signal(0);

  readonly pillTransform = computed(() =>
    `translateX(${(this.activeIndex() >= 0 ? this.activeIndex() : this.lastIndex()) * 100}%)`);

  constructor(public router: Router) { }

  ngOnInit(): void {
    this.refreshNav(this.router.url);
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.refreshNav(val.url);
      }
    });
  }

  refreshNav(url: string): void {
    const idx = this.tabs().findIndex(t => t.isActive(url));
    this.activeIndex.set(idx);
    if (idx >= 0) {
      this.lastIndex.set(idx);
    }
  }

}
