import { Component, DestroyRef, ElementRef, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { DatepickerCalendarComponent } from './datepicker-calendar.component';

interface PanelPosition {
  top: number;
  bottom: number;
  left: number;
  openUp: boolean;
}

/**
 * Standalone date field (no bootstrap, no application dependency):
 * - ControlValueAccessor → [ngModel] / formControlName; the model is a
 *   'yyyy-MM-dd' string (or null when empty/invalid), like the legacy
 *   app-input-datepicker based on bsDatepicker.
 * - manual dd/mm/yyyy input + calendar (billy-datepicker-calendar).
 * - desktop: popover anchored in position: fixed (escapes overflow parents);
 *   mobile ≤640px: full-width bottom sheet with a dimmed backdrop.
 */
@Component({
  selector: 'billy-datepicker',
  imports: [DatepickerCalendarComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerComponent),
    multi: true
  }],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements ControlValueAccessor {

  protected readonly i18n = inject(BillyI18nService);

  readonly invalid = input(false);
  readonly placeholder = input('dd/mm/yyyy');
  readonly ariaLabel = input<string>();
  readonly locale = input<string>();

  /** The input always wins; otherwise the dictionary of the active locale. */
  protected readonly ariaLabelText = computed(() => this.ariaLabel() ?? this.i18n.strings().datepicker.ariaLabel);
  protected readonly localeText = computed(() => this.locale() ?? this.i18n.strings().datepicker.dateLocale);

  /** Selected date (internal model, at local midnight). */
  readonly value = signal<Date | null>(null);
  /** Text shown in the field (may be a partial entry). */
  readonly text = signal('');
  readonly isOpen = signal(false);
  readonly isMobile = signal(false);
  readonly panelPos = signal<PanelPosition>({ top: 0, bottom: 0, left: 0, openUp: false });
  private readonly disabledFromForm = signal(false);
  readonly isDisabled = computed(() => this.disabledFromForm());

  private onChangeCallback: (v: string | null) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fieldEl = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly panelEl = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.removeGlobalListeners());
  }

  // ── Manual entry ────────────────────────────────────────────────────────────

  onInput(raw: string): void {
    this.text.set(raw);
    const parsed = this.parseText(raw);
    this.value.set(parsed);
    this.onChangeCallback(parsed ? this.toIso(parsed) : null);
  }

  onBlur(): void {
    const value = this.value();
    if (value) { this.text.set(this.formatDate(value)); }
    this.onTouchedCallback();
  }

  onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && !this.isOpen()) {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  // ── Opening / closing the calendar ──────────────────────────────────────────

  toggle(): void {
    this.isOpen() ? this.close(true) : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.isOpen()) { return; }
    this.isMobile.set(window.matchMedia('(max-width: 640px)').matches);
    if (!this.isMobile()) {
      this.updatePanelPosition();
      window.addEventListener('scroll', this.onViewportChange, true);
      window.addEventListener('resize', this.onViewportChange);
    }
    this.isOpen.set(true);
    document.addEventListener('click', this.onDocumentClick);
  }

  close(focusField = false): void {
    if (!this.isOpen()) { return; }
    this.isOpen.set(false);
    this.removeGlobalListeners();
    this.onTouchedCallback();
    if (focusField) { this.fieldEl().nativeElement.focus(); }
  }

  onDatePicked(date: Date): void {
    this.value.set(date);
    this.text.set(this.formatDate(date));
    this.onChangeCallback(this.toIso(date));
    this.close(true);
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    } else if (event.key === 'Tab') {
      if (this.isMobile()) {
        this.trapFocus(event);
      } else {
        // desktop popover: Tab returns focus to the field and closes
        event.preventDefault();
        this.close(true);
      }
    }
  }

  private readonly onDocumentClick = (event: MouseEvent) => {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  };

  private removeGlobalListeners(): void {
    document.removeEventListener('click', this.onDocumentClick);
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
  }

  // ── Popover positioning (desktop) ───────────────────────────────────────────

  /** The panel is position: fixed — we follow the field on scroll/resize. */
  private readonly onViewportChange = () => this.updatePanelPosition();

  private updatePanelPosition(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const panelWidth = 300;
    const panelMaxHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelMaxHeight && rect.top > spaceBelow;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8));
    this.panelPos.set({
      top: rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      left,
      openUp
    });
  }

  // ── Mobile sheet: focus trap ────────────────────────────────────────────────

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.panelEl()?.nativeElement;
    if (!panel) { return; }
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"])')
    );
    if (!focusables.length) { return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // ── Text ↔ date conversion ──────────────────────────────────────────────────

  /** Accepts dd/mm/yyyy (separators / - .), a 2-digit year meaning 20xx. */
  private parseText(raw: string): Date | null {
    const match = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/);
    if (!match) { return null; }
    const year = match[3].length === 2 ? 2000 + +match[3] : +match[3];
    return this.buildDate(year, +match[2], +match[1]);
  }

  /** Builds a local date, rejecting overflows (31/02…). */
  private buildDate(year: number, month: number, day: number): Date | null {
    const date = new Date(year, month - 1, day);
    const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return valid ? date : null;
  }

  private formatDate(date: Date): string {
    return `${this.pad(date.getDate())}/${this.pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private pad(n: number): string {
    return ('' + n).padStart(2, '0');
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  writeValue(v: string | Date | null): void {
    const parsed = this.parseModel(v);
    this.value.set(parsed);
    this.text.set(parsed ? this.formatDate(parsed) : '');
  }

  /** The parent provides 'yyyy-MM-dd' (possibly followed by a time) or a Date. */
  private parseModel(v: string | Date | null): Date | null {
    if (v instanceof Date && !isNaN(v.getTime())) {
      return new Date(v.getFullYear(), v.getMonth(), v.getDate());
    }
    if (typeof v === 'string') {
      const match = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) { return this.buildDate(+match[1], +match[2], +match[3]); }
    }
    return null;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromForm.set(isDisabled);
    if (isDisabled) { this.close(); }
  }

}
