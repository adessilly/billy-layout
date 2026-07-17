# (classe de base, sans sélecteur) — DefaultFormSignalComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/default-form/default-form-signal.component.ts` · standalone component (template vide, destiné à l'héritage)

## Rôle

Classe de base pour les formulaires routés « création / édition » à l'ère signals : elle reçoit le paramètre de route `:id` via `withComponentInputBinding` (input `id`), le normalise en `beanId` (nombre ou `null`) et en déduit `editionMode`. Un composant de formulaire l'étend, appelle `super()` et dispose des trois signaux. Utilisée par `src/app/auth/pages/achat/achat-form/achat-form.component.ts` (`AchatFormComponent extends DefaultFormSignalComponent`) — seul consommateur à ce jour, l'achat étant le premier formulaire migré. **Note** : la variante historique routée `DefaultFormComponent` (lecture de l'`ActivatedRoute`, navigation, etc.) est restée dans l'app, `src/app/shared/components/default-form/`, et sert encore à devis-form, vente-form, client-form, vente-paiements…

## API

### Sélecteur & import

```ts
import { DefaultFormSignalComponent } from 'billy-layout';
```

Pas de sélecteur ni de template (`template: ''`) : ce composant ne se place pas dans un template, il s'**étend**.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `id` | `number \| null` | `null` | Paramètre de route `:id`, poussé automatiquement par `withComponentInputBinding`. Arrive en pratique comme `string`, `undefined` (paramètre absent) ou `null`. |

Pas d'output.

### Membres publics (signaux dérivés)

| Membre | Type | Description |
|---|---|---|
| `beanId` | `linkedSignal<number \| null>` | `id` normalisé : `null` si `id` est `null`, `undefined` ou non numérique ; sinon `+id`. `linkedSignal` : recalculé à chaque changement de route, mais **réassignable** par la sous-classe (ex. `set` après création pour basculer en édition sans naviguer). |
| `editionMode` | `computed<boolean>` | `true` dès que `beanId` n'est pas `null` — mode édition vs création. |

## Slots / projection

Aucun (pas de template).

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/achat/achat-form/achat-form.component.ts` :

```ts
import { DefaultFormSignalComponent } from 'billy-layout';

@Component({ selector: 'app-achat-form', /* ... */ })
export class AchatFormComponent extends DefaultFormSignalComponent implements AfterViewInit, OnDestroy {
  constructor(/* ... */) {
    super();
    effect(() => {
      // beanId()/editionMode() réagissent au paramètre :id de la route
      this.beanToForm(this.achatState.data());
    });
  }
}
```

La route correspondante expose `:id` et l'app est configurée avec `withComponentInputBinding()` pour que le paramètre alimente l'input `id`.

## Styles & theming

Aucun style (`styleUrls: []`) — la classe ne rend rien.

## Pièges & notes

- **`withComponentInputBinding` pousse `undefined`** quand le paramètre `:id` est absent (route de création) : la garde de `beanId` teste explicitement `null`, `undefined` **et** `Number.isNaN(+id)` — `Number.isNaN(undefined)` vaut `false` car `Number.isNaN` ne coerce pas, d'où le test séparé.
- `beanId` est un `linkedSignal`, pas un `computed` : il se resynchronise sur la route mais peut être écrasé localement (`this.beanId.set(nouvelId)`), ce qui fait basculer `editionMode` sans navigation.
- La classe importe `OnInit` sans l'implémenter — import mort, sans effet.
- Ne pas confondre avec `DefaultFormComponent` (`src/app/shared/components/default-form/`), la variante non-signals restée dans l'app : API différente (ActivatedRoute impérative), toujours majoritaire dans les formulaires.
