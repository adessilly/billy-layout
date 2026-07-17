import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageHeaderComponent } from 'billy-layout';
import { findCategory } from '../../site/doc-registry';
import { EntryCardComponent } from '../../site/entry-card.component';

/** Une catégorie : sa présentation et la grille de ses fiches. */
@Component({
  selector: 'site-category-page',
  imports: [PageHeaderComponent, EntryCardComponent],
  template: `
    @if (cat(); as category) {
      <billy-page-header
        [titre]="category.label"
        [sousTitre]="category.intro"
        [retourVisible]="true"
        retourTitre="Tous les composants"
        (retour)="back()" />

      <div class="site-page site-motion">
        <div class="category-grid">
          @for (entry of category.entries; track entry.slug; let i = $index) {
            <site-entry-card [category]="category" [entry]="entry" [index]="i" />
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
  `,
})
export class CategoryPageComponent {

  /** Slug de catégorie, lié depuis la route (withComponentInputBinding). */
  readonly category = input.required<string>();

  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly cat = computed(() => findCategory(this.category()));

  constructor() {
    effect(() => {
      const found = this.cat();
      if (!found) {
        void this.router.navigateByUrl('/composants');
      } else {
        this.title.setTitle(`${found.label} — billy-layout`);
      }
    });
  }

  back(): void {
    void this.router.navigateByUrl('/composants');
  }

}
