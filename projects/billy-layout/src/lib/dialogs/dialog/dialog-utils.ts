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
 */
export class Dialog {

  private readonly shown = new Subject<void>();
  private readonly hidden = new Subject<void>();

  private state: DialogState = 'idle';

  /** Cancels the pending transition wait (a close can cut an opening short). */
  private cancelPending: (() => void) | null = null;

  /** A drag started inside the dialog and released on the backdrop must not close it. */
  private pressedOnBackdrop = false;

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

    this.host.addEventListener('mousedown', this.onMouseDown);
    this.host.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeyDown);

    this.host.setAttribute('aria-modal', 'true');
    this.host.style.display = 'block';
    void this.host.offsetHeight; // reflow: pins the initial state, otherwise no transition
    this.host.classList.add(OPEN_CLASS);

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

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') { return; }
    // Stacked dialogs: only the topmost one responds.
    if (openStack[openStack.length - 1] !== this) { return; }

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
