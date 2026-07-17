import { Component, DestroyRef, ElementRef, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatepickerCalendarComponent } from './datepicker-calendar.component';

interface PanelPosition {
  top: number;
  bottom: number;
  left: number;
  openUp: boolean;
}

/**
 * Champ date autonome (sans bootstrap ni dépendance applicative) :
 * - ControlValueAccessor → [ngModel] / formControlName ; le modèle est une
 *   chaîne 'yyyy-MM-dd' (ou null si vide/invalide), comme l'ancien
 *   app-input-datepicker basé sur bsDatepicker.
 * - saisie manuelle jj/mm/aaaa + calendrier (billy-datepicker-calendar).
 * - desktop : popover ancré en position fixed (échappe aux overflow parents) ;
 *   mobile ≤640px : feuille plein écran en bas avec fond assombri.
 */
@Component({
  selector: 'billy-datepicker',
  standalone: true,
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

  readonly invalid = input(false);
  readonly placeholder = input('jj/mm/aaaa');
  readonly ariaLabel = input('Date');
  readonly locale = input('fr-FR');

  /** Date sélectionnée (modèle interne, à minuit locale). */
  readonly value = signal<Date | null>(null);
  /** Texte affiché dans le champ (peut être une saisie partielle). */
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

  // ── Saisie manuelle ─────────────────────────────────────────────────────────

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

  // ── Ouverture / fermeture du calendrier ─────────────────────────────────────

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
        // popover desktop : Tab rend le focus au champ et referme
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

  // ── Positionnement du popover (desktop) ─────────────────────────────────────

  /** Le panneau est en position fixed : on suit le champ au scroll/resize. */
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

  // ── Feuille mobile : piège à focus ──────────────────────────────────────────

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

  // ── Conversion texte ↔ date ─────────────────────────────────────────────────

  /** Accepte jj/mm/aaaa (séparateurs / - .), l'année sur 2 chiffres = 20xx. */
  private parseText(raw: string): Date | null {
    const match = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/);
    if (!match) { return null; }
    const year = match[3].length === 2 ? 2000 + +match[3] : +match[3];
    return this.buildDate(year, +match[2], +match[1]);
  }

  /** Construit une date locale en refusant les débordements (31/02…). */
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

  /** Le parent fournit 'yyyy-MM-dd' (éventuellement suivi d'une heure) ou une Date. */
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
