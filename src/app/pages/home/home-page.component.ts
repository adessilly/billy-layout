import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillyIconComponent, NavCardComponent } from 'billy-layout';
import { DOC_CATEGORIES, DOC_ENTRY_COUNT } from '../../site/doc-registry';
import { ClaudeSectionComponent } from './claude-section.component';
import { InstallSectionComponent } from './install-section.component';

/**
 * Showcase site home: animated hero (SVG mockup of a BILLy screen assembling
 * itself), key figures and the component category grid.
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
