import { Component, computed, inject, input, signal } from '@angular/core';
import { ToastrService } from './toastr.service';
import { ToastrInstance, ToastrType } from './toastr';

const TYPE_ICONS: Record<ToastrType, string> = {
  success: 'fa-solid fa-check',
  error: 'fa-solid fa-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-circle-info',
};

/**
 * Carte de toast individuelle. La temporisation est portée par l'animation
 * CSS de la barre de progression : son `animationend` déclenche la fermeture,
 * et le survol la met en pause (le toast reste tant qu'on le lit).
 *
 * Sur mobile le toast s'affiche en pilule compacte (icône + titre) ;
 * un tap la déplie pour lire le message.
 */
@Component({
  selector: 'billy-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],
  host: {
    '[class.leaving]': 'leaving()',
  },
})
export class ToastrComponent {

  private readonly toastrService = inject(ToastrService);

  readonly toast = input.required<ToastrInstance>();

  readonly leaving = signal(false);
  readonly expanded = signal(false);

  readonly icone = computed(() => this.toast().icone ?? TYPE_ICONS[this.toast().type]);

  toggleExpanded(): void {
    this.expanded.update(expanded => !expanded);
  }

  close(event?: Event): void {
    event?.stopPropagation();
    if (this.leaving()) {
      return;
    }
    this.leaving.set(true);
    // Laisse l'animation de sortie (grid-collapse) se jouer avant le retrait.
    setTimeout(() => this.toastrService.remove(this.toast().id), 250);
  }

}
