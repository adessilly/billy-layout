import { Component, computed, input } from '@angular/core';
import { CodeStatus } from '../../../core/utils/code-format';

/**
 * Pastille d'état d'un champ « code » :
 * - saisie en cours → anneau de progression qui se remplit à la frappe
 * - vérifié         → coche qui se dessine
 * - non vérifiable  → info (structure conforme, pas de clé de contrôle connue)
 * - invalide        → alerte
 */
@Component({
  selector: 'billy-code-status',
  templateUrl: './code-status.component.html',
  styleUrls: ['./code-status.component.scss'],
  host: {
    '[class]': '"cs--" + status()',
    '[attr.role]': '"img"',
    '[attr.aria-label]': 'label()',
  },
})
export class CodeStatusComponent {

  readonly status = input.required<CodeStatus>();
  /** Avancement de la saisie (0 → 1) : remplit l'anneau. */
  readonly progress = input(0);

  /** `pathLength="1"` sur le cercle : l'anneau se pilote directement en 0 → 1. */
  readonly dashoffset = computed(() => 1 - Math.min(1, Math.max(0, this.progress())));

  readonly label = computed(() => {
    switch (this.status()) {
      case 'valid':      return 'Vérifié';
      case 'invalid':    return 'Invalide';
      case 'unverified': return 'Format conforme';
      case 'partial':    return 'Saisie en cours';
      default:           return '';
    }
  });

}
