import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterToggleOption {
  value: string | null;
  label: string;
  icon?: string;
  /** Text + border color when active (chips variant) */
  activeColor?: string;
  /** Background color when active (chips variant) */
  activeBg?: string;
}

@Component({
  selector: 'billy-filter-toggle-buttons',
  templateUrl: './filter-toggle-buttons.component.html',
  styleUrls: ['./filter-toggle-buttons.component.scss'],
  imports: [CommonModule],
})
export class FilterToggleButtonsComponent {
  /** List of options to display */
  readonly options = input.required<FilterToggleOption[]>();
  /** Currently selected value */
  readonly value = input<string | null>(null);
  /**
   * Visual variant:
   * - `toggle`: segment control with a shared background (purchase, sale)
   * - `chips` : individual colored pills (recurring entries)
   */
  readonly variant = input<'toggle' | 'chips'>('toggle');
  /** Active color shared by the whole group (toggle variant, or chips fallback) */
  readonly activeColor = input<string | undefined>(undefined);

  readonly valueChange = output<string | null>();

  select(value: string | null): void {
    this.valueChange.emit(value);
  }
}
