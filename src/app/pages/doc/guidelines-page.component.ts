import { Component } from '@angular/core';
import { PageHeaderComponent } from 'billy-layout';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';

/** Guidelines UX : la fiche d'assemblage des écrans, rendue depuis docs/. */
@Component({
  selector: 'site-guidelines-page',
  imports: [PageHeaderComponent, MarkdownViewerComponent],
  template: `
    <billy-page-header titre="Guidelines UX" sousTitre="Assembler un écran BILLy avec les composants de la lib" />
    <div class="site-page">
      <div class="site-card">
        <site-markdown src="ux-guidelines.md" />
      </div>
    </div>
  `,
})
export class GuidelinesPageComponent {}
