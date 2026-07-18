import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { DOC_ENTRY_COUNT } from '../../site/doc-registry';

/** Commandes copiables présentées dans la section installation. */
const COMMANDS = {
  npm: 'npm install billy-layout',
  git: 'git clone git@bitbucket.org:comptabilly/billy-layout.git',
} as const;

type CommandKey = keyof typeof COMMANDS;

/**
 * Section « installation » de l'accueil : deux terminaux animés (npm install
 * et git clone) avec copie de la commande en un clic. Les animations — frappe
 * de la commande, sortie, pictogrammes SVG qui se dessinent — démarrent quand
 * la section entre dans le viewport.
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

  /** La section est entrée dans le viewport : lance les animations. */
  protected readonly visible = signal(false);

  /** Clé de la dernière commande copiée (retour visuel + annonce SR). */
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
