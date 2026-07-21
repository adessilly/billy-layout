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

/** Tab definition for controlled mode (without projected <billy-tab>). */
export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  /** Optional FontAwesome icon class (e.g. "fa-solid fa-user"). */
  icon?: string;
}

/**
 * BILLy in-house tab bar (independent from ad-tabs).
 * Rounded segmented control aligned with the brand (cyan accent --billy-*).
 *
 * Two modes:
 *  - Projected: <billy-tab> elements in the content; the panels stay mounted,
 *    only their visibility toggles.
 *      <billy-tabs>
 *        <billy-tab label="Entry" icon="fa-solid fa-user"> … </billy-tab>
 *      </billy-tabs>
 *  - Controlled (headless): the bar alone, selection managed by the parent.
 *    Handy in a page header where the content lives elsewhere.
 *      <billy-tabs [items]="tabItems" [selected]="tab()" (selectedChange)="tab.set($event)" />
 *
 * Responsive: when space runs out (narrow viewport or container overflow)
 * and all tabs have an icon, the labels of inactive tabs collapse
 * smoothly — only the active tab keeps its own. As a last resort the bar
 * scrolls horizontally with side fades.
 * The active pill slides from one tab to another (animated indicator).
 */
@Component({
  selector: 'billy-tabs',
  imports: [],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent<T extends string = string> {

  /** Controlled mode: tabs described by input instead of projected <billy-tab>. */
  readonly items = input<TabItem<T>[] | null>(null);
  /** Controlled mode: id of the selected tab (controlled by the parent). */
  readonly selected = input<T | null>(null);
  readonly selectedChange = output<T>();
  /** 'sm': dense variant for header bars. */
  readonly size = input<'md' | 'sm'>('md');

  readonly tabs = contentChildren(TabComponent);

  private readonly internalIndex = signal(0);

  readonly headless = computed(() => this.items() !== null);

  /** Labels/icons shown in the bar, whatever the mode. */
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

  // ── Responsive: collapsing of inactive labels ─────────────────────────────
  // Collapsing only makes sense if every tab keeps a visible icon.
  private readonly collapsible = computed(() =>
    this.defs().length > 1 && this.defs().every(d => d.icon));

  private readonly mediaNarrow = signal(false);
  // Anti-overflow "ratchet": engaged when the bar overflows its container,
  // released when the viewport gains room again (reliable proxy — available
  // space cannot be measured from a fit-content container).
  private readonly overflowCompact = signal(false);
  private ratchetWidth = 0;

  readonly compact = computed(() =>
    this.collapsible() && (this.mediaNarrow() || this.overflowCompact()));

  // ── Sliding indicator & scroll fades ──────────────────────────────────────
  private readonly destroyRef = inject(DestroyRef);
  private readonly barRef = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly btnRefs = viewChildren<ElementRef<HTMLButtonElement>>('btn');

  readonly indicator = signal({ x: 0, y: 0, w: 0, h: 0 });
  /** False until the first measurement has happened (avoids a slide on load). */
  readonly indicatorReady = signal(false);
  readonly indicatorTransform = computed(() =>
    `translate3d(${this.indicator().x}px, ${this.indicator().y}px, 0)`);

  readonly fadeLeft = signal(false);
  readonly fadeRight = signal(false);

  private resizeObserver: ResizeObserver | null = null;
  private lastScrolledIndex = -1;

  constructor() {
    // Syncs the active state onto each projected panel.
    effect(() => {
      const active = this.activeIndex();
      this.tabs().forEach((tab, i) => tab.active.set(i === active));
    });

    afterNextRender(() => this.setupObservers());

    // Re-measures after each render affected by these states.
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
      // The viewport has widened since the ratchet engaged: retry the expanded
      // mode (measure() re-engages the ratchet if it still overflows).
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
        // One frame of delay so the first position paints without a transition.
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
