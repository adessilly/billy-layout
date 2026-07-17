import { Component, computed, input, output } from '@angular/core';

/** Couleurs sémantiques du design system. */
export type BillyButtonColor = 'neutral' | 'info' | 'primary' | 'warning' | 'error';

/**
 * Habillages disponibles. `*-rounded` = coins en pilule (border-radius plein).
 * `ghost` = bouton fantôme discret (reprend le « Retour » de la save-bar :
 * contour input muet, texte estompé, survol gris clair) ; volontairement neutre,
 * insensible à `color`.
 */
export type BillyButtonVariant =
  | 'plain'
  | 'plain-rounded'
  | 'outline'
  | 'outline-rounded'
  | 'text'
  | 'text-rounded'
  | 'ghost'
  | 'ghost-rounded';

/** Gabarits de taille. */
export type BillyButtonSize = 'small' | 'normal' | 'big';

/** Position de l'icône relative au label. */
export type BillyButtonIconPosition = 'left' | 'right';

/**
 * billy-button — bouton d'action polyvalent de la librairie.
 *
 * Rend un vrai `<button>` (focus clavier, Entrée/Espace, ARIA) et se décline sur
 * trois axes indépendants : `color` (5 teintes du DS), `variant` (plein / contour /
 * texte, arrondi ou non) et `size`. Accepte un `label`, une `icon` FontAwesome, ou
 * les deux. Motion design intégré : élévation au survol des pleins, pilule qui
 * apparaît au survol des variantes `text-rounded`, spinner en état `loading`.
 */
@Component({
  selector: 'billy-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {

  readonly label = input('');
  readonly icon = input('');
  readonly iconPosition = input<BillyButtonIconPosition>('left');

  readonly color = input<BillyButtonColor>('primary');
  readonly variant = input<BillyButtonVariant>('plain');
  readonly size = input<BillyButtonSize>('normal');

  readonly disabled = input(false);
  readonly loading = input(false);
  /** Type HTML natif — `submit` pour un bouton d'envoi de formulaire. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Occupe toute la largeur disponible. */
  readonly block = input(false);
  /** Libellé accessible — requis quand le bouton n'a qu'une icône. */
  readonly ariaLabel = input('');

  readonly clicked = output<MouseEvent>();

  /** Vrai quand il n'y a pas de label visible : bouton carré/rond centré sur l'icône. */
  readonly iconOnly = computed(() => !this.label().trim() && !!this.icon().trim());

  /** aria-label effectif : explicite, sinon le label, sinon rien. */
  readonly effectiveAriaLabel = computed(() => this.ariaLabel().trim() || this.label().trim() || null);

  readonly classes = computed(() => [
    'billy-btn',
    `billy-btn--${this.variant()}`,
    `billy-btn--${this.color()}`,
    `billy-btn--${this.size()}`,
    this.iconOnly() ? 'billy-btn--icon-only' : '',
    this.block() ? 'billy-btn--block' : '',
    this.loading() ? 'is-loading' : '',
  ].filter(Boolean).join(' '));

  onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }

}
