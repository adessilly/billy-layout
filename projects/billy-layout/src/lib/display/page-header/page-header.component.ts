import { Component, OnInit, input, output } from '@angular/core';

@Component({
    selector: 'billy-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit {

  readonly titre = input.required<string>();
  readonly sousTitre = input('');

  /** Affiche le bouton de retour, placé avant le titre. */
  readonly retourVisible = input(false);
  readonly retourTitre = input('Retour');
  readonly retour = output<void>();

  constructor() { }

  ngOnInit() {
  }

}
