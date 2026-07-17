import { Component, input } from '@angular/core';

/**
 * Overlay de chargement remplaçant `ad-loading`.
 * Recouvre toute la zone du parent (qui doit être en `position: relative`)
 * et affiche une animation SVG lorsque `loading` est vrai.
 */
@Component({
  selector: 'billy-loading',
  standalone: true,
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss']
})
export class AppLoadingComponent {
  loading = input<boolean>(false);
}
