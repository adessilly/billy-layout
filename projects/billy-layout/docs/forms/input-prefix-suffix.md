# billy-input-prefix-suffix — InputPrefixSuffixComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/form-creation/input-prefix-suffix/` · standalone component

## Purpose

Field group framed by a prefix and/or a suffix ("No.", "€", "%", icon…), the field itself being projected by the consumer. Standalone successor of the Bootstrap 4 `.input-group` (with `.input-group-prepend/append`) that came from the Angle theme: since Bootstrap was dropped, the structure is homegrown and colors come from the `--billy-*` tokens. Addons can be clickable (e.g. the "regenerate" icon of the invoice number). Used in `src/app/auth/pages/achat/achat-form/achat-form.component.html` ("€" and "%" suffixes), `src/app/auth/pages/vente/vente-form/vente-form.component.html` (clickable icon suffix generating the invoice number) and `src/app/auth/pages/devis/devis-form/devis-form.component.html`.

## API

### Selector & import

```ts
import { InputPrefixSuffixComponent } from 'billy-layout';
```

Selector: `<billy-input-prefix-suffix>`. Also exported via the legacy `FormCreationModule` array (barrel `lib/forms/form-creation/index.ts`).

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `prefix` | `string` | `''` | Text of the left addon. The addon is only rendered if `prefix` or `prefixIcon` is non-empty. |
| `suffix` | `string` | `''` | Text of the right addon. Same rule: rendered if `suffix` or `suffixIcon`. |
| `prefixIcon` | `string` | `''` | Font Awesome icon classes (`<i [class]>`) displayed in the prefix, before the optional text. |
| `suffixIcon` | `string` | `''` | Icon classes displayed in the suffix. |
| `prefixClickable` | `boolean` | `false` | If true, a click on the prefix emits `prefixClick` (otherwise the click is ignored). |
| `suffixClickable` | `boolean` | `false` | If true, a click on the suffix emits `suffixClick`; also sets the pointer cursor and the accented hover. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `prefixClick` | `void` | Click on the prefix, emitted only if `prefixClickable` is true. |
| `suffixClick` | `void` | Click on the suffix, emitted only if `suffixClickable` is true. |

### Public methods

`askPrefixClick()` / `askSuffixClick()`: internal click handlers (`*Clickable` guard then emission); public but intended for the template.

## Slots / projection

Single `<ng-content>` between the two addons: the field (usually an `<input class="form-control">`, sometimes a `<select>`). The SCSS only targets projected `input` and `select` — any other element will get neither flex nor corner joins.

## Usage example

Static suffix, in `src/app/auth/pages/achat/achat-form/achat-form.component.html`:

```html
<billy-input-prefix-suffix suffix="€">
  <input class="form-control" type="number" formControlName="prix" />
</billy-input-prefix-suffix>
```

Clickable icon suffix, in `src/app/auth/pages/vente/vente-form/vente-form.component.html`:

```html
<billy-input-prefix-suffix
  (suffixClick)="askGenerateNo()"
  [suffixIcon]="this.loadingNoFacture() ? 'fa-solid fa-rotate fa-spin' : 'fa-solid fa-rotate'"
  [suffixClickable]="true">
  <input id="vf-no" class="form-control" type="text" formControlName="no" />
</billy-input-prefix-suffix>
```

## Styles & theming

- `.ips-group` group: full-width flex, `margin-bottom: 1rem` (ex-`.mb-3`).
- Addons: `billy-input-group-addon` mixin (DS field height, `0 1rem` padding) + `billy-addon-button` — tokens `--billy-addon-bg`, `--billy-input-border`, `--billy-addon-color`, hover `--billy-addon-hover-bg` / `--billy-addon-hover-color`; automatic dark mode via these tokens.
- Joins: the addon yields its edge at the junction (`border-right/left: 0`) and only rounds its outer corners with `--billy-input-radius` (8px); on the field side, `:has(.ips-addon--prefix/--suffix)` zeroes out the adjoining corners.
- Hovered clickable addon: the icon switches to `--billy-accent-strong` (`#0e97bb`).

## Pitfalls & notes

- **IMPORTANT — the wrapper only gives the projected field its group role, not its box nor its typography.** The SCSS is explicit: via `::ng-deep` (necessary, since the field comes from the consumer and does not carry the wrapper's scope attribute), it only applies to the field its place within the group — `flex: 1 1 auto; width: 1%; min-width: 0`, `z-index: 2` on focus, and the straight corners on the addon side. Including `billy-field` there would be an overreach: `.ips-group[scope] input` (specificity 0,2,1) would beat the page's `.form-control[scope]` (0,2,0) and impose the DS typography on a consumer that has its own (the sale form's number field is 13px). **The box (height, padding, border, font) stays with the consumer** — the three consuming pages all project a `.form-control`.
- The `billy-input-group-addon` mixin is not used for the group itself (`billy-input-group` operates through `>` child selectors that would not reach the projected content, which carries the `_ngcontent` attribute of ITS page): the group is written by hand.
- **Known bug in the template**: the prefix addon tests `[class.clickable]="suffixClickable()"` (not `prefixClickable()`) — a prefix that is clickable on its own won't get the pointer cursor, and a clickable suffix makes the prefix look clickable. The emission guard (`askPrefixClick`) is correct, though.
- Corner joins rely on `:has()`: fine on the modern browsers targeted by the app.
