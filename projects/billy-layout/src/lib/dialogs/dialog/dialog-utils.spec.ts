import { Dialog } from './dialog-utils';

/** jsdom fires no transitionend: the 400 ms fallback timer does the work. */
const TRANSITION = 400;

describe('Dialog', () => {

  let host: HTMLElement;

  /** The open stack is module-level: every dialog must be closed after each test. */
  let dialogs: Dialog[];

  const createDialog = (el: HTMLElement): Dialog => {
    const dialog = new Dialog(el);
    dialogs.push(dialog);
    return dialog;
  };

  const buildModal = (): HTMLElement => {
    const root = document.createElement('div');
    root.className = 'billy-modal';
    root.innerHTML = `
      <div class="billy-modal-dialog">
        <div class="billy-modal-content">
          <button type="button" data-billy-dismiss>Close</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    return root;
  };

  const pressEscape = (): void => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    dialogs = [];
    host = buildModal();
  });

  afterEach(() => {
    // Drain the module-level open stack so no dialog leaks into the next test.
    vi.runAllTimers();
    dialogs.forEach(dialog => dialog.hide());
    vi.runAllTimers();
    vi.useRealTimers();
    document.querySelectorAll('.billy-modal').forEach(el => el.remove());
  });

  it('show() opens: is-open on the root, scroll lock on the body', () => {
    const dialog = createDialog(host);
    dialog.show();

    expect(host.classList.contains('is-open')).toBe(true);
    expect(host.style.display).toBe('block');
    expect(host.getAttribute('aria-modal')).toBe('true');
    expect(document.body.classList.contains('billy-dialog-open')).toBe(true);
  });

  it('listenShow() emits exactly once, after the transition fallback', () => {
    const dialog = createDialog(host);
    const shown = vi.fn();
    dialog.listenShow().subscribe(shown);

    dialog.show();
    expect(shown).not.toHaveBeenCalled();

    vi.advanceTimersByTime(TRANSITION);
    expect(shown).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(TRANSITION);
    expect(shown).toHaveBeenCalledTimes(1);
  });

  it('hide() closes and listenClose() emits exactly once', () => {
    const dialog = createDialog(host);
    const closed = vi.fn();
    dialog.listenClose().subscribe(closed);

    dialog.show();
    vi.advanceTimersByTime(TRANSITION);

    dialog.hide();
    expect(host.classList.contains('is-open')).toBe(false);
    expect(closed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(TRANSITION);
    expect(closed).toHaveBeenCalledTimes(1);
    expect(host.style.display).toBe('none');
    expect(host.hasAttribute('aria-modal')).toBe(false);
    expect(document.body.classList.contains('billy-dialog-open')).toBe(false);
  });

  it('Escape closes only the top dialog of the stack', () => {
    const bottom = createDialog(host);
    const topHost = buildModal();
    const top = createDialog(topHost);

    bottom.show();
    top.show();
    vi.advanceTimersByTime(TRANSITION);

    pressEscape();
    vi.advanceTimersByTime(TRANSITION);

    expect(topHost.classList.contains('is-open')).toBe(false);
    expect(host.classList.contains('is-open')).toBe(true);
    // The bottom dialog still locks the body scroll.
    expect(document.body.classList.contains('billy-dialog-open')).toBe(true);

    pressEscape();
    vi.advanceTimersByTime(TRANSITION);

    expect(host.classList.contains('is-open')).toBe(false);
    expect(document.body.classList.contains('billy-dialog-open')).toBe(false);
  });

  it('a click on [data-billy-dismiss] closes the dialog', () => {
    const dialog = createDialog(host);
    const closed = vi.fn();
    dialog.listenClose().subscribe(closed);

    dialog.show();
    vi.advanceTimersByTime(TRANSITION);

    host.querySelector<HTMLButtonElement>('[data-billy-dismiss]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.advanceTimersByTime(TRANSITION);

    expect(closed).toHaveBeenCalledTimes(1);
    expect(host.classList.contains('is-open')).toBe(false);
  });

  it('a click inside the content does not close the dialog', () => {
    const dialog = createDialog(host);
    dialog.show();
    vi.advanceTimersByTime(TRANSITION);

    host.querySelector<HTMLElement>('.billy-modal-content')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.advanceTimersByTime(TRANSITION);

    expect(host.classList.contains('is-open')).toBe(true);
  });

  it('a press-and-release on the backdrop closes the dialog', () => {
    const dialog = createDialog(host);
    dialog.show();
    vi.advanceTimersByTime(TRANSITION);

    host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.advanceTimersByTime(TRANSITION);

    expect(host.classList.contains('is-open')).toBe(false);
  });

});
