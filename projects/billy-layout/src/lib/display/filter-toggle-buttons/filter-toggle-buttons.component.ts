import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterToggleOption {
  value: string | null;
  label: string;
  icon?: string;
  /** Couleur texte + bordure quand actif (variante chips) */
  activeColor?: string;
  /** Couleur de fond quand actif (variante chips) */
  activeBg?: string;
}

@Component({
  selector: 'billy-filter-toggle-buttons',
  templateUrl: './filter-toggle-buttons.component.html',
  styleUrls: ['./filter-toggle-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class FilterToggleButtonsComponent {
  /** Liste des options à afficher */
  readonly options = input.required<FilterToggleOption[]>();
  /** Valeur actuellement sélectionnée */
  readonly value = input<string | null>(null);
  /**
   * Variante visuelle :
   * - `toggle` : segment-control avec fond commun (achat, vente)
   * - `chips`  : pills individuelles colorées (recurrence)
   */
  readonly variant = input<'toggle' | 'chips'>('toggle');
  /** Couleur active partagée par tout le groupe (variante toggle, ou fallback chips) */
  readonly activeColor = input<string | undefined>(undefined);

  readonly valueChange = output<string | null>();

  select(value: string | null): void {
    this.valueChange.emit(value);
  }
}
