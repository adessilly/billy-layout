import { Component, OnInit, computed, input, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BillyIconComponent, BillyIconName } from '../../core/icon/billy-icon.component';

/**
 * Onglet de la barre de navigation mobile. La librairie ne connaît pas les
 * routes : activation et navigation sont fournies par l'application.
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

  readonly tabs = input.required<BillyActionBarTab[]>();

  readonly activeIndex = signal(-1);
  // Dernier onglet actif : le halo s'estompe sur place (au lieu de sauter en
  // position 0) quand on navigue vers une page hors de la barre.
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
