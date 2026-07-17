import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillyIconComponent } from 'billy-layout';
import { DOC_CATEGORIES, DOC_ENTRY_COUNT } from '../../site/doc-registry';

/**
 * Accueil du site vitrine : hero animé (maquette d'écran BILLy qui s'assemble
 * en SVG), chiffres clés et grille des catégories de composants.
 */
@Component({
  selector: 'site-home-page',
  imports: [RouterLink, BillyIconComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {

  readonly categories = DOC_CATEGORIES;
  readonly entryCount = DOC_ENTRY_COUNT;

}
