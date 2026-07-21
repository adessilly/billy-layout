import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillyNotifCategory, BillyNotifEmptyComponent, BillyNotifItemComponent, provideBillyNotifCategory } from 'billy-layout';

interface Nouveaute {
  category: string;
  slug: string;
  label: string;
  sub: string;
}

/**
 * Catégorie de démonstration de la cloche : les dernières fiches à découvrir.
 * Montre le contrat BillyNotifCategory (compteur, refresh, navigation).
 */
@Component({
  selector: 'site-notif-nouveautes',
  imports: [BillyNotifItemComponent, BillyNotifEmptyComponent],
  providers: [provideBillyNotifCategory(() => NotifNouveautesComponent)],
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
              status="À découvrir"
              (click)="openFiche(item)" />
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
export class NotifNouveautesComponent extends BillyNotifCategory {

  readonly id = 'entrantes' as const;
  readonly label = 'À découvrir';
  readonly sub = 'Les fiches emblématiques de la lib';
  readonly icon = 'bell' as const;
  readonly iconBg = '#E6F7FC';
  readonly iconColor = '#0E97BB';

  private readonly router = inject(Router);

  readonly items = signal<Nouveaute[]>([
    { category: 'layout', slug: 'billy-shell', label: 'billy-shell', sub: 'La coque qui habille ce site' },
    { category: 'layout', slug: 'billy-notifications', label: 'billy-notifications', sub: 'La cloche que vous venez d’ouvrir' },
    { category: 'inputs', slug: 'datepicker', label: 'datepicker', sub: 'Popover desktop, bottom-sheet mobile' },
    { category: 'feedback', slug: 'empty-state', label: 'empty-state', sub: '7 illustrations d’états vides' },
    { category: 'forms', slug: 'save-bar', label: 'save-bar', sub: 'La conclusion de tout formulaire' },
  ]);

  readonly count = signal(this.items().length).asReadonly();

  async refresh(): Promise<void> {
    // Démo : rien à recharger, on simule une latence réseau.
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  openFiche(item: Nouveaute): void {
    this.navigated.emit();
    void this.router.navigate(['/c', item.category, item.slug]);
  }

}
