import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BillyIconComponent } from 'billy-layout';
import { DOC_CATEGORIES, DocCategory, DocEntry } from './doc-registry';

interface SearchHit {
  category: DocCategory;
  entry: DocEntry;
}

/**
 * Recherche de la topbar (slot [shell-search]), même ergonomie que la
 * recherche globale de billy-client : au repos une simple icône, le champ se
 * déploie au focus ; raccourci ⌘K / Ctrl+K (toggle), navigation aux flèches,
 * Entrée ouvre la fiche pointée, Échap referme.
 */
@Component({
  selector: 'site-doc-search',
  imports: [BillyIconComponent],
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <div class="doc-search" role="search">

      <div class="doc-search-field"
           [class.expanded]="expanded()"
           [class.focused]="focused()"
           [title]="expanded() ? null : shortcutHint"
           (click)="expand()">
        <span class="doc-search-icon">
          <billy-icon name="search" [size]="18" [strokeWidth]="1.9" />
        </span>
        <input #searchInput
               type="search"
               class="doc-search-input"
               placeholder="Rechercher un composant…"
               autocomplete="off"
               role="combobox"
               aria-label="Rechercher un composant"
               aria-autocomplete="list"
               aria-controls="doc-search-listbox"
               [attr.aria-expanded]="open()"
               [attr.aria-activedescendant]="activeDescendantId()"
               [attr.aria-keyshortcuts]="ariaKeyShortcut"
               [value]="term()"
               (input)="onInput($any($event.target).value)"
               (focus)="focused.set(true)"
               (blur)="focused.set(false)"
               (keydown)="onKeydown($event)" />
        @if (term()) {
          <button type="button" class="doc-search-clear" title="Effacer" aria-label="Effacer"
                  (click)="clear(); $event.stopPropagation()"><span aria-hidden="true">×</span></button>
        } @else if (expanded()) {
          <span class="doc-search-kbd" aria-hidden="true">
            @for (key of shortcutKeys; track key) {
              <kbd>{{ key }}</kbd>
            }
          </span>
        }
      </div>

      @if (open()) {
        <div class="doc-search-panel" id="doc-search-listbox" role="listbox" aria-label="Fiches composants">
          @if (hits().length === 0) {
            <div class="doc-search-none">Aucune fiche ne correspond à « {{ term() }} »</div>
          }
          @for (hit of hits(); track hit.category.slug + '/' + hit.entry.slug; let i = $index) {
            <button type="button"
                    class="doc-search-row"
                    role="option"
                    [id]="optionId(hit)"
                    [class.active]="activeIndex() === i"
                    [attr.aria-selected]="activeIndex() === i"
                    (mouseenter)="activeIndex.set(i)"
                    (click)="go(hit)">
              <span class="doc-search-cat">{{ hit.category.label }}</span>
              <span class="doc-search-texts">
                <span class="doc-search-label">{{ hit.entry.label }}</span>
                <span class="doc-search-sub">{{ hit.entry.summary }}</span>
              </span>
              <billy-icon class="doc-search-chevron" name="chevron-right" [size]="15" [strokeWidth]="2" />
            </button>
          }
        </div>
      }

    </div>
  `,
  styleUrl: './doc-search.component.scss',
})
export class DocSearchComponent {

  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  readonly term = signal('');
  readonly focused = signal(false);
  readonly activeIndex = signal(0);

  /** Plateforme Apple : libellé du raccourci (⌘ vs Ctrl) + aria-keyshortcuts. */
  readonly isMac = typeof navigator !== 'undefined'
    && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  readonly shortcutKeys = this.isMac ? ['⌘', 'K'] : ['Ctrl', 'K'];
  readonly shortcutHint = this.isMac ? 'Rechercher (⌘K)' : 'Rechercher (Ctrl+K)';
  readonly ariaKeyShortcut = this.isMac ? 'Meta+K' : 'Control+K';

  /** Au repos, une simple icône ; déployé dès le focus ou une saisie en cours. */
  readonly expanded = computed(() => this.focused() || this.term().trim().length > 0);

  readonly hits = computed<SearchHit[]>(() => {
    const query = this.term().trim().toLowerCase();
    if (query.length < 2) { return []; }
    // Score : nom de la fiche (préfixe puis inclusion) > tags > résumé/catégorie.
    const scored: { hit: SearchHit; score: number }[] = [];
    for (const category of DOC_CATEGORIES) {
      for (const entry of category.entries) {
        const label = entry.label.toLowerCase();
        const tags = (entry.tags ?? []).join(' ').toLowerCase();
        const rest = `${entry.summary} ${category.label}`.toLowerCase();
        const score =
          label.startsWith(query) ? 0 :
          label.includes(query) ? 1 :
          tags.includes(query) ? 2 :
          rest.includes(query) ? 3 : -1;
        if (score >= 0) {
          scored.push({ hit: { category, entry }, score });
        }
      }
    }
    return scored.sort((a, b) => a.score - b.score).slice(0, 8).map(s => s.hit);
  });

  readonly open = computed(() => this.term().trim().length >= 2);

  readonly activeDescendantId = computed<string | null>(() => {
    const hit = this.hits()[this.activeIndex()];
    return hit ? this.optionId(hit) : null;
  });

  optionId(hit: SearchHit): string {
    return `doc-search-opt-${hit.category.slug}-${hit.entry.slug}`;
  }

  /** ⌘K / Ctrl+K : focalise le champ ; un second appui referme et rend le focus. */
  onGlobalKeydown(event: KeyboardEvent): void {
    const isShortcut = (event.metaKey || event.ctrlKey)
      && !event.altKey && !event.shiftKey
      && (event.key === 'k' || event.key === 'K');
    if (!isShortcut) { return; }

    event.preventDefault();
    const input = this.inputRef().nativeElement;
    if (document.activeElement === input) {
      this.clear();
      input.blur();
    } else {
      input.focus();
      input.select();
    }
  }

  /** Fermeture au clic extérieur (le panneau et le champ vivent dans l'hôte). */
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!target.isConnected) { return; }
    if (this.open() && !this.host.nativeElement.contains(target)) {
      this.clear();
    }
  }

  expand(): void {
    this.inputRef().nativeElement.focus();
  }

  onInput(value: string): void {
    this.term.set(value);
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.hits().length;
    switch (event.key) {
      case 'ArrowDown':
        if (count) {
          event.preventDefault();
          this.activeIndex.update(index => (index + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (count) {
          event.preventDefault();
          this.activeIndex.update(index => (index - 1 + count) % count);
        }
        break;
      case 'Enter': {
        const hit = this.hits()[this.activeIndex()] ?? this.hits()[0];
        if (hit) { this.go(hit); }
        break;
      }
      case 'Escape':
        this.clear();
        this.inputRef().nativeElement.blur();
        break;
    }
  }

  go(hit: SearchHit): void {
    this.clear();
    this.inputRef().nativeElement.blur();
    void this.router.navigate(['/c', hit.category.slug, hit.entry.slug]);
  }

  clear(): void {
    this.term.set('');
    this.activeIndex.set(0);
  }

}
