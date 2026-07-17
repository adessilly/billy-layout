import { HostListener, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClickOutsideService {

  clickEmitted = signal<null | EventTarget>( null );

  constructor() {
    document.addEventListener('click', (event) => {
      this.clickEmitted.set(null);
      this.clickEmitted.set(event.target);
    });
  }

}
