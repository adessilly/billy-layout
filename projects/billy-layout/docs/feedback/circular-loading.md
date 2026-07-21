# billy-circular-loading — CircularLoadingComponent

> Category `feedback` · source `projects/billy-layout/src/lib/feedback/circular-loading/circular-loading.component.ts` · standalone component

## Role

**Determinate** progress ring: an SVG circle whose stroke fills proportionally to the `percent` input (stroke-dasharray/dashoffset technique, adapted from the CodePen jeremenichelli/vegymB). Unlike `billy-checkmark-loading` (indeterminate spinner), it visualizes a precise percentage, typically an upload progress. **No current usage in `src/app`** (verified via grep): the component is exported by the lib (`public-api.ts`) but orphaned — a candidate for reuse or removal.

## API

### Selector & import

```ts
import { CircularLoadingComponent } from 'billy-layout';
```

Selector: `billy-circular-loading`.

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `percent` | `input<number>` | `0` | Progress percentage (0–100). Each change updates the stroke offset (0.35 s CSS transition). |

No output.

### Notable members

- `circle = viewChild<ElementRef<SVGCircleElement>>('circle')` — reference to the SVG circle.
- `setProgress(percent: number): void` — computes and applies the `stroke-dashoffset` (`circumference - percent/100 * circumference`). Called by `ngAfterViewInit` and `ngOnChanges`.
- `radius` / `circumference` — measured on the actual circle in `ngAfterViewInit`, where the `stroke-dasharray` is initialized.

## Usage example

No usage in `src/app` to date. Typical usage:

```html
<billy-circular-loading [percent]="uploadProgress()"></billy-circular-loading>
```

## Styles & theming

- Fixed **44 × 44 px** SVG, circle `r=21`, 2 px stroke, hard-coded color `#23b7e5` (historical Angle blue — no `--billy-*` token).
- The fill starts from the top: `transform: rotate(-90deg)` on the circle.
- Progress animated via `transition: 0.35s stroke-dashoffset` (file `circular-loading.component.css` — plain CSS, not SCSS).
- No dark mode, no `prefers-reduced-motion` handling.

## Pitfalls & notes

- The geometry is measured in `ngAfterViewInit`: a non-zero initial `percent` is only painted after the first render (the pre-view `ngOnChanges` is ignored because `circle()` is still undefined — and `circumference` would be 0).
- `percent` is not clamped: a value > 100 produces a negative offset (an "overfilled" ring that looks full), a negative value an empty ring.
- Half-migrated to signals: `percent` is a signal `input()` but updates still go through `ngOnChanges` + direct DOM manipulation (no `effect`). `ngOnInit` is empty.
- Size and color are not configurable without CSS overrides from the parent.
