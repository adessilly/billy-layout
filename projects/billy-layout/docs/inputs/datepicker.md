# billy-datepicker — DatepickerComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/datepicker/` · standalone component (ControlValueAccessor)

## Purpose

Self-contained date field (no Bootstrap, no application dependency) replacing the old `app-input-datepicker` based on `bsDatepicker`. It combines manual `dd/mm/yyyy` entry and a calendar (`billy-datepicker-calendar`) opened by clicking the button or pressing `ArrowDown`. On desktop the calendar shows as a popover anchored with `position: fixed` (so it escapes parent `overflow`); on mobile (≤ 640 px) it becomes a full-width bottom sheet with a dimmed backdrop and a focus trap.

Used everywhere a date is entered in `src/app`: `vente-form`, `devis-form`, `achat-form`, `prestations-form`, `vente-paiements-form`, `agenda-evenement-form`, `agenda-recurrence-form`, `agenda-filter-bar`, `recurrence-filter-bar`, etc.

## API

**Selector & import**

```ts
import { DatepickerComponent } from 'billy-layout';
```

```html
<billy-datepicker formControlName="dateEmission"></billy-datepicker>
```

**Inputs** (signals API — `input()`)

| Input | Type | Default | Description |
|---|---|---|---|
| `invalid` | `boolean` | `false` | Error state driven by the parent (red border + `aria-invalid`). |
| `placeholder` | `string` | `'dd/mm/yyyy'` | Placeholder of the text field. |
| `ariaLabel` | `string` | i18n `datepicker.ariaLabel` (EN `'Date'`) | `aria-label` of the input. |
| `locale` | `string` | i18n `datepicker.dateLocale` (`'en'` in English, `'fr-FR'` in French) | Locale forwarded to the calendar (`Intl` labels). When the input is not set, it follows the active i18n locale. |

The calendar-button and dialog `aria-label`s also come from the dictionary (`datepicker.openCalendar`, `.chooseDate`, `.chooseMonth`). Built-in strings are localizable — see [i18n](../core/i18n.md).

**Outputs** — no output of its own: the value flows through the CVA.

**Public methods**

| Method | Description |
|---|---|
| `open()` / `close(focusField = false)` / `toggle()` | Programmatic opening/closing of the panel. |
| `onDatePicked(date: Date)` | Calendar callback: sets the value, propagates to the form, closes and re-focuses the field. |

Read-only exposed signals (used by the template): `value` (`Date | null`), `text` (displayed entry), `isOpen`, `isMobile`, `isDisabled`, `panelPos`.

## ControlValueAccessor

- **Model value type**: `string | null` in **`'yyyy-MM-dd'`** format (or `null` if the field is empty or the entry invalid) — same contract as the old bsDatepicker field.
- `writeValue()` accepts a `'yyyy-MM-dd'` string (possibly followed by a time, e.g. full ISO) **or** a `Date` object; internally everything is reduced to a local `Date` at midnight.
- Manual entry: accepts `dd/mm/yyyy` with `/`, `-` or `.` separators; a 2-digit year becomes `20xx`; impossible dates (31/02) are rejected → `null` model.
- No `NG_VALIDATORS`: the component does not self-validate, the error state is shown via the `invalid` input (e.g. `[invalid]="!ctrl.dateEmission.valid && ctrl.dateEmission.touched"`).
- `setDisabledState()`: disables input and button, and closes the panel if it was open.

## Usage example

Real excerpt from `src/app/auth/pages/vente/vente-form/vente-form.component.html`:

```html
<div class="vf-field vf-span-4">
  <label class="vf-label">Issue date <span class="vf-req">*</span></label>
  <billy-datepicker
    [invalid]="!ctrl.dateEmission.valid && ctrl.dateEmission.touched"
    formControlName="dateEmission"></billy-datepicker>
</div>
```

## Styles & theming

- Inlined styles (with fallbacks) reproducing the `billy-input` mixin rules to stay independent from the application: tokens `--billy-input-bg`, `--billy-input-border`, `--billy-input-radius`, `--billy-input-color`, `--billy-input-placeholder`, `--billy-focus-border`, `--billy-focus-ring`, `--billy-danger`, `--billy-accent(-soft/-strong)`, `--billy-surface(-border/-shadow)`. Automatic dark mode via the tokens.
- Field height customizable per instance: `--datepicker-height` (default 35 px).
- Desktop panel: `position: fixed`, `z-index: 2000` (above the side-panels at 1051, below toasts at 9000+), repositioned on scroll/resize, flips upward (`openUp`) when there is not enough room below the field.
- Mobile ≤ 640 px: `rgba(17,24,39,.45)` backdrop, sheet anchored at the bottom with a visual handle, 20 px rounded corners, `padding-bottom: env(safe-area-inset-bottom)`, `translateY(100%)` entry animation.
- `prefers-reduced-motion`: transitions and animations disabled.

## Pitfalls & notes

- **Zoneless**: all state is in signals; global listeners (`document click`, `scroll`, `resize`) are set/removed by hand and cleaned up via `DestroyRef.onDestroy`.
- **Keyboard**: `ArrowDown` on the field opens the calendar, `Escape` closes (re-focusing the field). In the desktop panel, `Tab` closes and returns focus to the field; in bottom-sheet mode, `Tab` is trapped inside the sheet (focus trap on the non-disabled `button` elements).
- Blurring the field reformats the text (`text`) to `dd/mm/yyyy` if the value is valid, but does not clear an invalid partial entry — the model is `null` in that case.
- The popover is 300 px wide / ~380 px max high; the `left` position is clamped to stay within the viewport.

---

# billy-datepicker-calendar — DatepickerCalendarComponent

> Category `inputs` · source `projects/billy-layout/src/lib/inputs/datepicker/datepicker-calendar.component.ts` · standalone component (no CVA — presentation component)

## Purpose

Self-contained calendar grid (no application dependency) used by `billy-datepicker`, but exported separately in the public API and therefore usable on its own (e.g. inline calendar). Two views: days and months, full keyboard navigation (ARIA grid pattern, roving tabindex), labels generated via `Intl` from the `locale` input. Week starts on Monday. In `src/app`, it is only consumed indirectly via `billy-datepicker`.

## API

**Selector & import**

```ts
import { DatepickerCalendarComponent } from 'billy-layout';
```

**Inputs**

| Input | Type | Default | Description |
|---|---|---|---|
| `selected` | `Date \| null` | `null` | Selected date (highlighted + month displayed by default). |
| `locale` | `string` | i18n `datepicker.dateLocale` (`'en'` in English, `'fr-FR'` in French) | Locale of the `Intl` labels (months, days, aria-labels). When the input is not set, it follows the active i18n locale. |
| `autofocusDay` | `boolean` | `false` | Focuses the active day at first render (popup case). |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `datePicked` | `Date` | Chosen day (local date at midnight, time stripped). |

**Public methods**

| Method | Description |
|---|---|
| `focusActiveDay()` | Returns focus to the element carrying `tabindex="0"` in the current view (usable by the parent on opening). |
| `goPrev()` / `goNext()` | Previous/next month (days view) or previous/next year (months view). |
| `toggleView()` / `showDays()` / `pickMonth(m)` | Toggles days ↔ months. |
| `pickDay(date)` / `pickToday()` | Emit `datePicked`. |

## Usage example

Real usage in `datepicker.component.html`:

```html
<billy-datepicker-calendar
  [selected]="value()"
  [locale]="locale()"
  [autofocusDay]="true"
  (datePicked)="onDatePicked($event)" />
```

## Styles & theming

- Theme entirely carried by the `--billy-*` tokens with fallbacks: `--billy-input-color`, `--billy-text-soft`, `--billy-text-muted`, `--billy-accent`, `--billy-accent-soft`, `--billy-accent-strong`, `--billy-focus-ring`, `--billy-focus-border`, `--billy-surface`, `--billy-divider`. Automatic dark mode, no style dependency toward the application.
- Fixed 296 px width; "today" marked by an accent dot under the number; selected day as an accent disc.
- Responsive ≤ 640 px: full-width grid (max 400 px centered), enlarged touch targets (days 42 px, months 46 px).
- `prefers-reduced-motion` respected.

## Pitfalls & notes

- **Keyboard navigation (days view)**: arrows = ±1 day / ±7 days, `Home`/`End` = start/end of week, `PageUp`/`PageDown` = ±1 month (`Shift` = ±12 months). The grid follows the ARIA grid pattern with roving tabindex (a single day at `tabindex="0"`).
- **Months view**: `role="listbox"`, arrows ±1/±3, `Escape` goes back to the days view **without** closing the parent datepicker (stopPropagation).
- **Zoneless**: focus after re-render goes through `afterRenderEffect` + a `focusRequest` counter signal — "no reliable `setTimeout`" in zoneless. The title is announced to screen readers via an `aria-live="polite"` region.
- `weekdays` and `monthNames` are derived from `Intl.DateTimeFormat` (week aligned on Monday, January 5, 2026): changing `locale` translates the whole calendar.
