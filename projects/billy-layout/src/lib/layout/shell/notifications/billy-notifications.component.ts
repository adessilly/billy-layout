import { Component, ElementRef, HostListener, computed, contentChildren, effect, inject, signal } from '@angular/core';
import { BILLY_SHELL_CONFIG } from '../billy-shell-config';
import { BillyIconComponent } from '../../../core/icon/billy-icon.component';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
import { BillyNotifCategory, BillyNotifCategoryId } from './billy-notif-category';
import { BillyNotifActionComponent } from './billy-notif-action.component';

/**
 * Unified notification bell: two-level panel
 * (categories → items, with a back button).
 *
 * Each category is a self-contained component (see BillyNotifCategory),
 * provided by the application as projected content; this component only
 * handles the bell, the navigation between levels and the global
 * synchronization (delegated to `BILLY_SHELL_CONFIG.syncNotifications`).
 */
@Component({
  selector: 'billy-notifications',
  templateUrl: './billy-notifications.component.html',
  styleUrls: ['./billy-notifications.component.scss'],
  imports: [
    BillyIconComponent,
    BillyNotifActionComponent,
  ],
})
export class BillyNotificationsComponent {

  protected readonly i18n = inject(BillyI18nService);
  private readonly config = inject(BILLY_SHELL_CONFIG, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>);

  /** The categories projected by the application, in display order. */
  readonly categories = contentChildren(BillyNotifCategory);

  /** Categories already wired up (state pushed + outputs subscribed once). */
  private readonly wired = new WeakSet<BillyNotifCategory>();

  constructor() {
    // Projected content cannot be template-bound: we push the panel state
    // into each category's signals and subscribe to its outputs.
    effect(() => {
      const categoryId = this.categoryId();
      const syncing = this.syncLoading();
      for (const category of this.categories()) {
        category.activeCategory.set(categoryId);
        category.syncing.set(syncing);
        if (!this.wired.has(category)) {
          this.wired.add(category);
          category.syncRequested.subscribe(() => this.syncAll());
          category.navigated.subscribe(() => this.close());
        }
      }
    });
  }

  readonly open = signal(false);
  readonly categoryId = signal<BillyNotifCategoryId | null>(null);
  readonly syncLoading = signal(false);

  readonly totalCount = computed(() =>
    this.categories().reduce((total, category) => total + category.count(), 0));

  readonly activeCategory = computed(() =>
    this.categories().find(category => category.id === this.categoryId()) ?? null);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    // A click that triggered a re-render of the panel (level change) arrives
    // here with a target already detached from the DOM: it is not an outside
    // click, so we do not close.
    if (!target.isConnected) {
      return;
    }
    if (this.open() && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  toggle(): void {
    this.open.update(open => !open);
    this.categoryId.set(null);
  }

  close(): void {
    this.open.set(false);
    this.categoryId.set(null);
  }

  openCategory(id: BillyNotifCategoryId): void {
    this.categoryId.set(id);
  }

  back(): void {
    this.categoryId.set(null);
  }

  /** Global synchronization (app config) then reload of the categories. */
  async syncAll(): Promise<void> {
    if (this.syncLoading()) {
      return;
    }
    try {
      this.syncLoading.set(true);
      await this.config?.syncNotifications?.();
      for (const category of this.categories()) {
        await category.refresh();
      }
    } finally {
      this.syncLoading.set(false);
    }
  }

}
