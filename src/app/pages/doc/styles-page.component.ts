import { Component } from '@angular/core';
import { PageHeaderComponent } from 'billy-layout';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';
import { TokensGalleryComponent } from '../../site/tokens-gallery.component';

/** Shared styles: --billy-* tokens, mixins and the modal shell. */
@Component({
  selector: 'site-styles-page',
  imports: [PageHeaderComponent, MarkdownViewerComponent, TokensGalleryComponent],
  template: `
    <billy-page-header title="Styles & tokens" subtitle="--billy-* variables, billy-forms / billy-cards mixins, reboot and modal shell" />
    <div class="site-page">
      <site-tokens-gallery />
      <div class="site-card" style="margin-top: 16px">
        <site-markdown src="styles/styles.md" />
      </div>
    </div>
  `,
})
export class StylesPageComponent {}
