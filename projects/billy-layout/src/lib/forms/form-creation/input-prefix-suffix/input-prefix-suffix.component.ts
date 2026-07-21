import { Component, input, output } from '@angular/core';

@Component({
    selector: 'billy-input-prefixe-suffixe',
    templateUrl: './input-prefixe-suffixe.component.html',
    styleUrls: ['./input-prefixe-suffixe.component.scss'],
    standalone: true
})
export class InputPrefixeSuffixeComponent {

  prefixe = input('');
  suffixe = input('');
  prefixeIcon = input('');
  suffixeIcon = input('');
  prefixeClickable = input<boolean>(false);
  suffixeClickable = input<boolean>(false);
  suffixeClick = output<void>();
  prefixeClick = output<void>();

  askSuffixeClick() {
    if(this.suffixeClickable())
      this.suffixeClick.emit();
  }

  askPrefixeClick() {
    if(this.prefixeClickable())
      this.prefixeClick.emit();
  }

}
