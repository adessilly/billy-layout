# billy-button-switch — ButtonSwitchComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/button-switch/` · standalone component (ControlValueAccessor)

## Purpose

BILLy's homegrown switch — an iOS-style left/right toggle replacing the old `ad-button-switch` ("switch" theme) from ad-library. It is a plain accessible `<button role="switch">` (Space/Enter keyboard, `aria-checked`), aligned with the form design language, with optional label and state icon.

Used in `src/app`: `vente-form` (credit note), `client-form` (VAT exemption), `agenda-recurrence-form`, `peppol-facture-summary`.

## API

**Selector & import**

```ts
import { ButtonSwitchComponent } from 'billy-layout';
```

**Inputs** (signals API — `input()`)

| Input | Type | Default | Description |
|---|---|---|---|
| `labelOn` | `string` | `''` | Label displayed on the right when the state is active (optional). |
| `labelOff` | `string` | `''` | Label displayed when the state is inactive (optional). |
| `iconOn` | `string` | `''` | Icon class (font, e.g. Font Awesome) displayed inside the thumb in the active state. |
| `iconOff` | `string` | `''` | Icon class displayed inside the thumb in the inactive state. |
| `disabled` | `boolean` (`booleanAttribute`) | `false` | Static disabling, combined with the form's. |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `valueChange` | `boolean` | Emitted on every toggle (in addition to the CVA propagation). |

**Public methods**

| Method | Description |
|---|---|
| `toggle()` | Toggles the state (no-op if disabled): updates the model, calls `onTouched` and emits `valueChange`. |

Exposed computeds: `checked`, `isDisabled`, `currentLabel`, `currentIcon`.

## ControlValueAccessor

- **Model value type**: `boolean`. `writeValue()` coerces anything into a boolean (`!!v`) — `null`/`undefined` becomes `false`.
- Compatible with `[ngModel]`, `[(ngModel)]`, `formControlName` **and** the signal-forms `[formField]` directive.
- No `NG_VALIDATORS`.
- `setDisabledState()`: combined with the `disabled` input (`isDisabled = disabled() || disabledFromForm()`), the button receives `disabled` + `aria-disabled`.

## Usage example

Real excerpts from `src/app`:

```html
<!-- vente-form.component.html (reactive form) -->
<div class="vf-switch-box">
  <billy-button-switch id="switchNoteCredit" formControlName="noteCredit"></billy-button-switch>
  <span class="vf-switch-text">Corrective document</span>
</div>

<!-- client-form.component.html (signal-forms) -->
<billy-button-switch [formField]="formClient.exitTva" id="switchExitTva"></billy-button-switch>
```

## Styles & theming

- Local variables on `:host`: `--bsw-track-off` (`#d1d5db`), `--bsw-track-on` (= `--billy-accent`), `--bsw-thumb` (`#fff`); 46×26 px track, 20 px thumb.
- Dark mode via `:host-context(body.dark-mode)`: inactive track `#49545a`, thumb `#e8eaed`.
- State label in `--billy-input-color`, switching to `--billy-accent-strong` in the active state; the thumb icon is tinted `--bsw-track-on`.
- Micro-interactions: iOS-style thumb "stretch" while pressed (`:active` widens the thumb to 24 px), `--billy-focus-ring` ring on `:focus-visible` (carried by the track, no browser outline), spring transitions on `transform`.
- Disabled: `opacity: 0.55` + `cursor: not-allowed`.

## Pitfalls & notes

- It is a `<button type="button">`: it does not submit the form, and native keyboard input (Space/Enter) is intercepted by `onKeydown` with `preventDefault`.
- No `id` input: the `id` attribute set on `<billy-button-switch id="switchExitTva">` stays on the **host** element, not on the inner `<button>`. An external `<label for>` (as in `client-form`) therefore targets a non-labelable element: clicking the label does not toggle the switch. Provide the label via `labelOn`/`labelOff` or accept this behavior.
- `writeValue` triggers neither `valueChange` nor `onChange` (no loop): `valueChange` only reflects user interactions.
- **Zoneless**: internal state in signals (`innerValue`, `disabledFromForm`) + `computed`; no dependency on zone.js.
