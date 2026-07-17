import { Directive, LOCALE_ID, Provider, Signal, Type, computed, forwardRef, inject, output, signal } from '@angular/core';
import { BillyIconName } from '../../../core/icon/billy-icon.component';

export type BillyNotifCategoryId = 'entrantes' | 'sortantes' | 'impayes';

/**
 * Base commune des catégories de notifications de la cloche.
 *
 * Chaque catégorie est un composant autonome : il charge ses données, expose
 * son compteur et affiche sa propre liste (niveau 2 du panneau). Le composant
 * parent ne connaît que cette abstraction : il dessine les lignes de
 * catégories à partir des métadonnées et retrouve les instances via
 * `contentChildren(BillyNotifCategory)`. Ajouter une catégorie = créer un
 * composant qui étend cette classe et le projeter dans
 * <billy-notifications> (côté application).
 */
@Directive()
export abstract class BillyNotifCategory {

  /** Identifiant unique, utilisé pour la navigation entre les deux niveaux. */
  abstract readonly id: BillyNotifCategoryId;

  // Métadonnées de la ligne de catégorie (niveau 1) et de l'entête.
  abstract readonly label: string;
  abstract readonly sub: string;
  abstract readonly icon: BillyIconName;
  abstract readonly iconBg: string;
  abstract readonly iconColor: string;

  /** Nombre d'éléments à traiter (badge de la cloche et compteurs). */
  abstract readonly count: Signal<number>;

  // État poussé par le panneau parent (billy-notifications) : les catégories
  // sont du contenu projeté par l'application, le parent ne peut pas les
  // template-binder — il écrit ces signals depuis un effect.
  /** Catégorie ouverte dans le panneau (null = niveau catégories). */
  readonly activeCategory = signal<BillyNotifCategoryId | null>(null);
  /** Une synchronisation globale est en cours (anime les icônes sync). */
  readonly syncing = signal(false);

  /** Demande de synchronisation globale émise depuis le pied de la liste. */
  readonly syncRequested = output<void>();
  /** Un élément a ouvert son écran métier : le panneau doit se fermer. */
  readonly navigated = output<void>();

  /** La liste de cette catégorie est-elle celle affichée ? */
  readonly active = computed(() => this.activeCategory() === this.id);

  protected readonly locale = inject(LOCALE_ID);

  /** Recharge les données de la catégorie (après une synchro globale). */
  abstract refresh(): Promise<void>;

  protected clientName(holder: { client?: { nom?: string; prenom?: string } | null }): string {
    const client = holder.client;
    return client ? `${client.nom ?? ''} ${client.prenom ?? ''}`.trim() : '';
  }

}

/**
 * À déclarer dans les `providers` de chaque composant de catégorie pour que
 * le parent le retrouve via `viewChildren(BillyNotifCategory)`.
 */
export function provideBillyNotifCategory(component: () => Type<BillyNotifCategory>): Provider {
  return { provide: BillyNotifCategory, useExisting: forwardRef(component) };
}
