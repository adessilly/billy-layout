import { Component, computed, input } from '@angular/core';

/**
 * Ligne générique d'une liste de notifications : avatar à initiale, titre,
 * sous-titre, et colonne de droite (montant + statut). Le clic se gère sur
 * l'élément hôte, côté composant appelant.
 */
@Component({
  selector: 'billy-notif-item',
  templateUrl: './billy-notif-item.component.html',
  styleUrls: ['./billy-notif-item.component.scss'],
})
export class BillyNotifItemComponent {

  readonly accentBg = input.required<string>();
  readonly accentColor = input.required<string>();
  /** Texte dont la première lettre sert d'initiale à l'avatar. */
  readonly initialSource = input<string | number | null | undefined>(null);
  readonly title = input.required<string>();
  readonly sub = input('');
  readonly amount = input<string | null>(null);
  readonly status = input('');
  /** Couleur du statut ; par défaut la couleur d'accent de la catégorie. */
  readonly statusColor = input<string | null>(null);

  readonly initial = computed(() =>
    String(this.initialSource() ?? '?').trim().charAt(0).toUpperCase() || '?');

}
