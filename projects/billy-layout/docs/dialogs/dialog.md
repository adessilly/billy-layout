# dialog — `Dialog`

> Category `dialogs` · source `projects/billy-layout/src/lib/dialogs/dialog/dialog-utils.ts` · class (+ injection token `BILLY_DIALOG_ROUTER`, `projects/billy-layout/src/lib/dialogs/dialog/billy-dialog-router.ts`)

## Purpose

`Dialog` is the engine behind the design system's modal dialogs, **with no Bootstrap dependency whatsoever**. It reproduces the contract of the old `bootstrap.Modal` shell exactly: `show()` / `hide()`, and two *terminal* events (`listenShow()` / `listenClose()`) emitted **once the CSS transition has finished**. That deferral is essential: callers remove the element from `<body>` and chain navigation inside `listenClose()` — notifying them earlier would break the animation.

It also implements the WAI-ARIA **modal dialog** pattern — initial focus, focus trap, inert background, focus restore — see [Modality](#modality-focus--inert-background). Because everything happens in the engine, **every dialog of the design system gets it for free**: `billy-dialog-form`, `billy-delete-dialog` and any custom `.billy-modal` markup driven by `new Dialog(...)`.

The class handles behavior **only** (display, transitions, closing gestures, stack, scroll lock, modality). The visual `.billy-modal*` shell is a **global** stylesheet: `projects/billy-layout/src/lib/styles/_billy-dialog.scss`, loaded by the application's `src/styles.scss` (`@use 'billy-dialog';`, via the `includePaths` `projects/billy-layout/src/lib/styles` in `angular.json`).

## API

### Constructor

```ts
new Dialog(host: HTMLElement)
```

`host` is the `.billy-modal` **root** (the full-screen element acting as backdrop, click-to-close zone and scroll container).

### Public methods

| Method | Signature | Description |
|---|---|---|
| `show` | `show(): void` | Opens the dialog: pushes the instance onto the stack, sets `billy-dialog-open` on `<body>`, wires the listeners (mousedown/click/keydown), sets `aria-modal="true"`, switches `display` to `block`, forces a reflow then adds the `is-open` class (triggering the opacity transition), makes the background `inert` and moves the focus inside. No-op if the instance is not in the `idle` state. |
| `hide` | `hide(): void` | Closes the dialog: removes `is-open`, waits for the transition to end then tears everything down (`teardown` — inert released, focus restored) and emits `listenClose()`. No-op if the state is neither `opening` nor `open` (so a close can interrupt an opening in progress). |
| `listenShow` | `listenShow(): Observable<void>` | Emits **exactly once**, when the dialog is fully open (transition included), then completes. |
| `listenClose` | `listenClose(): Observable<void>` | Emits **exactly once**, when the dialog is fully closed (transition included), then completes. This is where you remove the element from `<body>` and chain navigation. |

### Internal lifecycle

State machine `idle → opening → open → closing → closed`. An instance is **single-use**: after closing (`closed`), `show()` does nothing anymore — to reopen, create a `new Dialog(...)` on the same element. Handled case: reopening on the **same host element** (e.g. `app-ai-extract-dialog` chains openings) silently tears down the previous instance left on the stack, **without** emitting `listenClose()` (otherwise the caller would remove from `<body>` the very element about to be redisplayed).

### Closing gestures

These close the dialog (call `hide()`):

- the **Escape** key — with stacked dialogs, **only the topmost one** responds;
- a **backdrop click** — only if the `mousedown` also happened on the backdrop (a drag started inside the dialog and released on the backdrop does not close it);
- any element carrying the **`data-billy-dismiss`** attribute (replacement for `data-bs-dismiss`), anywhere in the tree (detected with `closest()`).

### Stack and scroll lock

- `openStack` (module-level): open dialogs, oldest to newest. Used for Escape routing and the lock.
- `body.billy-dialog-open` (`overflow: hidden`, defined in `_billy-dialog.scss`): set on the first `show()`, removed **only when the stack is empty** — one dialog can open another (e.g. delete confirmation from a form) without scrolling being restored in between. Effectively a *counted* lock.

### Modality: focus & inert background

The dialog is *modal*: while it is open, the rest of the page does not exist for the user — neither for the pointer, nor for the keyboard, nor for a screen reader. Four mechanisms, all handled by `show()` / `teardown()`:

| On opening (`show`) | On closing (`teardown`) |
|---|---|
| The element that had focus (usually the button that opened the dialog) is memorized. | Focus goes back to it, if it is still in the DOM. |
| The **background becomes `inert`**: walking from the host up to `<body>`, every sibling gets the `inert` attribute. | Only the elements *this* instance made inert lose the attribute. |
| **Focus moves into the dialog**: the first `[billyAutofocus]` / `[autofocus]` / `[data-billy-autofocus]` element, otherwise `.billy-modal-content` itself. | The temporary `tabindex="-1"` put on `.billy-modal-content` is removed. |
| **Tab is trapped**: from the last focusable element it wraps to the first, and Shift+Tab from the first (or from the container) wraps to the last. | The `keydown` listener is removed. |

Notes:

- **Inert walks the ancestor chain**, so the dialog stays usable wherever its root sits — under `<body>` (the canonical pattern) or still nested inside a component.
- **Stacked dialogs**: the topmost one inerts the one below (an already-inert element is never touched again, so closing the top one restores exactly what it hid). Only the topmost dialog handles Escape and Tab.
- **Focus restore is conditional**: the dialog only reclaims focus if it still holds it. A `closeThen(...)` action that navigates and focuses something else keeps its target.
- **Live regions can opt out**: an element carrying `data-billy-no-inert` is never inert-ed. `inert` is not overridable from the inside, so the opt-out only works on an element that sits **on the sibling path** — in practice a direct child of `<body>`. A live region nested deep inside the application root is covered by the root's `inert` (a toast raised from a dialog stays visible, but it is neither clickable nor announced until the dialog closes).
- **Third-party overlays**: a panel appended to `<body>` *after* the dialog opened (select2-style dropdowns, date pickers) is not inert, and the Tab trap deliberately leaves the keyboard alone while focus sits inside it.
- **Initial focus is the container by default**, not the first button: the dialog's content is announced instead of "Close", and the close cross does not get the focus ring. Add `billyAutofocus` on the first field of a form dialog to override it.

```html
<!-- form dialog: the field takes the focus rather than the container -->
<billy-dialog-form-body>
  <billy-input-line label="New label">
    <input billyAutofocus [(ngModel)]="label" />
  </billy-input-line>
</billy-dialog-form-body>

<!-- live region mounted at <body> level: stays announceable behind the dialog -->
<div id="app-live-region" aria-live="polite" data-billy-no-inert></div>
```

### Transition safety net

`transitionend` never fires if the transition does not start (background tab, `prefers-reduced-motion`, transition overridden to `none`). A **400 ms** fallback (`TRANSITION_FALLBACK_MS`) guarantees that `listenShow()` / `listenClose()` still emit. Only the **root's opacity transition** is listened to (children's `transitionend` events — dialog transform, SVG animations — bubble up and are ignored).

## Expected markup

```html
<div class="billy-modal" tabindex="-1" role="dialog" #modalRef>        <!-- element passed to the constructor -->
  <div class="billy-modal-dialog billy-modal-dialog--centered" role="document">
    <div class="billy-modal-content">
      <button type="button" data-billy-dismiss aria-label="Close">…</button>
      … content …
    </div>
  </div>
</div>
```

Available classes (see `_billy-dialog.scss`): `.billy-modal-dialog--centered` (vertical centering), `.billy-modal-dialog--large` (equivalent to `modal-xl`: 800px ≥ 992px, 1140px ≥ 1200px), `.billy-modal-header` / `-body` / `-footer` / `-title`.

`.billy-modal-content` is not just cosmetic: it is the element that takes the **initial focus** when the dialog declares no autofocus target. Give `role="dialog"` an accessible name (`aria-label`, or `aria-labelledby` pointing at the title) so the dialog announces itself when the focus lands there.

## Usage example

Real-world usage: `src/app/auth/pages/vente/vente-send-dialog/vente-send-dialog.component.ts` (choosing the sending channel for an invoice, exposed as a `Promise`):

```ts
open(creditNote = false): Promise<VenteSendChoice | null> {
  // Moved under <body> to escape stacking contexts (topbar, overlays).
  const element = this.modalRef().nativeElement;
  if (element.parentElement?.tagName !== 'BODY') {
    document.body.appendChild(element);
  }
  const modal = new Dialog(element);
  modal.show();
  modal.listenClose().pipe(first()).subscribe(() => {
    document.body.removeChild(element);
    this.settle(null);                        // closed without a choice = abandoned
  });
  return new Promise(resolve => { this.resolver = resolve; });
}
```

The canonical pattern: **appendChild under `<body>` → `new Dialog` → `show()` → `listenClose().pipe(first())` → `removeChild`**.

## The `BILLY_DIALOG_ROUTER` token

```ts
export interface BillyDialogRouter {
  closeOverlay(): void;
}
export const BILLY_DIALOG_ROUTER = new InjectionToken<BillyDialogRouter>('BILLY_DIALOG_ROUTER');
```

Navigation bridge for **routed** dialogs: `billy-dialog-form` is used by dialogs carried by an "overlay" route; when the user closes with a gesture (Escape, backdrop click), the route must be left too. The library does not know the application's router: the app provides this token — **optional**; without it the visual close works but no navigation happens.

On the billy-client side (`src/app/app.config.ts`):

```ts
{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService },
```

## Styles & theming

- Shell: `projects/billy-layout/src/lib/styles/_billy-dialog.scss` (root `z-index: 1055`, backdrop `rgba(17,24,39,.5)`, 0.15s opacity transition + `translateY(-30px)` → 0 slide in 0.25s).
- Geometry identical to Bootstrap (500px by default, `--large` breakpoints, margins) so the migration moved no dialog by a pixel.
- Colors via `--billy-*` tokens (surface, border, shadow) → **automatic dark mode**.
- `.billy-modal-dialog` has `pointer-events: none`: gutter clicks reach the root (backdrop close), while `.billy-modal-content` reclaims them (`pointer-events: auto`).
- `prefers-reduced-motion: reduce`: transitions disabled (the 400 ms `Dialog` fallback takes over).

## Gotchas & notes

- **Single-use instance**: after a full close, create a new `Dialog` to reopen. `listenShow`/`listenClose` are completed `Subject`s — they will not emit again.
- **Do not remove the element from `<body>` before `listenClose()`**: the closing animation would be truncated and the listener teardown incomplete.
- **The backdrop close requires mousedown + click on the root**: a text selection spilling out of the dialog does not close it — intended behavior.
- **Escape and the stack**: only the topmost dialog catches Escape (same for the Tab trap); useful when `billy-delete-dialog` opens on top of a `billy-dialog-form`.
- **Do not add a competing focus trap** (CDK `cdkTrapFocus`, `focus-trap`, a `focusin` loop of your own): the engine already traps Tab, and two traps fight each other.
- **`inert` is a native attribute** (Chrome 102+, Safari 15.5+, Firefox 112+) — no polyfill is shipped. On an older browser the background stays exposed to the pointer and to screen readers; the Tab trap, written in JS, keeps the keyboard inside all the same.
- The file's header comments still mention `src/styles-dialog.scss`: the shell now lives in the lib (`lib/styles/_billy-dialog.scss`), imported by the app's `styles.scss`.
- The JS-driven `display: none ↔ block` switch replays the dialogs' CSS illustration animations on every opening (leveraged by delete-dialog and vente-send-dialog).
