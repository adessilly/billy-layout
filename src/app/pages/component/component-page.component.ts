import { Component, Type, computed, effect, inject, input, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageHeaderComponent, TabComponent, TabsComponent } from 'billy-layout';
import { findEntry } from '../../site/doc-registry';
import { DEMO_LOADERS } from '../../demos/demo-registry';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';

/**
 * Component doc page: header, then the live demo and the markdown
 * documentation — presented in billy-tabs (themselves a library component).
 */
@Component({
  selector: 'site-component-page',
  imports: [NgComponentOutlet, PageHeaderComponent, TabsComponent, TabComponent, MarkdownViewerComponent],
  template: `
    @if (found(); as data) {
      <billy-page-header
        [title]="data.entry.label"
        [subtitle]="data.entry.summary"
        [backVisible]="true"
        [backLabel]="data.category.label"
        (back)="back()" />

      <div class="site-page">
        @if (demo.value(); as demoComponent) {
          <billy-tabs>
            <billy-tab label="Demo" icon="fa-solid fa-wand-magic-sparkles">
              <div class="component-demo">
                <ng-container *ngComponentOutlet="demoComponent" />
              </div>
            </billy-tab>
            <billy-tab label="Documentation" icon="fa-solid fa-book-open">
              <div class="site-card component-doc">
                <site-markdown [src]="docPath()" />
              </div>
            </billy-tab>
          </billy-tabs>
        } @else {
          <div class="site-card component-doc">
            <site-markdown [src]="docPath()" />
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    billy-tabs { display: block; }

    .component-demo,
    .component-doc {
      margin-top: 16px;
      animation: componentIn .3s ease;
    }

    @keyframes componentIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class ComponentPageComponent {

  /** Bound from the /c/:category/:slug route (withComponentInputBinding). */
  readonly category = input.required<string>();
  readonly slug = input.required<string>();

  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly found = computed(() => findEntry(this.category(), this.slug()));

  readonly docPath = computed(() => `${this.category()}/${this.slug()}.md`);

  /** Optional live demo, lazy-loaded from the registry. */
  readonly demo = resource<Type<unknown> | null, string>({
    params: () => `${this.category()}/${this.slug()}`,
    loader: async ({ params }) => {
      const loader = DEMO_LOADERS[params];
      return loader ? loader() : null;
    },
  });

  constructor() {
    effect(() => {
      const data = this.found();
      if (!data) {
        void this.router.navigateByUrl('/components');
      } else {
        this.title.setTitle(`${data.entry.label} — billy-layout`);
      }
    });
  }

  back(): void {
    void this.router.navigate(['/c', this.category()]);
  }

}
