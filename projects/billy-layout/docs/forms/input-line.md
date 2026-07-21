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

No outputs or public methods.

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
- The projected field is not linked to the `<label>` (no `for`/`id`): no automatic accessibility association.
- The `info` tooltip is a native `title`: no rich tooltip, invisible to keyboard/touch users.
- For consultation (read-only), use `billy-consult-line` instead, which shares the same label style.
