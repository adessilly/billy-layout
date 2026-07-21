import { Directive, LOCALE_ID, Provider, Signal, Type, computed, forwardRef, inject, output, signal } from '@angular/core';
import { BillyIconName } from '../../../core/icon/billy-icon.component';

export type BillyNotifCategoryId = 'incoming' | 'outgoing' | 'unpaid';

/**
 * Common base for the notification bell categories.
 *
 * Each category is a self-contained component: it loads its data, exposes
 * its counter and renders its own list (level 2 of the panel). The parent
 * component only knows this abstraction: it draws the category rows from
 * the metadata and retrieves the instances via
 * `contentChildren(BillyNotifCategory)`. Adding a category = creating a
 * component that extends this class and projecting it into
 * <billy-notifications> (application side).
 */
@Directive()
export abstract class BillyNotifCategory {

  /** Unique identifier, used for navigating between the two levels. */
  abstract readonly id: BillyNotifCategoryId;

  // Metadata for the category row (level 1) and the header.
  abstract readonly label: string;
  abstract readonly sub: string;
  abstract readonly icon: BillyIconName;
  abstract readonly iconBg: string;
  abstract readonly iconColor: string;

  /** Number of items to handle (bell badge and counters). */
  abstract readonly count: Signal<number>;

  // State pushed by the parent panel (billy-notifications): categories are
  // content projected by the application, so the parent cannot template-bind
  // them — it writes these signals from an effect.
  /** Category open in the panel (null = categories level). */
  readonly activeCategory = signal<BillyNotifCategoryId | null>(null);
  /** A global synchronization is in progress (animates the sync icons). */
  readonly syncing = signal(false);

  /** Global synchronization request emitted from the list footer. */
  readonly syncRequested = output<void>();
  /** An item opened its business screen: the panel must close. */
  readonly navigated = output<void>();

  /** Is this category's list the one being displayed? */
  readonly active = computed(() => this.activeCategory() === this.id);

  protected readonly locale = inject(LOCALE_ID);

  /** Reloads the category data (after a global sync). */
  abstract refresh(): Promise<void>;

  protected clientName(holder: { client?: { lastName?: string; firstName?: string } | null }): string {
    const client = holder.client;
    return client ? `${client.lastName ?? ''} ${client.firstName ?? ''}`.trim() : '';
  }

}

/**
 * Declare this in the `providers` of each category component so the parent
 * can retrieve it via `viewChildren(BillyNotifCategory)`.
 */
export function provideBillyNotifCategory(component: () => Type<BillyNotifCategory>): Provider {
  return { provide: BillyNotifCategory, useExisting: forwardRef(component) };
}
