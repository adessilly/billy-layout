import { Directive, ElementRef, effect, inject, input, output, untracked } from '@angular/core';
import { ClickOutsideService } from './click-outside.service';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {

  listenClickOutside = input(true);
  clickOutside = output<void>();

  private clickOutsideService = inject(ClickOutsideService);
  private elementRef = inject(ElementRef);

  constructor() {
    effect( () => {
      const clickElementTarget = this.clickOutsideService.clickEmitted();
      untracked(() => {
        if(!this.listenClickOutside()) {
          return;
        }
        if(clickElementTarget) {
          const clickedInside = this.elementRef.nativeElement.contains(clickElementTarget);
          if (!clickedInside) {
            this.clickOutside.emit();
          }
        }
      });
    });
  }

}
