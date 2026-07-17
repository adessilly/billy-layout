import { Component, ElementRef, HostListener, computed, contentChildren, effect, inject, signal } from '@angular/core';
import { BILLY_SHELL_CONFIG } from '../billy-shell-config';
import { BillyIconComponent } from '../../../core/icon/billy-icon.component';
import { BillyNotifCategory, BillyNotifCategoryId } from './billy-notif-category';
import { BillyNotifActionComponent } from './billy-notif-action.component';

/**
 * Cloche de notifications unifiée : panneau à deux niveaux
 * (catégories → éléments, avec bouton retour).
 *
 * Chaque catégorie est un composant autonome (voir BillyNotifCategory), fourni
 * par l'application en contenu projeté ; ce composant ne gère que la cloche,
 * la navigation entre niveaux et la synchronisation globale (déléguée à
 * `BILLY_SHELL_CONFIG.syncNotifications`).
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

  private readonly config = inject(BILLY_SHELL_CONFIG, { optional: true });
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Les catégories projetées par l'application, dans l'ordre d'affichage. */
  readonly categories = contentChildren(BillyNotifCategory);

  /** Catégories déjà câblées (état poussé + outputs abonnés une seule fois). */
  private readonly wired = new WeakSet<BillyNotifCategory>();

  constructor() {
    // Le contenu projeté ne peut pas être template-bindé : on pousse l'état du
    // panneau dans les signals de chaque catégorie et on s'abonne à ses sorties.
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
    // Un clic qui a déclenché un re-render du panneau (changement de niveau)
    // arrive ici avec une cible déjà détachée du DOM : ce n'est pas un clic
    // extérieur, on ne ferme pas.
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

  /** Synchronisation globale (config app) puis rechargement des catégories. */
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
