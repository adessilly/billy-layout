# [billyAutofocus] — AutofocusDirective

> Category `core` · source `projects/billy-layout/src/lib/core/autofocus/autofocus.directive.ts` · directive

## Purpose

Minimalist directive that gives focus to its host element as soon as the view is initialized (`ngAfterViewInit` → `nativeElement.focus()`). Intended for fields you want ready for typing when a form or dialog opens, where the native HTML `autofocus` attribute does not replay on content inserted dynamically by Angular.

**No usage in the application to date** (verified by grep in `src/app` — only the export in `public-api.ts` references it, with the note "NB: no app usage to date"). It is kept in the library as an available building block.

## API

### Selector & import

```ts
import { AutofocusDirective } from 'billy-layout';
```

Selector: `[billyAutofocus]` · standalone (the default since Angular ≥ 19; no explicit flag).

### Inputs / Outputs

None. The directive has no input, output, or public method: setting the attribute is enough.

| Lifecycle | Effect |
|---|---|
| `ngAfterViewInit` | `this.el.nativeElement.focus()` on the host element. |

## Usage example

No real usage to cite; typical usage:

```html
<input class="billy-field" type="text" billyAutofocus [(ngModel)]="label" />
```

```ts
import { AutofocusDirective } from 'billy-layout';

@Component({
  imports: [AutofocusDirective],
  /* ... */
})
```

## Styles & theming

No styles. Reminder: the DS reboot sets `*:focus { outline: 0 !important }` — the focus given by the directive is therefore only visible if the field has its own focus style (the `billy-input`/`billy-field` mixins provide one).

## Pitfalls & notes

- **Pre-signals API**: constructor injection (`private el: ElementRef`) and a classic lifecycle hook — no `inject()`, no `effect`. Works as is in zoneless mode (no dependency on change detection), but a modernization would go through `inject(ElementRef)` + `afterNextRender`.
- The focus is given **once**, at view initialization. An element mounted inside an `@if` refocuses on every recreation; an element merely re-shown (CSS) does not refocus.
- No guard: if the host is not focusable (not a field, no `tabindex`), the `focus()` call is silently a no-op.
- In a dialog moved under `<body>` (the `Dialog` engine), check that the directive runs after the element is visible — a `focus()` on a `display: none` element does nothing; it is then up to the dialog component to orchestrate focus on open.
