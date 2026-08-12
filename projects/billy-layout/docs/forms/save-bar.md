# billy-save-bar — SaveBarComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/save-bar/` · standalone component

## Purpose

Form action bar, sticky at the bottom of the screen (`position: sticky`): a "Save" button (with loading state) on the right, a ghost "Back"/cancel button, and a free zone on the left for extra actions. Both buttons are [`billy-button`](../buttons/button.md) — `plain` variant tinted by `colorSave` for save, `ghost` variant for cancel. It is the standard conclusion of every form in the app: `src/app/auth/pages/achat/achat-form/achat-form.component.html`, `src/app/auth/pages/vente/vente-form/vente-form.component.html`, `src/app/auth/pages/devis/devis-form/devis-form.component.html`, `src/app/auth/pages/compte/compte.component.html`… It also serves as a dialog footer via the `no-theme` class (vente-paiements, compte-password, fichiers-email).

## API

### Selector & import

```ts
import { SaveBarComponent } from 'billy-layout';
```

Selector: `<billy-save-bar>`.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `variant` | `BillySaveBarVariant` | `'floating'` | Skin of the bar. `floating`: the sticky card that hovers above the scrolling page. `embedded`: compact transparent row for a bar placed inside a container that already provides its white surface (panel, consult-card…) — no surface, no border, no shadow, no sticky. |
| `disabled` | `boolean` | `false` | Disables the save button (typically `!formGroup.valid`). |
| `loading` | `boolean` | `false` | Replaces the save button's icon + label with a spinner and `labelSaveLoading`, and **neutralizes the click** (billy-button ignores clicks while loading) — protects against double submission. |
| `labelSave` | `string` | i18n `saveBar.save` (EN `'Save'`) | Label of the main button. When the input is not set, the default comes from the i18n dictionary. |
| `iconSave` | `string` | `'fa-solid fa-floppy-disk'` | Icon of the main button; empty string to display none. |
| `colorSave` | `BillyButtonColor` | `'primary'` | Tint of the main button, passed to `billy-button`'s `color`. Values: `neutral` \| `info` \| `primary` \| `warning` \| `error`. |
| `labelSaveLoading` | `string` | i18n `saveBar.saving` (EN `'Saving…'`) | Label displayed while `loading`. |
| `labelCancel` | `string` | i18n `saveBar.back` (EN `'Back'`) | Label of the cancel button. |
| `iconCancel` | `string` | `'fa-solid fa-chevron-left'` | Icon of the cancel button; empty string to display none. |
| `cancelVisible` | `boolean` | `true` | Shows/hides the cancel button. |
| `saveVisible` | `boolean` | `true` | Shows/hides the save button. |

Built-in strings are localizable — see [i18n](../core/i18n.md).

### Outputs

| Output | Payload | Description |
|---|---|---|
| `save` | `void` | Click on the save button. |
| `cancel` | `void` | Click on the cancel/back button. |

### Public methods

`askSave()` / `askCancel()`: output emission relays (intended for the template).

## Slots / projection

Single `<ng-content>`, rendered in `.left-zone` (flex, 10px gap): secondary actions to the left of the buttons (e.g. "Send invoice" button, deletion…). The cancel/save buttons occupy `.right-zone`, pushed to the right by `margin-left: auto`.

## Usage example

Real usage in `src/app/auth/pages/achat/achat-form/achat-form.component.html`:

```html
<billy-save-bar
  [disabled]="!formGroup.valid"
  [loading]="achatState.loading()"
  (cancel)="askCancel()">
</billy-save-bar>
```

As a dialog footer, without card chrome, in `src/app/auth/pages/vente/vente-paiements/vente-paiements.component.html`:

```html
<billy-dialog-form-footer>
  <billy-save-bar class="no-theme" [loading]="loading()" (save)="askSave()" (cancel)="askCancel()" />
</billy-dialog-form-footer>
```

Inside a panel that is already white — the bar concludes the form without stacking a card on a card:

```html
<div class="my-panel">
  <!-- … the form fields … -->
  <billy-save-bar variant="embedded" [loading]="loading()" (save)="askSave()" (cancel)="askCancel()" />
</div>
```

## Styles & theming

- Sticky host `bottom: 0`, `z-index: 1001`, dressed like the DS cards (`billy-card` mixin in spirit): `--billy-surface`, `--billy-surface-border` edge, 16px corners, `--billy-card-shadow` + upward halo to "float" above the scrolling content — automatic dark mode via the tokens.
- Buttons: delegated to [`billy-button`](../buttons/button.md) — save as the `plain` variant tinted by `colorSave`, cancel as the `ghost` variant (neutral ghost on the input tokens, insensitive to color). Colors, hover, focus (`--billy-focus-ring`), `disabled` state and loading spinner all come from the button; the save-bar now only handles layout.
- `min-width: 128px` set on the `billy-button` element selector (deliberately low specificity) so consumer overrides can widen a button.
- **`no-theme` class on the host**: removes edge, background, shadow, padding and radius — the bar becomes a plain row of buttons, fit for a dialog footer.
- **`variant="embedded"`**: same chrome reset (transparent, no border/shadow/radius) but the bar also drops `position: sticky` (it scrolls with its container), tightens the spacing (`8px` top padding, `8px` gap) and releases the `min-width: 128px` floor on the buttons so they fit a narrow panel. Use it whenever the parent surface is already white; `no-theme` remains the zero-padding flavour for a container that provides its own footer padding (dialogs).
- Mobile (≤767px): frosted full-width bar (translucent `color-mix` background + `backdrop-filter: blur`), `safe-area-inset-bottom`, buttons at `flex: 1` — skipped for `no-theme` and `embedded`, which keep their flat rendering (the buttons still spread over the width).

## Pitfalls & notes

- The save button is `type="submit"`: placed inside a `<form>`, a click triggers **both** the `save` output and the form's `(ngSubmit)` — wire one or the other, not both.
- `loading` now neutralizes the click (billy-button blocks clicks while loading): no need to double up with `[disabled]` just to prevent double submission, though `[disabled]` remains useful for form invalidity.
- `z-index: 1001`: below the side-panels (1050/1051) and the dialogs — intentional, the `billy-form-side-panel` overlay covers the bar.
- For a narrow side-panel footer, the save-bar does not fit (card chrome + 128px `min-width` per button): use the "panel footer buttons" mixins from `_billy-forms.scss` (see agenda, prestations).
- `iconSave`/`iconCancel` are injected via `[class]`: any Font Awesome class list is accepted.
