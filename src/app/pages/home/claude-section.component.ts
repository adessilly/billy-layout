import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { BillyIconComponent } from 'billy-layout';
import { DOC_ENTRY_COUNT } from '../../site/doc-registry';

/** Line to add to the consuming application's CLAUDE.md. */
const CLAUDE_IMPORT_LINE = '@node_modules/billy-layout/docs/claude.md';

/**
 * "AI assistant" section of the home page: a CLAUDE.md editor where the
 * embedded-context import line types itself, linked by an animated SVG flow
 * to the knowledge the assistant gains (component doc pages, UX guidelines,
 * tokens). The animations start when the section enters the viewport.
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

  /** The section has entered the viewport: start the animations. */
  protected readonly visible = signal(false);

  /** The import line has just been copied (visual feedback + SR announcement). */
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
      .catch(() => { /* clipboard unavailable: no "copied" feedback */ });
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
