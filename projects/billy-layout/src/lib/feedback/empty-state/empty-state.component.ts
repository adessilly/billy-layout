import { Component, computed, inject, input, output } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

export type EmptyStateType =
  | 'purchase'
  | 'sale'
  | 'quote'
  | 'client'
  | 'events'
  | 'recurring'
  | 'search';

@Component({
  selector: 'billy-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly type = input.required<EmptyStateType>();
  readonly createClicked = output<void>();

  protected readonly copy = computed(() => this.i18n.strings().emptyState[this.type()]);
}
