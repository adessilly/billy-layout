import { Component, Type, computed, effect, inject, input, resource } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageHeaderComponent, TabComponent, TabsComponent } from 'billy-layout';
import { findEntry } from '../../site/doc-registry';
import { DEMO_LOADERS } from '../../demos/demo-registry';
import { MarkdownViewerComponent } from '../../site/markdown/markdown-viewer.component';

/**
 * Page d'une fiche composant : en-tête, puis la démo live et la documentation
 * markdown — présentées dans des billy-tabs (elles-mêmes composant de la lib).
 */
@Component({
  selector: 'site-component-page',
  imports: [NgComponentOutlet, PageHeaderComponent, TabsComponent, TabComponent, MarkdownViewerComponent],
  template: `
    @if (found(); as data) {
      <billy-page-header
        [titre]="data.entry.label"
        [sousTitre]="data.entry.summary"
        [retourVisible]="true"
        [retourTitre]="data.category.label"
        (retour)="back()" />

      <div class="site-page">
        @if (demo.value(); as demoComponent) {
          <billy-tabs>
            <billy-tab label="Démo" icon="fa-solid fa-wand-magic-sparkles">
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

  /** Liés depuis la route /c/:category/:slug (withComponentInputBinding). */
  readonly category = input.required<string>();
  readonly slug = input.required<string>();

  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly found = computed(() => findEntry(this.category(), this.slug()));

  readonly docPath = computed(() => `${this.category()}/${this.slug()}.md`);

  /** Démo live éventuelle, chargée à la demande depuis le registre. */
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
        void this.router.navigateByUrl('/composants');
      } else {
        this.title.setTitle(`${data.entry.label} — billy-layout`);
      }
    });
  }

  back(): void {
    void this.router.navigate(['/c', this.category()]);
  }

}
