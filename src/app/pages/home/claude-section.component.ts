import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { BillyIconComponent } from 'billy-layout';
import { DOC_ENTRY_COUNT } from '../../site/doc-registry';

/** Ligne à ajouter dans le CLAUDE.md de l'application consommatrice. */
const CLAUDE_IMPORT_LINE = '@node_modules/billy-layout/docs/claude.md';

/**
 * Section « assistant IA » de l'accueil : un éditeur CLAUDE.md où la ligne
 * d'import du contexte embarqué se tape toute seule, reliée par un flux SVG
 * animé aux connaissances que l'assistant acquiert (fiches composants,
 * guidelines UX, tokens). Les animations démarrent à l'entrée dans le viewport.
 */
@Component({
  selector: 'site-claude-section',
  imports: [BillyIconComponent],
  templateUrl: './claude-section.component.html',
  styleUrl: './claude-section.component.scss',
  host: { '[class.is-visible]': 'visible()' },
})
export class ClaudeSectionComponent {

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly entryCount = DOC_ENTRY_COUNT;
  protected readonly importLine = CLAUDE_IMPORT_LINE;

  /** La section est entrée dans le viewport : lance les animations. */
  protected readonly visible = signal(false);

  /** La ligne d'import vient d'être copiée (retour visuel + annonce SR). */
  protected readonly copied = signal(false);

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => this.observeViewport());
    this.destroyRef.onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected copy(): void {
    navigator.clipboard?.writeText(CLAUDE_IMPORT_LINE)
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.copied.set(false), 2200);
      })
      .catch(() => { /* presse-papiers indisponible : pas de retour "copié" */ });
  }

  private observeViewport(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.visible.set(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

}
