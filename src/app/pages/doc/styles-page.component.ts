import { Component } from '@angular/core';
import { PageHeaderComponent } from 'billy-layout';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';
import { TokensGalleryComponent } from '../../site/tokens-gallery.component';

/** Styles partagés : tokens --billy-*, mixins et coque modale. */
@Component({
  selector: 'site-styles-page',
  imports: [PageHeaderComponent, MarkdownViewerComponent, TokensGalleryComponent],
  template: `
    <billy-page-header titre="Styles & tokens" sousTitre="Variables --billy-*, mixins billy-forms / billy-cards, reboot et coque modale" />
    <div class="site-page">
      <site-tokens-gallery />
      <div class="site-card" style="margin-top: 16px">
        <site-markdown src="styles/styles.md" />
      </div>
    </div>
  `,
})
export class StylesPageComponent {}
