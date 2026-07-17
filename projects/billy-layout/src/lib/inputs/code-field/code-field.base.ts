import {
  Directive, ElementRef, booleanAttribute, computed, effect, input, signal, viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CodeInfo, isAlnum } from '../../core/utils/code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Socle des champs « code » (n° TVA, IBAN) : un champ masqué.
//
// Le modèle ne voit que la valeur canonique (« BE0690614660 »), le DOM ne
// montre que la valeur formatée (« BE 0690.614.660 »). Entre les deux, à chaque
// frappe : on nettoie (les caractères non autorisés n'entrent jamais), on
// reformate, et on replace le curseur là où il était — en le comptant en
// caractères significatifs, pas en position, sinon les séparateurs le
// décaleraient.
//
// La valeur du DOM est pilotée à la main plutôt que par un binding [value] :
// réécrire l'input à chaque frappe renverrait le curseur à la fin.
//
// ControlValueAccessor → compatible [ngModel], formControlName et la directive
// signal-forms [formField].
// ═══════════════════════════════════════════════════════════════════════════

@Directive()
export abstract class CodeFieldBase implements ControlValueAccessor {

  /** id posé sur l'`<input>` interne, pour qu'un `<label for>` externe le vise. */
  readonly inputId = input('');
  readonly placeholder = input('');
  /** Texte affiché sous le champ tant que rien n'est saisi. */
  readonly hint = input('');
  /**
   * Désactivation statique, en plus de celle portée par le formulaire.
   *
   * Volontairement pas nommée `disabled` : signal-forms réserve ce nom et écrit
   * l'état du champ dans l'input `disabled` de l'hôte *après* les bindings du
   * template — un `disabled` statique serait donc écrasé par le formulaire.
   */
  readonly forceDisabled = input(false, { transform: booleanAttribute });

  /** Valeur canonique, celle qui part au backend. */
  readonly value = signal('');
  /** Valeur affichée, avec ses séparateurs. */
  readonly display = signal('');

  readonly focused = signal(false);
  readonly touched = signal(false);

  private readonly disabledFromForm = signal(false);
  readonly isDisabled = computed(() => this.forceDisabled() || this.disabledFromForm());

  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('codeInput');

  /** Diagnostic du code (état, pays, message, progression) — fourni par le champ concret. */
  abstract readonly info: () => CodeInfo;

  readonly status = computed(() => this.info().status);
  readonly progress = computed(() => this.info().progress);

  /**
   * La bordure ne rougit qu'une fois le champ quitté : pendant la frappe, un
   * numéro incomplet n'est pas une erreur. La pastille d'état, elle, suit la
   * saisie en direct.
   */
  readonly showError = computed(() => this.touched() && this.status() === 'invalid');

  readonly message = computed(() => {
    const info = this.info();
    return info.status === 'empty' ? this.hint() : info.message;
  });

  private static sequence = 0;
  protected readonly uid = `billy-code-${++CodeFieldBase.sequence}`;

  private onChangeCallback: (value: string) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  constructor() {
    // Le champ n'est réécrit que lorsque le DOM diverge du modèle (chargement,
    // reset). Pendant la frappe, il est déjà à jour : on n'y touche pas, donc
    // le curseur ne bouge pas.
    effect(() => {
      const element = this.inputRef()?.nativeElement;
      const text = this.display();
      if (element && element.value !== text) {
        element.value = text;
      }
    });
  }

  /** Forme canonique d'une saisie : tout caractère non autorisé disparaît. */
  protected abstract sanitize(raw: string): string;
  /** Rendu à plat d'une valeur canonique — le masque du champ. */
  protected abstract formatText(value: string): string;
  /** Dernières retouches à la sortie du champ (préfixe pays, zéro de tête…). */
  protected abstract normalize(value: string): string;

  /**
   * Caractère porteur d'information, par opposition au liant que le masque pose
   * lui-même (points, espaces). C'est cette frontière qui fait le curseur : on
   * le repère au nombre de caractères significatifs qui le précèdent, jamais à
   * sa position, que les séparateurs décalent.
   *
   * Par défaut : alphanumérique — le cas des codes (TVA, IBAN). Un champ sans
   * masque (email) élargit la définition, et les branches « effacer par-dessus
   * un séparateur » ci-dessous ne se déclenchent alors jamais.
   */
  protected isSignificant(char: string): boolean {
    return isAlnum(char);
  }

  private countSignificant(text: string): number {
    let count = 0;
    for (const char of text) {
      if (this.isSignificant(char)) { count++; }
    }
    return count;
  }

  onInput(): void {
    const element = this.inputRef()?.nativeElement;
    if (!element) { return; }

    const caret = element.selectionStart ?? element.value.length;
    const typed = this.countSignificant(element.value.slice(0, caret));

    const value = this.sanitize(element.value);
    const text = this.formatText(value);

    element.value = text;
    element.setSelectionRange(...this.caretAfter(text, typed));

    this.display.set(text);
    this.setValue(value);
  }

  /**
   * Effacement au contact d'un séparateur. Sans ça, la touche supprimerait un
   * point que le masque remettrait aussitôt : rien ne disparaîtrait, et le
   * curseur sauterait. On efface donc le caractère significatif que l'utilisateur
   * visait, de l'autre côté du séparateur.
   *
   * Ne concerne que le curseur seul : une sélection s'efface d'elle-même, et
   * `onInput` reformatera le reste.
   */
  onKeydown(event: KeyboardEvent): void {
    const element = this.inputRef()?.nativeElement;
    if (!element) { return; }

    const backspace = event.key === 'Backspace';
    const del = event.key === 'Delete';
    if (!backspace && !del) { return; }

    // Suppression de mot / de ligne (Ctrl, Alt, Cmd) : au navigateur de jouer,
    // `onInput` reformatera ce qu'il en reste.
    if (event.ctrlKey || event.altKey || event.metaKey) { return; }

    const caret = element.selectionStart ?? 0;
    if (caret !== element.selectionEnd) { return; }

    const text = element.value;

    if (backspace) {
      if (caret === 0 || this.isSignificant(text[caret - 1])) { return; }

      let target = caret - 1;
      while (target >= 0 && !this.isSignificant(text[target])) { target--; }
      if (target < 0) { return; }

      event.preventDefault();
      element.value = text.slice(0, target) + text.slice(caret);
      element.setSelectionRange(target, target);
    } else {
      if (caret >= text.length || this.isSignificant(text[caret])) { return; }

      let target = caret;
      while (target < text.length && !this.isSignificant(text[target])) { target++; }
      if (target >= text.length) { return; }

      event.preventDefault();
      element.value = text.slice(0, caret) + text.slice(target + 1);
      element.setSelectionRange(caret, caret);
    }

    this.onInput();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);

    // `normalize` peut allonger la valeur (préfixe pays) : on repasse par
    // `sanitize` pour que le modèle ne sorte jamais des bornes du champ.
    const value = this.sanitize(this.normalize(this.value()));
    this.display.set(this.formatText(value));
    this.setValue(value);

    this.onTouchedCallback();
  }

  /** Position du curseur juste après le `count`-ième caractère significatif. */
  private caretAfter(text: string, count: number): [number, number] {
    let position = 0;
    let seen = 0;

    while (position < text.length && seen < count) {
      if (this.isSignificant(text[position])) { seen++; }
      position++;
    }

    return [position, position];
  }

  /**
   * Écrit une valeur dans le champ comme si elle avait été saisie — le DOM suit
   * par l'effet ci-dessus. Sert aux corrections proposées par le champ lui-même
   * (ex. la faute de frappe d'un domaine email).
   */
  protected setFieldValue(raw: string): void {
    const value = this.sanitize(raw);
    this.display.set(this.formatText(value));
    this.setValue(value);
  }

  private setValue(value: string): void {
    if (value === this.value()) { return; }
    this.value.set(value);
    this.onChangeCallback(value);
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  writeValue(value: unknown): void {
    const raw = value === null || value === undefined ? '' : String(value);
    const clean = this.sanitize(raw);

    this.value.set(clean);
    this.display.set(this.formatText(clean));

    // Valeur « sale » venue du backend : on la renvoie nettoyée au modèle, en
    // différé — écrire pendant que le formulaire écrit lui-même le ferait
    // boucler. Au tour suivant, clean === raw : le cycle s'arrête là.
    if (clean !== raw) {
      queueMicrotask(() => this.onChangeCallback(clean));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromForm.set(isDisabled);
  }

}
