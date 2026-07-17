import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TabComponent } from './tab.component';

/** Définition d'un onglet en mode piloté (sans <billy-tab> projetés). */
export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  /** Classe d'icône FontAwesome optionnelle (ex. "fa-solid fa-user"). */
  icon?: string;
}

/**
 * Barre d'onglets « maison » BILLy (indépendante de ad-tabs).
 * Segmented control arrondi aligné sur la charte (accent cyan --billy-*).
 *
 * Deux modes :
 *  - Projeté : des <billy-tab> dans le contenu ; les panneaux restent montés,
 *    seul l'affichage bascule.
 *      <billy-tabs>
 *        <billy-tab label="Encodage" icon="fa-solid fa-user"> … </billy-tab>
 *      </billy-tabs>
 *  - Piloté (headless) : la barre seule, sélection gérée par le parent.
 *    Pratique dans un en-tête de page où le contenu vit ailleurs.
 *      <billy-tabs [items]="tabItems" [selected]="tab()" (selectedChange)="tab.set($event)" />
 *
 * Responsive : quand la place manque (viewport étroit ou débordement du
 * conteneur) et que tous les onglets ont une icône, les libellés des onglets
 * inactifs se replient en douceur — seul l'onglet actif garde le sien. En
 * dernier recours la barre défile horizontalement avec des fondus latéraux.
 * La pastille active glisse d'un onglet à l'autre (indicateur animé).
 */
@Component({
  selector: 'billy-tabs',
  standalone: true,
  imports: [],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent<T extends string = string> {

  /** Mode piloté : onglets décrits par input au lieu de <billy-tab> projetés. */
  readonly items = input<TabItem<T>[] | null>(null);
  /** Mode piloté : id de l'onglet sélectionné (contrôlé par le parent). */
  readonly selected = input<T | null>(null);
  readonly selectedChange = output<T>();
  /** 'sm' : variante dense pour les barres d'en-tête. */
  readonly size = input<'md' | 'sm'>('md');

  readonly tabs = contentChildren(TabComponent);

  private readonly internalIndex = signal(0);

  readonly headless = computed(() => this.items() !== null);

  /** Libellés/icônes affichés dans la barre, quel que soit le mode. */
  readonly defs = computed<{ label: string; icon: string }[]>(() => {
    const items = this.items();
    if (items) return items.map(t => ({ label: t.label, icon: t.icon ?? '' }));
    return this.tabs().map(t => ({ label: t.label(), icon: t.icon() }));
  });

  readonly activeIndex = computed(() => {
    const items = this.items();
    if (items) {
      const i = items.findIndex(t => t.id === this.selected());
      return i < 0 ? 0 : i;
    }
    return this.internalIndex();
  });

  // ── Responsive : repli des libellés inactifs ──────────────────────────────
  // Le repli n'a de sens que si chaque onglet garde une icône visible.
  private readonly collapsible = computed(() =>
    this.defs().length > 1 && this.defs().every(d => d.icon));

  private readonly mediaNarrow = signal(false);
  // « Cliquet » anti-débordement : posé quand la barre déborde de son
  // conteneur, relâché quand le viewport regagne de la place (proxy fiable —
  // la place disponible n'est pas mesurable depuis un conteneur fit-content).
  private readonly overflowCompact = signal(false);
  private ratchetWidth = 0;

  readonly compact = computed(() =>
    this.collapsible() && (this.mediaNarrow() || this.overflowCompact()));

  // ── Indicateur coulissant & fondus de défilement ──────────────────────────
  private readonly destroyRef = inject(DestroyRef);
  private readonly barRef = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly btnRefs = viewChildren<ElementRef<HTMLButtonElement>>('btn');

  readonly indicator = signal({ x: 0, y: 0, w: 0, h: 0 });
  /** Faux tant que la première mesure n'a pas eu lieu (évite un glissement au chargement). */
  readonly indicatorReady = signal(false);
  readonly indicatorTransform = computed(() =>
    `translate3d(${this.indicator().x}px, ${this.indicator().y}px, 0)`);

  readonly fadeLeft = signal(false);
  readonly fadeRight = signal(false);

  private resizeObserver: ResizeObserver | null = null;
  private lastScrolledIndex = -1;

  constructor() {
    // Synchronise l'état actif sur chaque panneau projeté.
    effect(() => {
      const active = this.activeIndex();
      this.tabs().forEach((tab, i) => tab.active.set(i === active));
    });

    afterNextRender(() => this.setupObservers());

    // Re-mesure après chaque rendu impacté par ces états.
    afterRenderEffect(() => {
      this.defs();
      this.activeIndex();
      this.compact();
      this.size();
      const buttons = this.btnRefs();
      const ro = this.resizeObserver;
      if (ro) {
        ro.disconnect();
        ro.observe(this.barRef().nativeElement);
        buttons.forEach(b => ro.observe(b.nativeElement));
      }
      this.measure();
    });
  }

  select(index: number): void {
    const items = this.items();
    if (items) {
      const item = items[index];
      if (item) this.selectedChange.emit(item.id);
    } else {
      this.internalIndex.set(index);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.defs().length;
    if (!count) return;
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowRight': next = (this.activeIndex() + 1) % count; break;
      case 'ArrowLeft':  next = (this.activeIndex() - 1 + count) % count; break;
      case 'Home':       next = 0; break;
      case 'End':        next = count - 1; break;
    }
    if (next === null) return;
    event.preventDefault();
    this.select(next);
    this.btnRefs()[next]?.nativeElement.focus();
  }

  updateFades(): void {
    const bar = this.barRef().nativeElement;
    const maxScroll = bar.scrollWidth - bar.clientWidth;
    this.fadeLeft.set(bar.scrollLeft > 2);
    this.fadeRight.set(maxScroll - bar.scrollLeft > 2);
  }

  private setupObservers(): void {
    const mq = window.matchMedia('(max-width: 768px)');
    this.mediaNarrow.set(mq.matches);
    const onMedia = (e: MediaQueryListEvent) => this.mediaNarrow.set(e.matches);
    mq.addEventListener('change', onMedia);

    const onWindowResize = () => {
      // Le viewport s'est élargi depuis le cliquet : on retente le mode étendu
      // (measure() re-serre le cliquet si ça déborde toujours).
      if (this.overflowCompact() && window.innerWidth > this.ratchetWidth + 16) {
        this.overflowCompact.set(false);
      }
    };
    window.addEventListener('resize', onWindowResize);

    this.resizeObserver = new ResizeObserver(() => this.measure());

    this.destroyRef.onDestroy(() => {
      mq.removeEventListener('change', onMedia);
      window.removeEventListener('resize', onWindowResize);
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
    });
  }

  private measure(): void {
    const bar = this.barRef().nativeElement;

    if (!this.compact() && this.collapsible() && bar.scrollWidth > bar.clientWidth + 1) {
      this.ratchetWidth = window.innerWidth;
      this.overflowCompact.set(true);
    }

    const active = this.activeIndex();
    const btn = this.btnRefs()[active]?.nativeElement;
    if (btn) {
      const next = { x: btn.offsetLeft, y: btn.offsetTop, w: btn.offsetWidth, h: btn.offsetHeight };
      const cur = this.indicator();
      if (cur.x !== next.x || cur.y !== next.y || cur.w !== next.w || cur.h !== next.h) {
        this.indicator.set(next);
      }
      if (!this.indicatorReady() && next.w > 0) {
        // Un cadre de délai pour que la première position se peigne sans transition.
        requestAnimationFrame(() => this.indicatorReady.set(true));
      }
      if (this.lastScrolledIndex !== active) {
        this.lastScrolledIndex = active;
        this.scrollActiveIntoView(bar, btn);
      }
    }

    this.updateFades();
  }

  private scrollActiveIntoView(bar: HTMLElement, btn: HTMLElement): void {
    const maxScroll = bar.scrollWidth - bar.clientWidth;
    if (maxScroll <= 0) return;
    const target = Math.max(0, Math.min(maxScroll,
      btn.offsetLeft - (bar.clientWidth - btn.offsetWidth) / 2));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bar.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  }
}
