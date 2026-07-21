import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillyNotifCategory, BillyNotifEmptyComponent, BillyNotifItemComponent, provideBillyNotifCategory } from 'billy-layout';

interface Highlight {
  category: string;
  slug: string;
  label: string;
  sub: string;
}

/**
 * Demo category for the bell: the latest doc pages to discover.
 * Shows the BillyNotifCategory contract (counter, refresh, navigation).
 */
@Component({
  selector: 'site-notif-whats-new',
  imports: [BillyNotifItemComponent, BillyNotifEmptyComponent],
  providers: [provideBillyNotifCategory(() => NotifWhatsNewComponent)],
  template: `
    @if (active()) {
      <div class="billy-notif-level">
        <div class="billy-notif-items">
          @if (count() === 0) {
            <billy-notif-empty />
          }
          @for (item of items(); track item.slug) {
            <billy-notif-item
              [accentBg]="iconBg"
              [accentColor]="iconColor"
              [initialSource]="item.label"
              [title]="item.label"
              [sub]="item.sub"
              status="To discover"
              (click)="openEntry(item)" />
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .billy-notif-level {
      padding: 6px;
      animation: siteNotifIn .2s ease;
    }

    @keyframes siteNotifIn {
      from { opacity: 0; transform: translateX(12px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .billy-notif-items {
      max-height: 340px;
      overflow-y: auto;
    }
  `,
})
export class NotifWhatsNewComponent extends BillyNotifCategory {

  readonly id = 'incoming' as const;
  readonly label = 'To discover';
  readonly sub = 'The library’s flagship doc pages';
  readonly icon = 'bell' as const;
  readonly iconBg = '#E6F7FC';
  readonly iconColor = '#0E97BB';

  private readonly router = inject(Router);

  readonly items = signal<Highlight[]>([
    { category: 'layout', slug: 'billy-shell', label: 'billy-shell', sub: 'The shell that frames this site' },
    { category: 'layout', slug: 'billy-notifications', label: 'billy-notifications', sub: 'The bell you just opened' },
    { category: 'inputs', slug: 'datepicker', label: 'datepicker', sub: 'Desktop popover, mobile bottom-sheet' },
    { category: 'feedback', slug: 'empty-state', label: 'empty-state', sub: '7 empty-state illustrations' },
    { category: 'forms', slug: 'save-bar', label: 'save-bar', sub: 'The conclusion of every form' },
  ]);

  readonly count = signal(this.items().length).asReadonly();

  async refresh(): Promise<void> {
    // Demo: nothing to reload, we simulate network latency.
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  openEntry(item: Highlight): void {
    this.navigated.emit();
    void this.router.navigate(['/c', item.category, item.slug]);
  }

}
