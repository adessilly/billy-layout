import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'billy-input-email-tag',
  templateUrl: './input-email-tag.component.html',
  styleUrls: ['./input-email-tag.component.scss'],
  imports: [CommonModule]
})
export class InputEmailTagComponent {

  email = input.required<string>();
  invalid = input<boolean>(false);
  disabled = input<boolean>(false);

  remove = output<void>();

  onRemove() {
    if (!this.disabled()) {
      this.remove.emit();
    }
  }

}
