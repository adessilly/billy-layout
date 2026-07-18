import { Component, ElementRef, computed, forwardRef, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClickOutsideDirective } from '../../core/click-outside/click-outside.directive';
import { BillyIconComponent } from '../../core/icon/billy-icon.component';

/** Option du dropdown — structurellement compatible avec l'ancien AdSelectElement (ad-library). */
export interface DropdownOption {
  text: string;
  id: string;
  value?: any;
}

interface DropdownViewItem {
  option: DropdownOption;
  /** Segments de mise en évidence de la recherche (null si pas de recherche active). */
  seg: { before: string, match: string, after: string } | null;
}

interface PanelPosition {
  top: number;
  bottom: number;
  left: number;
  width: number;
  openUp: boolean;
}

/**
 * Remplaçant maison de <ad-select> (select2/jquery), rétro-compatible :
 * - ControlValueAccessor → utilisable avec [ngModel] et formControlName
 * - [values] : mêmes options {id, text, value}
 * - le modèle reçoit option.value si défini, sinon l'option elle-même
 * - sans valeur, la première option est affichée (comportement select2)
 * - mode multi (tags supprimables) si le modèle est un tableau (parité select2)
 *   ou si [multiple]="true" ; le modèle est alors un tableau de valeurs
 */
@Component({
  selector: 'billy-dropdown',
  imports: [ClickOutsideDirective, BillyIconComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements ControlValueAccessor {

  readonly values = input<DropdownOption[]>([]);
  readonly id = input<string>('');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly searchable = input(true);
  readonly autofocusSearch = input(true);
  readonly placeholder = input('');
  readonly multiple = input(false);

  readonly selectionChange = output<any>();

  private readonly innerValue = signal<any>(undefined);
  private readonly disabledFromForm = signal(false);
  readonly isOpen = signal(false);
  readonly searchText = signal('');
  readonly activeIndex = signal(0);
  readonly panelPos = signal<PanelPosition>({ top: 0, bottom: 0, left: 0, width: 0, openUp: false });

  private onChangeCallback: (v: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  private readonly triggerEl = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly listEl = viewChild<ElementRef<HTMLElement>>('list');

  readonly isDisabled = computed(() => this.readonly() || this.disabledFromForm());

  /** Multi si demandé explicitement, ou si le modèle est un tableau (parité ad-select). */
  readonly isMulti = computed(() => this.multiple() || Array.isArray(this.innerValue()));

  /** Option correspondant au modèle, sinon la première option (parité select2), sinon null. */
  readonly selectedOption = computed<DropdownOption | null>(() => {
    if (this.isMulti()) { return null; }
    const options = this.values() ?? [];
    const val = this.innerValue();
    if (val !== null && val !== undefined) {
      const id = this.modelToId(val);
      const match = options.find(o => '' + o.id === id);
      if (match) { return match; }
    }
    return options.length ? options[0] : null;
  });

  /** Options correspondant aux valeurs du modèle en mode multi (tags). */
  readonly selectedOptions = computed<DropdownOption[]>(() => {
    const val = this.innerValue();
    if (!Array.isArray(val)) { return []; }
    const options = this.values() ?? [];
    return val
      .map(v => options.find(o => '' + o.id === this.modelToId(v)))
      .filter((o): o is DropdownOption => !!o);
  });

  /** Ids sélectionnés (mono ou multi), pour marquer les options de la liste. */
  readonly selectedIds = computed<Set<string>>(() => {
    if (this.isMulti()) {
      return new Set(this.selectedOptions().map(o => '' + o.id));
    }
    const selected = this.selectedOption();
    return new Set(selected ? ['' + selected.id] : []);
  });

  /** Options filtrées par la recherche, avec segments de surlignage. */
  readonly filteredView = computed<DropdownViewItem[]>(() => {
    const options = this.values() ?? [];
    const needle = this.normalize(this.searchText().trim());
    if (!needle.length) {
      return options.map(option => ({ option, seg: null }));
    }
    const items: DropdownViewItem[] = [];
    for (const option of options) {
      const chars = Array.from(option.text);
      const hay = chars.map(c => this.stripAccent(c).toLowerCase());
      const idx = this.indexOfSub(hay, needle);
      if (idx < 0) { continue; }
      items.push({
        option,
        seg: {
          before: chars.slice(0, idx).join(''),
          match: chars.slice(idx, idx + needle.length).join(''),
          after: chars.slice(idx + needle.length).join('')
        }
      });
    }
    return items;
  });

  // ── Ouverture / fermeture ──────────────────────────────────────────────────

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.isOpen()) { return; }
    this.searchText.set('');
    this.updatePanelPosition();
    const selected = this.isMulti() ? (this.selectedOptions()[0] ?? null) : this.selectedOption();
    const idx = selected ? (this.values() ?? []).indexOf(selected) : 0;
    this.activeIndex.set(Math.max(idx, 0));
    this.isOpen.set(true);
    window.addEventListener('scroll', this.onViewportChange, true);
    window.addEventListener('resize', this.onViewportChange);
    setTimeout(() => {
      if (this.searchable() && this.autofocusSearch()) {
        this.searchEl()?.nativeElement.focus();
      } else {
        this.listEl()?.nativeElement.focus();
      }
      this.scrollActiveIntoView();
    });
  }

  close(focusTrigger = false): void {
    if (!this.isOpen()) { return; }
    this.isOpen.set(false);
    window.removeEventListener('scroll', this.onViewportChange, true);
    window.removeEventListener('resize', this.onViewportChange);
    this.onTouchedCallback();
    if (focusTrigger) {
      this.triggerEl().nativeElement.focus();
    }
  }

  /** Le panneau est en position fixed : on suit le déclencheur au scroll/resize. */
  private readonly onViewportChange = () => this.updatePanelPosition();

  private updatePanelPosition(): void {
    const rect = this.triggerEl().nativeElement.getBoundingClientRect();
    const panelMaxHeight = 330;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelMaxHeight && rect.top > spaceBelow;
    const effectiveWidth = Math.max(rect.width, 180);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - effectiveWidth - 8));
    this.panelPos.set({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      left,
      width: rect.width,
      openUp
    });
  }

  // ── Sélection ──────────────────────────────────────────────────────────────

  pick(option: DropdownOption): void {
    if (this.isMulti()) {
      this.toggleMultiValue(option);
      return;
    }
    const value = option.value !== undefined ? option.value : option;
    this.commit(value);
    this.close(true);
  }

  /** Multi : ajoute/retire la valeur ; le panneau reste ouvert pour enchaîner les sélections. */
  private toggleMultiValue(option: DropdownOption): void {
    const current: any[] = Array.isArray(this.innerValue()) ? this.innerValue() : [];
    const id = '' + option.id;
    const next = current.some(v => this.modelToId(v) === id)
      ? current.filter(v => this.modelToId(v) !== id)
      : [...current, option.value !== undefined ? option.value : option];
    this.commit(next);
    this.searchText.set('');
    (this.searchEl() ?? this.listEl())?.nativeElement.focus();
  }

  /** Suppression d'un tag depuis le déclencheur, sans ouvrir le panneau. */
  removeValue(option: DropdownOption, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) { return; }
    const current: any[] = Array.isArray(this.innerValue()) ? this.innerValue() : [];
    this.commit(current.filter(v => this.modelToId(v) !== '' + option.id));
    this.onTouchedCallback();
  }

  private commit(value: any): void {
    this.innerValue.set(value);
    this.onChangeCallback(value);
    this.selectionChange.emit(value);
  }

  onSearchInput(text: string): void {
    this.searchText.set(text);
    this.activeIndex.set(0);
  }

  /** Backspace dans une recherche vide : retire le dernier tag (parité select2). */
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace' || this.searchText().length || !this.isMulti()) { return; }
    const last = this.selectedOptions().at(-1);
    if (last) {
      event.preventDefault();
      this.removeValue(last, event);
    }
  }

  // ── Clavier ────────────────────────────────────────────────────────────────

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
      case 'End': {
        const count = this.filteredView().length;
        if (count) {
          event.preventDefault();
          this.activeIndex.set(event.key === 'Home' ? 0 : count - 1);
          this.scrollActiveIntoView();
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const item = this.filteredView()[this.activeIndex()];
        if (item) { this.pick(item.option); }
        break;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close(true);
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private moveActive(delta: number): void {
    const count = this.filteredView().length;
    if (!count) { return; }
    const next = Math.max(0, Math.min(this.activeIndex() + delta, count - 1));
    this.activeIndex.set(next);
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    setTimeout(() => {
      this.listEl()?.nativeElement
        .querySelector('.dropdown-option--active')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  // ── Correspondance modèle ↔ option (parité ad-select) ─────────────────────

  /** Le modèle peut être un id (number/string) ou un objet possédant un id. */
  private modelToId(v: any): string {
    if (typeof v === 'object' && v !== null && v.id !== undefined && v.id !== null) {
      return '' + v.id;
    }
    return '' + v;
  }

  /** Découpe accent-insensible : un caractère normalisé par caractère d'origine. */
  private stripAccent(char: string): string {
    const stripped = char.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return stripped.length === 1 ? stripped : char;
  }

  private normalize(text: string): string[] {
    return Array.from(text).map(c => this.stripAccent(c).toLowerCase());
  }

  private indexOfSub(hay: string[], needle: string[]): number {
    for (let i = 0; i + needle.length <= hay.length; i++) {
      let match = true;
      for (let j = 0; j < needle.length; j++) {
        if (hay[i + j] !== needle[j]) { match = false; break; }
      }
      if (match) { return i; }
    }
    return -1;
  }

  // ── ControlValueAccessor ───────────────────────────────────────────────────

  writeValue(v: any): void {
    this.innerValue.set(v);
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
