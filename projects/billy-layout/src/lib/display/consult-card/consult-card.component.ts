import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'billy-consult-card',
  templateUrl: './consult-card.component.html',
  styleUrls: ['./consult-card.component.scss'],
  imports: [CommonModule]
})
export class ConsultCardComponent {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly badge = input<number | null>(null);
}
