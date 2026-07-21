# [clickOutside] — ClickOutsideDirective & ClickOutsideService

> Category `core` · source `projects/billy-layout/src/lib/core/click-outside/` · directive + service

## Purpose

"Click outside" detection to close floating surfaces, without Bootstrap JS and zoneless-compatible. The service centralizes **a single** `click` listener on `document` and publishes the click target in a signal; each directive placed on an element reacts to that signal and emits `clickOutside` when the click did not happen inside its subtree. It is the closing mechanism of the in-house dropdowns: used inside the library by `billy-dropdown` and `billy-attachment-button`, and in the app by the account menu (`src/app/shared/components/icon-top-compte/billy-account-menu.component.html`) and the VAT field (`src/app/shared/components/tva-field/tva-field.component.html`).

---

## ClickOutsideDirective

### Selector & import

```ts
import { ClickOutsideDirective } from 'billy-layout';
```

Selector: `[clickOutside]` · standalone directive.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `listenClickOutside` | `boolean` | `true` | Listening switch. When `false`, outside clicks are ignored. In practice, bind it to the open-state signal (`[listenClickOutside]="isOpen()"`) so the directive only reacts while the surface is visible. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clickOutside` | `void` | Emitted on every document click whose target is not contained in the host element (`elementRef.nativeElement.contains(target)` is false). |

### How it works internally

An `effect()` in the constructor reads `clickOutsideService.clickEmitted()`; the body is wrapped in `untracked()` so that only the publication of a click (and not `listenClickOutside`) triggers the effect. If the target is non-null, listening is not disabled, and the target is outside the host's subtree → `clickOutside.emit()`.

---

## ClickOutsideService

### Import

```ts
import { ClickOutsideService } from 'billy-layout';
```

Service `@Injectable({ providedIn: 'root' })` — only instantiated on its first injection (in practice, the first `ClickOutsideDirective` constructed).

### API

| Member | Type | Description |
|---|---|---|
| `clickEmitted` | `signal<null \| EventTarget>` | Target of the last document click, `null` at rest. The service does `set(null)` then `set(event.target)` on each click: passing through `null` breaks referential equality and guarantees the directives' effect replays even when clicking the same element twice in a row. |

The `document.addEventListener('click', …)` listener is set in the constructor and never removed (lifetime = the application).

---

## Usage example

Real usage — `src/app/shared/components/icon-top-compte/billy-account-menu.component.html`:

```html
<div class="account-menu" (clickOutside)="close()" [listenClickOutside]="open()">
  <!-- trigger + panel -->
</div>
```

```ts
import { ClickOutsideDirective } from 'billy-layout';

@Component({
  imports: [ClickOutsideDirective],
  /* ... */
})
export class BillyAccountMenuComponent {
  readonly open = signal(false);
  close() { this.open.set(false); }
}
```

## Styles & theming

No styles: purely behavioral directive.

## Pitfalls & notes

- **The opening click counts as a click**: without a guard, opening a menu from a button outside the decorated element would immediately close it again. Two workarounds: include the trigger inside the decorated subtree (the account-menu pattern above), or drive `listenClickOutside`.
- **`stopPropagation()` makes the click invisible**: the service listens on `document`; a click stopped along the way publishes nothing (so no closing either).
- Only the `click` event is covered — not `mousedown`, nor the Escape key, nor keyboard focus leaving.
- Designed for zoneless: everything goes through signals/effect, no `NgZone`. It is the official replacement for the app's Bootstrap dropdowns (the `isOpen` + `ClickOutsideDirective` pattern).
- The service references `document` directly in its constructor: not SSR/server-platform compatible as is.
- Two nested instances of the directive each react on their own: a click in the child is also "inside" for the parent (contains), so no spurious double closing.
