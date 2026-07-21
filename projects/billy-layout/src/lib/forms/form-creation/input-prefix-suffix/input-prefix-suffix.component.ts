import { Component, input, output } from '@angular/core';

@Component({
    selector: 'billy-input-prefix-suffix',
    templateUrl: './input-prefix-suffix.component.html',
    styleUrls: ['./input-prefix-suffix.component.scss'],
})
export class InputPrefixSuffixComponent {

  prefix = input('');
  suffix = input('');
  prefixIcon = input('');
  suffixIcon = input('');
  prefixClickable = input<boolean>(false);
  suffixClickable = input<boolean>(false);
  suffixClick = output<void>();
  prefixClick = output<void>();

  askSuffixClick() {
    if(this.suffixClickable())
      this.suffixClick.emit();
  }

  askPrefixClick() {
    if(this.prefixClickable())
      this.prefixClick.emit();
  }

}
