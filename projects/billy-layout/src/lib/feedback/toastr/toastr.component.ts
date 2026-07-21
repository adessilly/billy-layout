import { Component, computed, inject, input, signal } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { ToastrService } from './toastr.service';
import { ToastrInstance, ToastrType } from './toastr';

const TYPE_ICONS: Record<ToastrType, string> = {
  success: 'fa-solid fa-check',
  error: 'fa-solid fa-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-circle-info',
};

/**
 * Individual toast card. The timing is carried by the CSS animation of the
 * progress bar: its `animationend` triggers the dismissal, and hovering pauses
 * it (the toast stays while it is being read).
 *
 * On mobile the toast shows as a compact pill (icon + title);
 * a tap expands it to read the message.
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

  protected readonly i18n = inject(BillyI18nService);

  readonly toast = input.required<ToastrInstance>();

  readonly leaving = signal(false);
  readonly expanded = signal(false);

  readonly icon = computed(() => this.toast().icon ?? TYPE_ICONS[this.toast().type]);

  toggleExpanded(): void {
    this.expanded.update(expanded => !expanded);
  }

  close(event?: Event): void {
    event?.stopPropagation();
    if (this.leaving()) {
      return;
    }
    this.leaving.set(true);
    // Lets the exit animation (grid-collapse) play before removal.
    setTimeout(() => this.toastrService.remove(this.toast().id), 250);
  }

}
