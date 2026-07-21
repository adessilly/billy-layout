# billy-consult-card — ConsultCardComponent

> Category `display` · source `projects/billy-layout/src/lib/display/consult-card/` · standalone component

## Purpose

"Single-section" consultation card: the design system's white card (`billy-card` mixin) with an icon-chip title (small caps), an optional count badge and an actions area to the right of the title. It is the standard building block on consultation screens for framing a block of information.

Usage in `src/app` (verified via grep, ~14 files): `vente-consult` ("Peppol e-invoicing" card), `achat-form`, `devis-form`, `compte` / `compte-peppol` / `compte-prompt`, `client-consult` (stats, history, revenue cards), `agenda` (`consult-agenda-card`), `peppol-inbox-list`, `upload-manager`, `fichiers-manager`.

## API

**Selector**: `billy-consult-card` · **Import**: `import { ConsultCardComponent } from 'billy-layout';`

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` (**`input.required`**) | — | Card title label (displayed in small caps). |
| `icon` | `string` (**`input.required`**) | — | FontAwesome icon class for the chip (e.g. `fa-solid fa-globe`). |
| `badge` | `number \| null` | `null` | Numeric badge displayed after the label (cyan chip). `null` = no badge — a `0` does display. |

### Outputs

None.

## Slots / projection

| Slot | Selector | Role |
|---|---|---|
| Actions | `[card-actions]` | Elements projected to the right of the title (`.cc-actions`, `margin-left: auto`) — typically small buttons. The title typography (uppercase, letter-spacing) is neutralized there. |
| Body | default | Card content, rendered inside `.cc-body`. |

## Usage example

`vente-consult.component.html`:

```html
<billy-consult-card label="Peppol e-invoicing" icon="fa-solid fa-globe">
  <button card-actions type="button" class="btn btn-sm btn-outline-secondary" (click)="askGotoPeppol()">
    Manage
  </button>
  <app-peppol-facture-logs [logs]="peppolLogs()"></app-peppol-facture-logs>
</billy-consult-card>
```

## Styles & theming

- `:host` receives `display: block` + the **`billy-card`** mixin (`@use 'billy-cards'`): `--billy-surface` surface, `--billy-surface-border` border, 16px radius, `--billy-card-shadow` shadow.
- Title: **`billy-section-title`** and **`billy-section-icon`** mixins (chip `--billy-accent-soft` / `--billy-accent-strong`).
- Badge: `--billy-accent-soft` (background) / `--billy-accent-strong` (text).
- **Dark mode fully carried by the `--billy-*` tokens** — no local `:host-context(.dark-mode)` block.
- Projected `btn btn-outline-secondary` buttons (Bootstrap legacy) are re-themed via `::ng-deep` on the tokens (`--billy-input-border`, `--billy-text-soft`, `--billy-addon-bg`, `--billy-focus-ring`) so they follow dark mode.

## Gotchas & notes

- **Anti-nesting rule**: `billy-consult-card` is a **single-content card, without a gray sub-panel**. The `billy-section` mixin (gray `--billy-section-bg` background) is reserved for hand-built **multi-section** cards (see `docs/billy-cards.md`). Do not nest a single gray section inside a consult-card — it is visual noise.
- `label` and `icon` are `input.required`: forgetting one = runtime error.
- The badge check is `badge() !== null`: passing `0` does display "0"; use `null` (not a cast `undefined`) to hide it.
- The `[card-actions]` slot is styled for compact buttons; the `::ng-deep` hack targets only `.btn.btn-outline-secondary` — other projected button styles must handle their own dark mode.
