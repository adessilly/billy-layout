# (base class, no selector) — DefaultFormSignalComponent

> Category `forms` · source `projects/billy-layout/src/lib/forms/default-form/default-form-signal.component.ts` · standalone component (empty template, meant to be inherited)

## Purpose

Base class for routed "create / edit" forms in the signals era: it receives the `:id` route parameter via `withComponentInputBinding` (input `id`), normalizes it into `beanId` (number or `null`) and derives `editionMode` from it. A form component extends it, calls `super()` and gets the three signals. Used by `src/app/auth/pages/achat/achat-form/achat-form.component.ts` (`AchatFormComponent extends DefaultFormSignalComponent`) — the only consumer to date, purchases being the first migrated form. **Note**: the historical routed variant `DefaultFormComponent` (imperative `ActivatedRoute` reading, navigation, etc.) stayed in the app, `src/app/shared/components/default-form/`, and still powers devis-form, vente-form, client-form, vente-paiements…

## API

### Selector & import

```ts
import { DefaultFormSignalComponent } from 'billy-layout';
```

No selector and no template (`template: ''`): this component is not placed in a template, it is **extended**.

### Inputs (signals API)

| Input | Type | Default | Description |
|---|---|---|---|
| `id` | `number \| null` | `null` | `:id` route parameter, pushed automatically by `withComponentInputBinding`. In practice arrives as `string`, `undefined` (parameter absent) or `null`. |

No outputs.

### Public members (derived signals)

| Member | Type | Description |
|---|---|---|
| `beanId` | `linkedSignal<number \| null>` | Normalized `id`: `null` if `id` is `null`, `undefined` or non-numeric; otherwise `+id`. `linkedSignal`: recomputed on every route change, but **reassignable** by the subclass (e.g. `set` after creation to switch to edit mode without navigating). |
| `editionMode` | `computed<boolean>` | `true` as soon as `beanId` is not `null` — edit mode vs create mode. |

## Slots / projection

None (no template).

## Usage example

Real usage in `src/app/auth/pages/achat/achat-form/achat-form.component.ts`:

```ts
import { DefaultFormSignalComponent } from 'billy-layout';

@Component({ selector: 'app-achat-form', /* ... */ })
export class AchatFormComponent extends DefaultFormSignalComponent implements AfterViewInit, OnDestroy {
  constructor(/* ... */) {
    super();
    effect(() => {
      // beanId()/editionMode() react to the :id route parameter
      this.beanToForm(this.achatState.data());
    });
  }
}
```

The corresponding route exposes `:id` and the app is configured with `withComponentInputBinding()` so the parameter feeds the `id` input.

## Styles & theming

No styles (`styleUrls: []`) — the class renders nothing.

## Pitfalls & notes

- **`withComponentInputBinding` pushes `undefined`** when the `:id` parameter is absent (creation route): the `beanId` guard explicitly tests `null`, `undefined` **and** `Number.isNaN(+id)` — `Number.isNaN(undefined)` is `false` because `Number.isNaN` does not coerce, hence the separate check.
- `beanId` is a `linkedSignal`, not a `computed`: it resynchronizes with the route but can be overridden locally (`this.beanId.set(newId)`), which flips `editionMode` without navigating.
- The class imports `OnInit` without implementing it — dead import, no effect.
- Not to be confused with `DefaultFormComponent` (`src/app/shared/components/default-form/`), the non-signals variant that stayed in the app: different API (imperative ActivatedRoute), still the majority in forms.
