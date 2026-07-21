import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { DOC_ENTRY_COUNT } from '../../site/doc-registry';

/** Copyable commands shown in the installation section. */
const COMMANDS = {
  npm: 'npm install billy-layout',
  git: 'git clone https://github.com/adessilly/billy-layout.git',
} as const;

type CommandKey = keyof typeof COMMANDS;

/**
 * "Installation" section of the home page: two animated terminals (npm install
 * and git clone) with one-click command copy. The animations — command typing,
 * output, self-drawing SVG pictograms — start when the section enters the
 * viewport.
 */
@Component({
  selector: 'site-install-section',
  templateUrl: './install-section.component.html',
  styleUrl: './install-section.component.scss',
  host: { '[class.is-visible]': 'visible()' },
})
export class InstallSectionComponent {

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly entryCount = DOC_ENTRY_COUNT;
  protected readonly commands = COMMANDS;

  /** The section has entered the viewport: start the animations. */
  protected readonly visible = signal(false);

  /** Key of the last copied command (visual feedback + SR announcement). */
  protected readonly copied = signal<CommandKey | null>(null);

  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => this.observeViewport());
    this.destroyRef.onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected copy(key: CommandKey): void {
    navigator.clipboard?.writeText(COMMANDS[key])
      .then(() => {
        this.copied.set(key);
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.copied.set(null), 2200);
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
