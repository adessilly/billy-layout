import { Component, input, signal } from '@angular/core';

@Component({
    selector: 'billy-label-clipboard',
    templateUrl: './label-clipboard.component.html',
    styleUrls: ['./label-clipboard.component.scss']
})
export class LabelClipboardComponent {

  label = input.required<string>();
  value = input<string | null>(null);

  copied = signal(false);

  askCopy(event: MouseEvent) {
    event.stopPropagation();
    const value = this.value();
    const label = this.label();
    navigator.clipboard.writeText(value ? value : label);
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

}
