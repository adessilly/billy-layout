import { Component, computed, inject, input, output } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-add-button',
    templateUrl: './add-button.component.html',
    styleUrls: ['./add-button.component.scss']
})
export class AddButtonComponent {

  protected readonly i18n = inject(BillyI18nService);

  readonly label = input<string>();
  protected readonly labelText = computed(() => this.label() ?? this.i18n.strings().addButton.label);
  readonly subtitle = input('');
  readonly icon = input('fa-solid fa-pen-to-square');

  readonly clicked = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.clicked.emit(event);
  }

}
