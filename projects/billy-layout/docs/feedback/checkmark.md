# billy-checkmark, billy-checkmark-failed & billy-checkmark-loading

> Category `feedback` · sources `projects/billy-layout/src/lib/feedback/checkmark/`, `checkmark-failed/` and `checkmark-loading/` · standalone components

Three twin components used in tandem around an asynchronous operation: the circular spinner during the operation, the animated green check on success, the red cross on failure. All three share exactly the same SVG geometry (64 × 64 viewBox, ring of radius 23, stroke 3, rounded caps): stacked on top of each other, the transition from spinner to check or cross is visually continuous, with no jump.

Known app usage: `src/app/auth/pages/peppol-facture/peppol-send-animation-icon/` (Peppol invoice sending animation).

---

## Common API

```ts
import {
  CheckmarkComponent,        // billy-checkmark
  CheckmarkFailedComponent,  // billy-checkmark-failed
  CheckmarkLoadingComponent, // billy-checkmark-loading
  CheckmarkColor,
} from 'billy-layout';
```

All three components expose the same inputs:

| Input | Type | Default | Role |
|---|---|---|---|
| `label` | `string` | i18n `checkmark.success` / `.failed` / `.loading` (EN `'Success'` / `'Failed'` / `'Loading'`) | Label announced to screen readers (`role="img"` + `aria-label` on the SVG). When the input is not set, the default comes from the i18n dictionary. |
| `color` | `CheckmarkColor` | `'success'` (check, spinner) · `'danger'` (cross) | Design system color. |

Built-in strings are localizable — see [i18n](../core/i18n.md).

```ts
export type CheckmarkColor = 'success' | 'accent' | 'danger' | 'warning' | 'info';
```

Color mapping — the solid disc takes the `base` shade of the DS [semantic family](../styles/styles.md#semantic-families-statuses), so **all of them follow dark mode**:

| Value | Color |
|---|---|
| `success` | `var(--billy-success)` (`#16a34a`) |
| `accent` | `var(--billy-accent)` (`#12b4dd`) |
| `danger` | `var(--billy-danger)` (`#dc2626`) |
| `warning` | `var(--billy-warning)` (`#ff902b`) |
| `info` | `var(--billy-accent-strong)` (`#0e97bb`) |

### Theming CSS variables

| Variable | Default | Scope |
|---|---|---|
| `--billy-checkmark-size` | `156px` | Size (width = height) of all three components. |
| `--billy-checkmark-color` | `var(--billy-success, #16a34a)` | Disc and spinner color when `color` is `success` (default). |
| `--billy-checkmark-failed-color` | `var(--billy-danger, #dc2626)` | Cross color when `color` is `danger` (default). |
| `--billy-checkmark-loading-color` | `var(--billy-checkmark-color, #16a34a)` | Spinner-specific override. |
| `--billy-checkmark-check-color` | `#fff` | Stroke color of the check and the cross. |

An explicit `color` (other than the default) takes precedence over these variables: the input sets a `data-color` attribute on the host, resolved in SCSS via `:host([data-color='…'])`.

### Usage example

```html
@if (loading()) {
  <billy-checkmark-loading />
  <span class="checkmark-message">Sending...</span>
} @else if (success()) {
  <billy-checkmark />
  <span class="checkmark-message">Sent successfully!</span>
} @else if (error()) {
  <billy-checkmark-failed />
  <span class="checkmark-message">Sending failed.</span>
}
```

For a seamless transition, stack the spinner and the final mark (the spinner stays mounted and fades out while the check/cross draws on top):

```html
<div class="stack">
  <billy-checkmark-loading class="layer" [class.layer--hidden]="done()" />
  @if (done()) {
    <billy-checkmark class="layer" />
  }
</div>
```

```scss
.stack { display: grid; place-items: center; }
.layer { grid-area: 1 / 1; transition: opacity 0.4s ease-out; }
.layer--hidden { opacity: 0; }
```

---

## billy-checkmark — CheckmarkComponent

Animated success check. Motion sequence (~1.4 s), played once on mount:

1. **0 → 0.55 s**: the ring traces itself from twelve o'clock (dash-offset, `cubic-bezier(0.65, 0, 0.35, 1)` curve).
2. **0.4 → 0.85 s**: the solid disc "pops" from the center with an elastic bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`) and a colored drop shadow.
3. **0.68 → 1.03 s**: the check draws itself (rounded caps).
4. **0.7 → 1.2 s**: slight overall bounce (scale 1.07 at 40%).
5. **0.78 s →**: a halo expands and fades, and six "comet" bursts (dash-offset traveling along the stroke) shoot outward, slightly staggered (30 ms apart).

## billy-checkmark-failed — CheckmarkFailedComponent

Animated failure cross, same language as the check but with an "error" vocabulary:

1. Traced ring and "pop" disc identical to the check (in `danger` red by default).
2. **0.68 s then 0.84 s**: the two branches of the cross draw one after the other.
3. **0.72 → 1.17 s**: horizontal shake (±3 px, damped) — no bounce or bursts, those are reserved for success.
4. **0.9 s →**: halo that expands and fades.

## billy-checkmark-loading — CheckmarkLoadingComponent

Material-style indeterminate circular spinner: a discreet track (opacity 0.15) and an arc that stretches and contracts (animated `stroke-dasharray`/`offset`, 1.4 s) while the whole rotates (1.8 s linear). For a *determinate* progress ring (percentage), use `billy-circular-loading` instead.

---

## Accessibility & motion

- SVG `role="img"` + `aria-label` (`label` input) on all three components.
- `prefers-reduced-motion: reduce`: the check and the cross appear with a simple fade in their final state (no halo, bursts or shake); the spinner slows down (3 s/turn) with a fixed arc.

## Pitfalls & notes

- The check and cross animations play on mount: to replay them, destroy/recreate the component (`@if`).
- The SVG has `overflow: visible` (the halo and drop shadow overflow the viewBox): leave some breathing room around it, and do not set `overflow: hidden` on a tight immediate parent or the halo will be clipped into a square.
- The halo and the disc use `transform-box: fill-box`; the bursts are dash-offset strokes — no SMIL, everything is CSS (the old SMIL spinner has been replaced).
- Demo: `/c/feedback/checkmark` (showcase, loading → success/failure stacking, color picker).
