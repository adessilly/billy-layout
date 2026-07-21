# billy-input-password — InputPasswordComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/input-password/` · standalone component (ControlValueAccessor)

## Purpose

The design system's password field: padlock icon, show/hide eye button (`lock`, `eye`, `eye-off` icons from the [`billy-icon`](../core/billy-icon.md) set), optional built-in label, and — optionally — an animated strength meter with a criteria list (`checkStrength`) or a live match indicator (`compareTo`, for a confirmation field). The meter is **purely indicative**: validity remains carried by the parent form's validators.

Used in `src/app` by the password change: `src/app/auth/pages/compte/compte-password/compte-password.component.html` (three instances: old password, new one with meter, confirmation with comparison).

## API

**Selector & import**

```ts
import { InputPasswordComponent, PasswordCriterion } from 'billy-layout';
```

**Inputs** (signals API — `input()`)

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label displayed above the field (`<label for>` linked to the input via an auto `billy-password-N` id). |
| `mandatory` | `boolean` | `false` | Adds the accent asterisk to the label. |
| `placeholder` | `string` | `'••••••••'` | Placeholder. |
| `autocomplete` | `string` | `'new-password'` | Value of the `autocomplete` attribute (`current-password` for an existing field). |
| `checkStrength` | `boolean` | `false` | Shows the strength meter + the list of 5 criteria under the field. |
| `compareTo` | `string \| null` | `null` | Value to match (confirmation field): shows the match indicator as soon as the field is not empty. |
| `invalid` | `boolean` | `false` | Invalid state driven by the parent (`is-invalid` class → `billy-input-invalid` mixin). |

**Outputs** — none: the value flows through the CVA.

**Public methods**

| Method | Description |
|---|---|
| `toggleShow()` | Toggles clear-text display (`type="text"` ↔ `type="password"`). |

Exposed computeds: `criteria` (`PasswordCriterion[]`: 8 characters minimum, lowercase letter, uppercase letter, digit, special character), `strength` (`{ level: 0–4, label: ''/Weak/Fair/Good/Excellent, tone }` depending on the number of fulfilled criteria), `matches` (strict equality with `compareTo`), `panelOpen` (panel unfolded on focus, kept open while the field is not empty).

The criteria labels and strength labels come from the i18n dictionary (`password.minLength` / `.lowercase` / `.uppercase` / `.digit` / `.special` and `password.weak` / `.fair` / `.good` / `.excellent` — the values above are the English ones). Built-in strings are localizable — see [i18n](../core/i18n.md).

## ControlValueAccessor

- **Model value type**: `string` (never transformed). `writeValue(null)` becomes `''`.
- No `NG_VALIDATORS`: the meter and criteria are indicative; visual invalidity goes through the `invalid` input.
- `setDisabledState()`: `disabled` signal → `disabled` attribute on the input (the eye button stays clickable).

## Usage example

Real excerpt from `src/app/auth/pages/compte/compte-password/compte-password.component.html`:

```html
<billy-input-password class="cp-field"
  formControlName="newPassword"
  label="New password"
  autocomplete="new-password"
  [checkStrength]="true"
  [mandatory]="true" />

<billy-input-password class="cp-field"
  formControlName="newPasswordRetype"
  label="Confirm new password"
  autocomplete="new-password"
  [compareTo]="newPasswordValue()"
  [mandatory]="true" />
```

## Styles & theming

- Field based on the `billy-forms` mixins: `@include forms.billy-input`, `billy-input-invalid`, `billy-focus` (eye button). Tokens: `--billy-input-*`, `--billy-text-soft/-muted`, `--billy-accent(-strong)`, `--billy-divider`, `--billy-section-bg/-border`, `--billy-addon-hover-bg`, `--billy-focus-ring`.
- Semantic accents of the meter defined locally (they don't exist in the design language): `--ip-ok` `#059669`, `--ip-warn` `#d97706`, `--ip-bad` `#dc2626` — lightened in dark mode.
- **Dark mode without `:host-context`**: the component also lives in dialogs moved under `<body>`; the override goes through `::ng-deep body.dark-mode .ip-root` (+ tokens).
- Strength panel unfolded/folded via `grid-template-rows: 0fr → 1fr` (height animation without JS); 4 meter segments with cascading `transition-delay`; criteria check mark drawn with `stroke-dashoffset`.
- WebKit autofill neutralized (inset `-webkit-box-shadow` in the background color). `prefers-reduced-motion` respected.

## Pitfalls & notes

- `compareTo` expects a **value**, not a control: the parent must expose the first field's value (e.g. a `newPasswordValue()` signal). The indicator only appears if `compareTo !== null` **and** the current field is not empty.
- The meter invalidates nothing: to block submission, set validators on the `FormControl` (which is what `compte-password` does) and relay the state via `[invalid]`.
- The eye button has `aria-pressed` and English `aria-label`s; the meter and the match indicator use `role="status"` (announced to screen readers).
- **Zoneless**: internal state in signals (`value`, `show`, `focused`, `disabled`) and derivations in `computed` — nothing to do on the consumer side.
- The auto-incremented id (`billy-password-N`, module counter) guarantees label/input uniqueness for multiple instances on the same page.
