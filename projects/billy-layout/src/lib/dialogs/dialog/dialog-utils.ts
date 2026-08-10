import { Observable, Subject } from 'rxjs';

// ═══════════════════════════════════════════════════════════════════════════
// BILLy — design system modal dialog (no Bootstrap)
// Presentation shell: src/styles-dialog.scss (.billy-modal* classes).
// ═══════════════════════════════════════════════════════════════════════════

/** Set on the .billy-modal root when opening: drives opacity + transforms. */
const OPEN_CLASS = 'is-open';

/** Set on <body> while at least one dialog is open (scroll lock). */
const BODY_OPEN_CLASS = 'billy-dialog-open';

/** Closes the dialog on click, wherever it sits in the tree (ex-`data-bs-dismiss`). */
const DISMISS_SELECTOR = '[data-billy-dismiss]';

/** Receives the initial focus, ahead of the dialog container. */
const AUTOFOCUS_SELECTOR = '[billyAutofocus], [autofocus], [data-billy-autofocus]';

/** Container focused when the dialog holds no explicit autofocus target. */
const CONTENT_SELECTOR = '.billy-modal-content';

/**
 * Opts an element out of the background inert-ing: live regions (toasts,
 * status bars) must stay announceable while a dialog is open. `inert` cannot be
 * cancelled from the inside, so this only works on an element sitting on the
 * sibling path walked below — in practice a direct child of the <body>.
 */
const NO_INERT_SELECTOR = '[data-billy-no-inert]';

/** Never inert-ed: no rendering, no focus, nothing to hide from assistive tech. */
const NEVER_INERT_TAGS = ['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE', 'META', 'TITLE', 'BASE'];

/** Candidates for the focus trap; the negative `tabindex` ones are filtered out afterwards. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * Safety net: `transitionend` never fires if the transition does not start
 * (background tab, prefers-reduced-motion, transition overridden to `none`).
 * Without this delay the dialog would stay visible and `listenClose()` silent.
 */
const TRANSITION_FALLBACK_MS = 400;

/** Open dialogs, oldest to newest: only the last one captures Escape. */
const openStack: Dialog[] = [];

type DialogState = 'idle' | 'opening' | 'open' | 'closing' | 'closed';

/**
 * Modal dialog, with no dependency on Bootstrap.
 *
 * Reproduces the contract of the old `bootstrap.Modal` shell as-is:
 * `show()` / `hide()`, and two *terminal* events — `listenShow()` and
 * `listenClose()` — emitted once the transition has finished. This deferral is
 * essential: callers remove the element from the <body> and chain navigation in
 * `listenClose()`, which would break the animation if they were notified earlier.
 *
 * Expected template structure (see src/styles-dialog.scss):
 *
 *   <div class="billy-modal" #ref>          ← the element passed to the constructor
 *     <div class="billy-modal-dialog">
 *       <div class="billy-modal-content"> … </div>
 *
 * The dialog is closed by: the Escape key, a click on the backdrop, and any
 * element carrying the `data-billy-dismiss` attribute.
 *
 * Modality (WAI-ARIA "dialog (modal)" pattern) is handled here, so every dialog
 * of the design system gets it: focus moves inside on opening, Tab cycles
 * within the dialog, the rest of the page is `inert` (unreachable by pointer,
 * keyboard and screen readers) and focus returns to its origin on closing.
 */
export class Dialog {

  private readonly shown = new Subject<void>();
  private readonly hidden = new Subject<void>();

  private state: DialogState = 'idle';

  /** Cancels the pending transition wait (a close can cut an opening short). */
  private cancelPending: (() => void) | null = null;

  /** A drag started inside the dialog and released on the backdrop must not close it. */
  private pressedOnBackdrop = false;

  /** Elements this instance turned inert — restored one by one on teardown. */
  private inerted: HTMLElement[] = [];

  /** The dialog below had inert-ed our own host: give it back when we close. */
  private hostWasInert = false;

  /** Focus origin, restored when the dialog closes (the button that opened it). */
  private focusOrigin: HTMLElement | null = null;

  /** Container that received a temporary `tabindex="-1"` to take the initial focus. */
  private focusFallback: HTMLElement | null = null;

  constructor(private readonly host: HTMLElement) {}

  show(): void {
    if (this.state !== 'idle') { return; }

    // Reopening on the same element (app-ai-extract-dialog chains several):
    // the previous instance would linger in the stack with its listeners. Tear
    // it down silently — notifying it would remove from the <body> the very
    // element we are about to show again.
    openStack.filter(dialog => dialog.host === this.host)
             .forEach(dialog => dialog.teardown());

    this.state = 'opening';
    openStack.push(this);
    document.body.classList.add(BODY_OPEN_CLASS);

    // Captured before anything moves: the element to give focus back to on close.
    this.focusOrigin = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    this.host.addEventListener('mousedown', this.onMouseDown);
    this.host.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeyDown);

    this.host.setAttribute('aria-modal', 'true');
    this.host.style.display = 'block';
    void this.host.offsetHeight; // reflow: pins the initial state, otherwise no transition
    this.host.classList.add(OPEN_CLASS);

    // After `display: block`: a hidden element cannot take focus.
    this.makeBackgroundInert();
    this.focusInitialElement();

    this.afterTransition(() => {
      this.state = 'open';
      this.shown.next();
      this.shown.complete();
    });
  }

  hide(): void {
    if (this.state !== 'opening' && this.state !== 'open') { return; }

    this.state = 'closing';
    this.host.classList.remove(OPEN_CLASS);

    this.afterTransition(() => {
      this.teardown();
      this.hidden.next();
      this.hidden.complete();
    });
  }

  /** Emits once, when the dialog is fully open. */
  listenShow(): Observable<void> {
    return this.shown.asObservable();
  }

  /** Emits once, when the dialog is fully closed (transition included). */
  listenClose(): Observable<void> {
    return this.hidden.asObservable();
  }

  /**
   * Runs `done` at the end of the root's opacity transition, with a fallback
   * delay in case it never fires.
   */
  private afterTransition(done: () => void): void {
    this.cancelPending?.();

    const onTransitionEnd = (event: TransitionEvent): void => {
      // Children's transitions (dialog transform, SVG animations) bubble up
      // here: only react to the root's opacity.
      if (event.target === this.host && event.propertyName === 'opacity') {
        finish();
      }
    };

    const timer = setTimeout(() => finish(), TRANSITION_FALLBACK_MS);

    const cancel = (): void => {
      clearTimeout(timer);
      this.host.removeEventListener('transitionend', onTransitionEnd);
      this.cancelPending = null;
    };

    const finish = (): void => {
      cancel();
      done();
    };

    this.cancelPending = cancel;
    this.host.addEventListener('transitionend', onTransitionEnd);
  }

  /** Returns the element and the <body> to their resting state. Emits nothing. */
  private teardown(): void {
    this.cancelPending?.();

    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.host.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeyDown);

    // Before restoring focus: the origin may sit in a branch we made inert.
    this.releaseBackgroundInert();
    this.restoreFocus();

    this.host.classList.remove(OPEN_CLASS);
    this.host.removeAttribute('aria-modal');
    this.host.style.display = 'none';

    const index = openStack.indexOf(this);
    if (index !== -1) { openStack.splice(index, 1); }

    // A dialog can open another one (deletion requested from a form):
    // only restore scrolling once the last one has closed.
    if (openStack.length === 0) {
      document.body.classList.remove(BODY_OPEN_CLASS);
    }

    this.state = 'closed';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Modality: inert background, initial focus, focus trap, focus restore
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Makes everything but the dialog inert: siblings are walked from the host up
   * to the <body>, so the dialog stays reachable wherever it sits in the tree.
   * Elements already inert are left alone — a dialog opened on top of another
   * one must not un-inert the one below when it closes.
   */
  private makeBackgroundInert(): void {
    this.inerted = [];

    // Stacked dialogs: the one below may have inert-ed our host (it was already
    // in the page when it opened). We are on top now — take the page back.
    this.hostWasInert = this.host.hasAttribute('inert');
    if (this.hostWasInert) { this.host.removeAttribute('inert'); }

    let node: HTMLElement = this.host;
    while (node.parentElement) {
      const parent: HTMLElement = node.parentElement;

      for (const child of Array.from(parent.children)) {
        if (child === node || !(child instanceof HTMLElement)) { continue; }
        if (NEVER_INERT_TAGS.includes(child.tagName)) { continue; }
        if (child.hasAttribute('inert') || child.matches(NO_INERT_SELECTOR)) { continue; }

        child.setAttribute('inert', '');
        this.inerted.push(child);
      }

      if (parent === document.body) { break; }
      node = parent;
    }
  }

  /** Gives the page back to the user — only the elements this instance inert-ed. */
  private releaseBackgroundInert(): void {
    this.inerted.forEach(element => element.removeAttribute('inert'));
    this.inerted = [];

    // A dialog remains open below: our host goes back to being its background.
    if (this.hostWasInert && openStack.some(dialog => dialog !== this)) {
      this.host.setAttribute('inert', '');
    }
    this.hostWasInert = false;
  }

  /**
   * Moves focus inside the dialog: an explicit autofocus target if the content
   * declares one, otherwise the content container itself (announced with the
   * dialog's content, and the close cross does not steal the focus ring).
   */
  private focusInitialElement(): void {
    const explicit = this.host.querySelector<HTMLElement>(AUTOFOCUS_SELECTOR);
    if (explicit) {
      explicit.focus();
      return;
    }

    const container = this.host.querySelector<HTMLElement>(CONTENT_SELECTOR) ?? this.host;
    // `tabindex` on the .billy-modal root breaks the search fields of some
    // third-party widgets: it goes on the content, and only while it is needed.
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
      this.focusFallback = container;
    }
    container.focus();
  }

  /**
   * Returns focus where it came from. Skipped when something else already took
   * it (a `closeThen` action navigating away, another dialog opening): the
   * dialog only reclaims a focus it still holds.
   */
  private restoreFocus(): void {
    this.focusFallback?.removeAttribute('tabindex');
    this.focusFallback = null;

    const active = document.activeElement;
    const stillOurs = !active || active === document.body || this.host.contains(active);
    const origin = this.focusOrigin;
    this.focusOrigin = null;

    if (stillOurs && origin?.isConnected) {
      origin.focus();
    }
  }

  /** Focusable elements of the dialog, in tab order. */
  private focusableElements(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter(element => element.tabIndex >= 0)
      .filter(element => !element.hasAttribute('disabled') && !element.closest('[inert]'))
      .filter(element => element.getAttribute('aria-hidden') !== 'true')
      // checkVisibility is absent from jsdom: assume visible there.
      .filter(element => element.checkVisibility?.() ?? true);
  }

  /** Keeps Tab inside the dialog (the inert background already blocks the rest). */
  private trapTab(event: KeyboardEvent): void {
    const focusables = this.focusableElements();
    if (focusables.length === 0) { return; }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (!active || !this.host.contains(active)) {
      // Focus sits outside the dialog: either nowhere (<body>) — bring it back —
      // or in a non-inert overlay appended to the <body> by a third-party
      // widget, in which case its own key handling is left alone.
      if (active && active !== document.body && !active.closest('[inert]')) { return; }
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (active === first || !focusables.includes(active as HTMLElement))) {
      // `first`, or a container holding the focus (the initial `tabindex="-1"`):
      // going backwards would leave the dialog through the top.
      event.preventDefault();
      last.focus();
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' && event.key !== 'Tab') { return; }
    // Stacked dialogs: only the topmost one responds.
    if (openStack[openStack.length - 1] !== this) { return; }

    if (event.key === 'Tab') {
      this.trapTab(event);
      return;
    }

    event.preventDefault();
    this.hide();
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    this.pressedOnBackdrop = event.target === this.host;
  };

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;

    if (target?.closest(DISMISS_SELECTOR)) {
      this.hide();
      return;
    }

    // The backdrop is the root itself: a click that reaches it went through
    // .billy-modal-dialog (pointer-events: none) without hitting the content.
    if (event.target === this.host && this.pressedOnBackdrop) {
      this.hide();
    }
  };

}
