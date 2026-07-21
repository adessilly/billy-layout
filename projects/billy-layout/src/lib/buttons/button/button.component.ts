import { Component, computed, input, output } from '@angular/core';

/** Semantic colors of the design system. */
export type BillyButtonColor = 'neutral' | 'info' | 'primary' | 'warning' | 'error';

/**
 * Available skins. `*-rounded` = pill corners (full border-radius).
 * `ghost` = discreet ghost button (mirrors the save-bar "Back" button:
 * muted input outline, faded text, light-gray hover); deliberately neutral,
 * insensitive to `color`.
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

/** Size presets. */
export type BillyButtonSize = 'small' | 'normal' | 'big';

/** Position of the icon relative to the label. */
export type BillyButtonIconPosition = 'left' | 'right';

/**
 * billy-button — the library's all-purpose action button.
 *
 * Renders a real `<button>` (keyboard focus, Enter/Space, ARIA) and comes in
 * three independent axes: `color` (5 DS tints), `variant` (plain / outline /
 * text, rounded or not) and `size`. Accepts a `label`, a FontAwesome `icon`, or
 * both. Built-in motion design: elevation on hover for plain variants, a pill
 * appearing on hover for `text-rounded` variants, spinner in `loading` state.
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
  /** Native HTML type — `submit` for a form submission button. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Takes up the full available width. */
  readonly block = input(false);
  /** Accessible label — required when the button only has an icon. */
  readonly ariaLabel = input('');

  readonly clicked = output<MouseEvent>();

  /** True when there is no visible label: square/round button centered on the icon. */
  readonly iconOnly = computed(() => !this.label().trim() && !!this.icon().trim());

  /** Effective aria-label: explicit one, else the label, else nothing. */
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
