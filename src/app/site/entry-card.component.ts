import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillyIconComponent } from 'billy-layout';
import { DocCategory, DocEntry } from './doc-registry';
import { hasDemo } from '../demos/demo-registry';

/** Card for a component doc page (category / components page grids). */
@Component({
  selector: 'site-entry-card',
  imports: [RouterLink, BillyIconComponent],
  template: `
    <a class="entry-card" [routerLink]="['/c', category().slug, entry().slug]" [style.--stagger]="index()">
      <span class="entry-head">
        <code class="entry-label">{{ entry().label }}</code>
        @if (demo()) {
          <span class="entry-demo-pill">
            <span class="entry-demo-dot"></span>
            live demo
          </span>
        }
      </span>
      <span class="entry-summary">{{ entry().summary }}</span>
      <span class="entry-footer">
        <span class="entry-cat">{{ category().label }}</span>
        <billy-icon class="entry-chevron" name="chevron-right" [size]="16" [strokeWidth]="2" />
      </span>
    </a>
  `,
  styleUrl: './entry-card.component.scss',
})
export class EntryCardComponent {

  readonly category = input.required<DocCategory>();
  readonly entry = input.required<DocEntry>();
  readonly index = input(0);

  demo(): boolean {
    return hasDemo(this.category().slug, this.entry().slug);
  }

}
