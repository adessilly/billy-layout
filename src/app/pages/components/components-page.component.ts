import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillyIconComponent, PageHeaderComponent } from 'billy-layout';
import { DOC_CATEGORIES, DOC_ENTRY_COUNT } from '../../site/doc-registry';
import { EntryCardComponent } from '../../site/entry-card.component';

/** Vue d'ensemble : toutes les fiches, groupées par catégorie. */
@Component({
  selector: 'site-composants-page',
  imports: [RouterLink, BillyIconComponent, PageHeaderComponent, EntryCardComponent],
  template: `
    <billy-page-header titre="Composants" [sousTitre]="entryCount + ' fiches, miroir de src/lib/ et docs/'" />

    <div class="site-page site-motion">
      @for (category of categories; track category.slug) {
        <section class="composants-section">
          <a class="composants-head" [routerLink]="['/c', category.slug]">
            <span class="composants-icon">
              <billy-icon [name]="category.icon" [size]="19" [strokeWidth]="1.8" />
            </span>
            <h2 class="composants-title">{{ category.label }}</h2>
            <span class="composants-count">{{ category.entries.length }}</span>
            <billy-icon class="composants-chevron" name="chevron-right" [size]="16" [strokeWidth]="2" />
          </a>
          <div class="composants-grid">
            @for (entry of category.entries; track entry.slug; let i = $index) {
              <site-entry-card [category]="category" [entry]="entry" [index]="i" />
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    :host { display: block; }

    .composants-section { margin-bottom: 34px; }

    .composants-head {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-bottom: 14px;
      width: fit-content;

      &:hover .composants-chevron { opacity: 1; transform: translateX(0); }
    }

    .composants-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--billy-accent-strong);
      background: var(--billy-accent-soft);
      border: 1px solid var(--billy-accent-border);
    }

    .composants-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: var(--site-heading);
      margin: 0;
    }

    .composants-count {
      font-size: 11px;
      font-weight: 700;
      color: var(--billy-accent-strong);
      background: var(--billy-accent-soft);
      border-radius: 12px;
      padding: 1px 8px;
    }

    .composants-chevron {
      color: var(--billy-accent);
      opacity: 0;
      transform: translateX(-5px);
      transition: opacity .18s ease, transform .18s ease;
    }

    .composants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
  `,
})
export class ComposantsPageComponent {

  readonly categories = DOC_CATEGORIES;
  readonly entryCount = DOC_ENTRY_COUNT;

}
