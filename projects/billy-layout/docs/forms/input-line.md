# billy-input-line — InputLineComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/form-creation/input-line/` · standalone component

## Purpose

Form row in edit mode: a label in small gray capitals above the field, with an optional required-field asterisk and tooltip, the field itself being projected by the consumer (`<ng-content>`). It is the most widely used layout brick of the app's forms: found among others in `src/app/auth/pages/achat/achat-form/achat-form.component.html` (every field of the purchase form), `src/app/auth/pages/devis/devis-form/devis-form.component.html`, `src/app/auth/pages/peppol-facture/peppol-facture-summary/peppol-facture-summary.component.html` and `src/app/shared/components/fichiers-manager/fichiers-generation/fichiers-generation.component.html`.

## API

### Selector & import

```ts
import { InputLineComponent } from 'billy-layout';
```

Selector: `<billy-input-line>`. Also exported via the legacy `FormCreationModule` array (barrel `lib/forms/form-creation/index.ts`) which groups the five form-creation components for a one-shot import in `imports: [...]`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label displayed above the field. If empty, no `<label>` is rendered. |
| `mandatory` | `boolean` | `false` | Appends an asterisk `<span class="mandatory">*</span>` after the label. |
| `info` | `string` | `''` | If non-empty, displays an `fa-circle-info` icon whose `title` (native tooltip) contains this text. |
| `nomarginbottom` | `boolean` | `false` | Sets `.form-group-nomarginbottom` on the wrapper to cancel the bottom margin (useful at the end of a panel or in a grid that already manages spacing). |
| `fieldId` | `string` | `''` | Id of the projected control the label must name. Left empty, the control is detected automatically — set it when the row projects several controls. |

No outputs or public methods.

## Accessibility

The row names the field it wraps: the visible label is programmatically associated
with the projected control, which is what WCAG 4.1.2 (Name, Role, Value) requires.
Nothing to do on the consumer side — projecting a field is enough.

- **Detection**: the first projected `input` / `select` / `textarea` is used;
  failing that, the first widget trigger (`button`, `[role="combobox"]`,
  `[role="listbox"]`, `[contenteditable]`) — which is how `billy-dropdown` gets
  named. Controls appearing later (`@if`, `@for`) are picked up too. Once wired,
  a control keeps the label as long as it stays projected, so the inner controls
  a widget renders when it opens (the dropdown search box) never steal it.
- **Association**: the label carries `for` (click-to-focus) and the control gets
  `aria-labelledby` pointing at it. `aria-labelledby` rather than `for` alone so
  the row label also wins over a generic `aria-label` carried by a library field
  (`billy-datepicker` announces "Due date" and no longer "Choose a date").
  Controls named from their own content (a dropdown trigger) get
  `aria-labelledby="<label> <control>"`, keeping the selected value announced.
- **`mandatory`**: the asterisk is `aria-hidden` (decorative) and the required
  state is exposed as `aria-required="true"` on the control.
- **`info`**: the text is repeated in a visually hidden span referenced by
  `aria-describedby`, so it is no longer mouse-only.
- **Consumer wins**: an `aria-labelledby`, `aria-describedby` or `aria-required`
  you set yourself is never overwritten. An explicit `id` on your field is kept;
  otherwise the row generates one.

```html
<!-- Two controls in one row: name the one that matters -->
<billy-input-line label="Payment deadline" fieldId="deadline-days">
  <input id="deadline-days" class="form-control" type="number" formControlName="days" />
  <span>days</span>
</billy-input-line>
```

## Slots / projection

Single `<ng-content>`: the field (input, `billy-datepicker`, `billy-dropdown`, `billy-input-prefix-suffix`…) is provided by the consumer and rendered under the label.

## Usage example

Real usage in `src/app/auth/pages/achat/achat-form/achat-form.component.html`:

```html
<billy-input-line class="col-lg-4 col-md-6 col-sm-6" [mandatory]="true" label="Label">
  <input class="form-control" type="text"
    [class.is-invalid]="!ctrl.libelle.valid && ctrl.libelle.touched"
    formControlName="libelle" />
</billy-input-line>

<billy-input-line class="col-lg-4 col-md-6 col-sm-6" [mandatory]="true" label="Price (incl. VAT)">
  <billy-input-prefix-suffix suffix="€">
    <input class="form-control" type="number" formControlName="prix" />
  </billy-input-prefix-suffix>
</billy-input-line>
```

## Styles & theming

- `:host { display: block }`: the component behaves as a block; grid classes (`col-lg-4`…) are commonly passed directly on the host.
- Label: fixed color `#A6A6A6`, `text-transform: uppercase`, `font-size: 0.8em` — no `--billy-*` token, the color is identical in dark mode (it stays readable on a dark background).
- The wrapper carries the `.form-group` class, whose bottom margin (`margin-bottom: 1rem`) comes from the app's global legacy CSS (`src/app/layout/layout-ui-loader/billy-legacy.scss`), not from the library.

## Pitfalls & notes

- **Global CSS dependency**: the `.form-group` bottom margin is defined on the app side (billy-legacy.scss, loaded by the layout-ui-loader). Outside billy-client, the component has no default vertical spacing.
- The asterisk's `.mandatory` class is not styled in the component's SCSS: its color also comes from the app's global styles.
- Do not wrap a field that already renders its own label (`billy-input-password`
  with a `label`, a code field with `inputId` + label): the row would add a second
  visible label.
- With several projected controls and no `fieldId`, only the first one is named —
  the others need their own `aria-label`.
- The `info` tooltip is still a native `title` visually: no rich tooltip, and it
  does not open on keyboard focus (its text is read by screen readers through
  `aria-describedby`).
- For consultation (read-only), use `billy-consult-line` instead, which shares the same label style.
