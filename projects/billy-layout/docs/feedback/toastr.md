# billy-toastr — ToastrService, ToastrComponent & ToastrListPanelComponent

> Category `feedback` · source `projects/billy-layout/src/lib/feedback/toastr/` · service + standalone components

## Role

The application's ephemeral notification ("toast") system. `ToastrService` maintains a stack of messages in a signal; `ToastrListPanelComponent` (`billy-toastr-list-panel`) displays that stack in a fixed position below the topbar; each message is rendered by `ToastrComponent` (`billy-toastr`), a card with a colored edge, icon, progress bar and close button.

The panel is mounted **once** in `src/app/auth/pages/auth-page.component.html` (`<billy-toastr-list-panel></billy-toastr-list-panel>`). The service is injected in about thirty places in `src/app` (quote/sale/purchase/client forms, payments, Peppol, account, email-dialog, bce-search, fichiers-email, achat.service…), mostly via the `pushSaveSuccess()` / `pushSaveError()` aliases.

## API

### Types (`toastr.ts`)

```ts
export type ToastrType = 'success' | 'error' | 'warning' | 'info';

/** Application message pushed by callers (historical pushMessage API). */
export interface Toastr {
  title: string;
  message: string;
  icon?: string;         // optional font-awesome icon; defaults to the type's icon
  type?: ToastrType;
  /** @deprecated use `type: 'error'` */
  error?: boolean;
}

/** Concrete toast in the displayed stack. */
export interface ToastrInstance {
  id: number;
  type: ToastrType;
  title: string;
  message: string;
  icon: string | null;
  duration: number;      // time before auto-close, in ms
}
```

### ToastrService (`providedIn: 'root'`)

```ts
import { ToastrService } from 'billy-layout';
```

Properties:

| Property | Type | Default | Description |
|---|---|---|---|
| `hideDelay` | `number` | `5` | Base display time in **seconds**. Warnings: +1.5 s; errors: +3 s. |
| `messages` | `Signal<ToastrInstance[]>` (readonly, `signal`) | `[]` | Current stack of displayed toasts. |

Methods:

| Method | Signature | Description |
|---|---|---|
| `success` | `success(message: string, title?: string): void` | Green toast. Default title from the i18n dictionary: `toastr.success` (EN "Success"). |
| `error` | `error(message: string, title?: string): void` | Red toast (duration +3 s). Default title: `toastr.error` (EN "Error"). |
| `warning` | `warning(message: string, title?: string): void` | Orange toast (duration +1.5 s). Default title: `toastr.warning` (EN "Warning"). |
| `info` | `info(message: string, title?: string): void` | Blue toast. Default title: `toastr.info` (EN "Information"). |
| `pushSaveSuccess` | `pushSaveSuccess(message?: string): void` | Legacy alias → `success(message)`. Default message: `toastr.saveSuccess` (EN "Saved successfully"). The most frequent usage in `src/app`. |
| `pushSaveError` | `pushSaveError(message?: string): void` | Legacy alias → `error(message)`. Default message: `toastr.saveError` (EN "Error while saving"). |
| `pushMessage` | `pushMessage(toastr: Toastr): void` | Legacy object alias: type derived from `toastr.type`, otherwise from `toastr.error` (`true` → `'error'`, else `'success'`); honors `icon`. |
| `remove` | `remove(id: number): void` | Immediately removes a toast from the stack (called by `ToastrComponent` after the exit animation). |

The stack is **capped at 5 toasts** (`MAX_STACK`): beyond that, the oldest is evicted.

Default titles/messages and the close button's `aria-label` (`toastr.close`) come from the i18n dictionary; an explicit `title`/`message` argument always wins. Built-in strings are localizable — see [i18n](../core/i18n.md).

### ToastrComponent — `billy-toastr` (standalone)

| Input | Type | Default | Description |
|---|---|---|---|
| `toast` | `input.required<ToastrInstance>()` | — | The toast to display. |

No output. Internal state as signals: `leaving` (exit in progress), `expanded` (mobile expansion). Per-type icon when `icon` is null: `fa-check` / `fa-xmark` / `fa-triangle-exclamation` / `fa-circle-info`.

### ToastrListPanelComponent — `billy-toastr-list-panel` (standalone)

No input/output. Iterates `toastrService.messages()` (`@for … track toast.id`) inside an `aria-live="polite"` container. Mount it once, at the authenticated page level.

## Usage example

Mounting the panel (`src/app/auth/pages/auth-page.component.html`):

```html
<billy-toastr-list-panel></billy-toastr-list-panel>
```

Real-world calls:

```ts
// src/app/auth/pages/devis/devis-form/devis-form.component.ts
this.toastrService.pushSaveSuccess();
this.toastrService.pushSaveError();

// src/app/shared/components/bce-search/bce-search.component.ts
this.toastrService.error(
  "Unable to retrieve this company's record at the moment.",
  'CBE lookup',
);

// src/app/auth/pages/client/client-form/client-form.component.ts
this.toastrService.warning(
  'The CBE returns no usable data for this number.',
  'CBE lookup',
);
```

## Styles & theming

- **The auto-close timer IS the CSS animation** of the progress bar (`.toast-progress`, `billyToastProgress` keyframes, `scaleX(1) → scaleX(0)`). `animation-duration` is bound to `toast().duration` and the `(animationend)` event is what triggers `close()`. Hover (`.toast-card:hover`) sets the animation to `paused`: the toast stays visible while being read, with no JS timer to manage.
- Exit: `close()` sets the `.leaving` host class; the toast is a grid row that collapses (`grid-template-rows: 1fr → 0fr`) so the stack closes up without a jump, then `remove()` after 250 ms.
- DS tokens: shell via `--billy-surface`, `--billy-surface-border`, `--billy-text-soft`, `--billy-text-muted`. Per-type hues come from the [semantic families](../styles/styles.md#semantic-families-statuses) — `--t-accent` = `--billy-<hue>-strong` (left edge, glyph, progress bar), `--t-icon-bg` = `--billy-<hue>-soft` (badge) — for `success` / `error` / `warning`, with `info` reusing the Accent (`--billy-accent-strong` / `-soft`). **Dark mode is automatic** (tokens), no more per-type local override.
- Entrance: `billyToastInRight` (slide from the right) on desktop, `billyToastInTop` (from the top) on mobile.
- **Mobile (< 768px)**: the toast becomes a **compact pill** (icon + truncated title, `border-radius: 999px`, content-sized width); a tap (`toggleExpanded()`) expands it into a full card to read the message. The stack is then centered at full width (`toastr-list-panel.component.scss`).
- Positioning: fixed stack `top: 78px; right: 16px; width: 340px; z-index: 10000`, anchored below the topbar; the container is `pointer-events: none`, only the cards are interactive.
- **Dark mode** (`:host-context(body.dark-mode)`): lightened per-type accents, stronger shadow, adapted texts.
- `prefers-reduced-motion: reduce`: entrance/transition animations are disabled, **but the progress bar remains** — it is the toast's timer.

## Pitfalls & notes

- Do not mount `billy-toastr-list-panel` more than once: each instance would display the whole stack.
- The duration is frozen at toast creation (`duration` in ms); changing `hideDelay` only affects subsequent toasts.
- `Toastr.error` is deprecated — use `type: 'error'` in `pushMessage`, or `error()` directly.
- `remove()` removes without animation: go through the cross / the component's auto-close for an animated exit.
- Clicking anywhere on the card calls `toggleExpanded()` (mostly useful on mobile); the cross calls `stopPropagation()` so closing does not expand.
- Beware of toasts pushed in bursts: beyond 5, the oldest disappear silently.
