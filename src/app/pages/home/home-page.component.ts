import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillyIconComponent, NavCardComponent } from 'billy-layout';
import { DOC_CATEGORIES, DOC_ENTRY_COUNT } from '../../site/doc-registry';
import { ClaudeSectionComponent } from './claude-section.component';
import { InstallSectionComponent } from './install-section.component';

/**
 * Accueil du site vitrine : hero animé (maquette d'écran BILLy qui s'assemble
 * en SVG), chiffres clés et grille des catégories de composants.
 */
@Component({
  selector: 'site-home-page',
  imports: [RouterLink, BillyIconComponent, NavCardComponent, InstallSectionComponent, ClaudeSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {

  readonly categories = DOC_CATEGORIES;
  readonly entryCount = DOC_ENTRY_COUNT;

}
