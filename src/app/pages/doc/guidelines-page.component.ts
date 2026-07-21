import { Component } from '@angular/core';
import { PageHeaderComponent } from 'billy-layout';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';

/** UX guidelines: the screen-assembly guide, rendered from docs/. */
@Component({
  selector: 'site-guidelines-page',
  imports: [PageHeaderComponent, MarkdownViewerComponent],
  template: `
    <billy-page-header title="UX guidelines" subtitle="Assembling a BILLy screen with the library components" />
    <div class="site-page">
      <div class="site-card">
        <site-markdown src="ux-guidelines.md" />
      </div>
    </div>
  `,
})
export class GuidelinesPageComponent {}
