import { Component, ElementRef, afterRenderEffect, computed, inject, input, output, signal } from '@angular/core';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  ariaLabel: string;
}

/**
 * Grille calendrier autonome (aucune dépendance applicative) : vue jours et
 * vue mois, navigation clavier complète (pattern ARIA grid, roving tabindex),
 * libellés générés via Intl à partir de l'input [locale].
 * Thème par tokens CSS --billy-* avec valeurs de repli — utilisable hors app.
 */
@Component({
  selector: 'billy-datepicker-calendar',
  standalone: true,
  templateUrl: './datepicker-calendar.component.html',
  styleUrls: ['./datepicker-calendar.component.scss']
})
export class DatepickerCalendarComponent {

  readonly selected = input<Date | null>(null);
  readonly locale = input('fr-FR');
  /** Donne le focus au jour actif dès le premier rendu (calendrier ouvert en popup). */
  readonly autofocusDay = input(false);

  readonly datePicked = output<Date>();

  readonly view = signal<'days' | 'months'>('days');
  /** Mois affiché quand l'utilisateur a navigué ; sinon dérivé de selected/aujourd'hui. */
  private readonly navMonth = signal<{ year: number, month: number } | null>(null);
  /** Jour ciblé par la navigation clavier (roving tabindex). */
  private readonly focusOverride = signal<Date | null>(null);
  private readonly monthFocus = signal<number | null>(null);

  /** Incrémenté à chaque demande de focus ; consommé après le rendu (zoneless : pas de setTimeout fiable). */
  private readonly focusRequest = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly today = this.stripTime(new Date());

  constructor() {
    afterRenderEffect(() => {
      if (this.focusRequest() === 0 && !this.autofocusDay()) { return; }
      this.host.nativeElement.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    });
  }

  readonly viewMonth = computed(() => {
    const nav = this.navMonth();
    if (nav) { return nav; }
    const base = this.selected() ?? this.today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  /** Titre de l'en-tête : « Juillet 2026 » en vue jours, « 2026 » en vue mois. */
  readonly title = computed(() => {
    const { year, month } = this.viewMonth();
    if (this.view() === 'months') { return '' + year; }
    const label = new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' })
      .format(new Date(year, month, 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  /** Semaine commençant le lundi (le 5 janvier 2026 est un lundi). */
  readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(2026, 0, 5 + i);
      return { short: short.format(day).replace('.', '').slice(0, 2), long: long.format(day) };
    });
  });

  readonly monthNames = computed(() => {
    const format = new Intl.DateTimeFormat(this.locale(), { month: 'short' });
    return Array.from({ length: 12 }, (_, m) => format.format(new Date(2026, m, 1)).replace('.', ''));
  });

  /** Jour porteur du tabindex 0 : navigation clavier, sinon sélection, sinon aujourd'hui, sinon le 1er. */
  readonly focusDate = computed(() => {
    const { year, month } = this.viewMonth();
    const inView = (d: Date | null) => d !== null && d.getFullYear() === year && d.getMonth() === month;
    const override = this.focusOverride();
    if (inView(override)) { return override!; }
    const selected = this.selected();
    if (inView(selected)) { return selected!; }
    if (inView(this.today)) { return this.today; }
    return new Date(year, month, 1);
  });

  readonly monthTabIndex = computed(() => this.monthFocus() ?? this.viewMonth().month);

  readonly weeks = computed<CalendarDay[][]>(() => {
    const { year, month } = this.viewMonth();
    const ariaFormat = new Intl.DateTimeFormat(this.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const selected = this.selected();
    const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const weeks: CalendarDay[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(year, month, 1 - firstOffset + w * 7 + d);
        week.push({
          date,
          inMonth: date.getMonth() === month,
          isToday: this.isSameDay(date, this.today),
          isSelected: selected !== null && this.isSameDay(date, selected),
          ariaLabel: ariaFormat.format(date)
        });
      }
      weeks.push(week);
    }
    return weeks;
  });

  isFocusTarget(date: Date): boolean {
    return this.isSameDay(date, this.focusDate());
  }

  /** Donne le focus à l'élément actif de la vue courante (appelé aussi par le parent à l'ouverture). */
  focusActiveDay(): void {
    this.focusRequest.update(n => n + 1);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  goPrev(): void {
    this.view() === 'days' ? this.shiftMonth(-1) : this.shiftYear(-1);
  }

  goNext(): void {
    this.view() === 'days' ? this.shiftMonth(1) : this.shiftYear(1);
  }

  toggleView(): void {
    this.monthFocus.set(null);
    this.view.set(this.view() === 'days' ? 'months' : 'days');
  }

  showDays(): void {
    this.view.set('days');
    this.focusActiveDay();
  }

  pickMonth(month: number): void {
    this.navMonth.set({ year: this.viewMonth().year, month });
    this.showDays();
  }

  private shiftMonth(delta: number): void {
    const { year, month } = this.viewMonth();
    const target = new Date(year, month + delta, 1);
    this.navMonth.set({ year: target.getFullYear(), month: target.getMonth() });
  }

  private shiftYear(delta: number): void {
    const { year, month } = this.viewMonth();
    this.navMonth.set({ year: year + delta, month });
  }

  // ── Sélection ───────────────────────────────────────────────────────────────

  pickDay(date: Date): void {
    this.datePicked.emit(this.stripTime(date));
  }

  pickToday(): void {
    this.datePicked.emit(this.today);
  }

  // ── Clavier ─────────────────────────────────────────────────────────────────

  onGridKeydown(event: KeyboardEvent): void {
    const current = this.focusDate();
    let target: Date;
    switch (event.key) {
      case 'ArrowLeft': target = this.addDays(current, -1); break;
      case 'ArrowRight': target = this.addDays(current, 1); break;
      case 'ArrowUp': target = this.addDays(current, -7); break;
      case 'ArrowDown': target = this.addDays(current, 7); break;
      case 'Home': target = this.addDays(current, -((current.getDay() + 6) % 7)); break;
      case 'End': target = this.addDays(current, 6 - ((current.getDay() + 6) % 7)); break;
      case 'PageUp': target = this.addMonths(current, event.shiftKey ? -12 : -1); break;
      case 'PageDown': target = this.addMonths(current, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    this.navMonth.set({ year: target.getFullYear(), month: target.getMonth() });
    this.focusOverride.set(target);
    this.focusActiveDay();
  }

  /** En vue mois, Escape revient aux jours au lieu de fermer le datepicker (capté à la racine). */
  onCalendarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.view() === 'months') {
      event.preventDefault();
      event.stopPropagation();
      this.showDays();
    }
  }

  onMonthsKeydown(event: KeyboardEvent): void {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    const delta = deltas[event.key];
    if (delta === undefined) { return; }
    event.preventDefault();
    this.monthFocus.set(Math.min(11, Math.max(0, this.monthTabIndex() + delta)));
    this.focusActiveDay();
  }

  // ── Dates ───────────────────────────────────────────────────────────────────

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, delta: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
  }

  private addMonths(date: Date, delta: number): Date {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + delta + 1, 0).getDate();
    return new Date(date.getFullYear(), date.getMonth() + delta, Math.min(date.getDate(), lastDay));
  }

}
