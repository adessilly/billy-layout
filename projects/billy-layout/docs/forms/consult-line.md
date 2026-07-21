# billy-consult-line — ConsultLineComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/form-creation/consult-line/` · standalone component

## Purpose

Read-only counterpart of `billy-input-line`: a label in small gray capitals, then the projected value below it, stacked in a column. Used to display a piece of data in consultation screens with the same visual language as form labels. As of today, **no direct usage in `src/app`** (verified by grepping for `billy-consult-line`): recent consultation screens (achat-consult, vente-consult) use their own layouts; the component remains exported by the library and is part of the `FormCreationModule` bundle imported by `src/app/shared/components/tache-list-signalform/` (a vestigial import today — the template does not use the selector).

## API

### Selector & import

```ts
import { ConsultLineComponent } from 'billy-layout';
```

Selector: `<billy-consult-line>`. Also exported via the legacy `FormCreationModule` array (barrel `lib/forms/form-creation/index.ts`) which groups the five form-creation components.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string \| null` | `null` | Label displayed above the content. If `null`/empty, no `<label>` is rendered. |

No outputs or public methods.

## Slots / projection

Single `<ng-content>`: the value to display (text, badge, link…) is projected under the label.

## Usage example

No current usage in `src/app`; typical usage:

```html
<billy-consult-line label="Invoice number">
  {{ sale.no }}
</billy-consult-line>
```

## Styles & theming

- `:host { display: flex; flex-direction: column }`: label and content stacked; the host can receive grid classes.
- Label: fixed color `#A6A6A6`, `text-transform: uppercase`, `font-size: 0.8em`, `margin: 0` — same style as the `billy-input-line` label, without a `--billy-*` token (identical rendering in dark mode).

## Pitfalls & notes

- Unlike `billy-input-line`, no `.form-group` class and no bottom margin: vertical spacing is entirely up to the consumer.
- No `mandatory` or `info` inputs: this is a consultation component, not an input one.
- Candidate for cleanup or reuse: exported and maintained, but orphaned on the app side as of 2026-07-17.
