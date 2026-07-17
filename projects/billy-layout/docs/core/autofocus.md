# [billyAutofocus] — AutofocusDirective

> Catégorie `core` · source `projects/billy-layout/src/lib/core/autofocus/autofocus.directive.ts` · directive

## Rôle

Directive minimaliste qui donne le focus à son élément hôte dès que la vue est initialisée (`ngAfterViewInit` → `nativeElement.focus()`). Pensée pour les champs qu'on veut prêts à la frappe à l'ouverture d'un formulaire ou d'un dialogue, là où l'attribut HTML natif `autofocus` ne rejoue pas sur du contenu inséré dynamiquement par Angular.

**Aucun usage dans l'application à ce jour** (vérifié par grep dans `src/app` — seul l'export dans `public-api.ts` la référence, avec la note « NB : aucun usage app à ce jour »). Elle est conservée dans la librairie comme brique disponible.

## API

### Sélecteur & import

```ts
import { AutofocusDirective } from 'billy-layout';
```

Sélecteur : `[billyAutofocus]` · standalone (défaut Angular ≥ 19 ; pas de flag explicite).

### Inputs / Outputs

Aucun. La directive n'a ni input, ni output, ni méthode publique : poser l'attribut suffit.

| Cycle de vie | Effet |
|---|---|
| `ngAfterViewInit` | `this.el.nativeElement.focus()` sur l'élément hôte. |

## Exemple d'utilisation

Pas d'usage réel à citer ; usage type :

```html
<input class="billy-field" type="text" billyAutofocus [(ngModel)]="libelle" />
```

```ts
import { AutofocusDirective } from 'billy-layout';

@Component({
  imports: [AutofocusDirective],
  /* ... */
})
```

## Styles & theming

Aucun style. Rappel : le reboot du DS pose `*:focus { outline: 0 !important }` — le focus donné par la directive ne se voit donc que si le champ a son propre style de focus (les mixins `billy-input`/`billy-field` en fournissent un).

## Pièges & notes

- **API pré-signals** : injection par constructeur (`private el: ElementRef`) et hook de cycle de vie classique — pas de `inject()`, pas d'`effect`. Fonctionne tel quel en zoneless (aucune dépendance à la détection de changements), mais une modernisation passerait par `inject(ElementRef)` + `afterNextRender`.
- Le focus est donné **une seule fois**, à l'initialisation de la vue. Un élément monté dans un `@if` refocalise à chaque recréation ; un élément simplement re-affiché (CSS) ne refocalise pas.
- Pas de garde : si l'hôte n'est pas focusable (pas un champ, pas de `tabindex`), l'appel `focus()` est silencieusement sans effet.
- Dans un dialogue déplacé sous `<body>` (moteur `Dialog`), vérifier que la directive s'exécute après que l'élément soit visible — un `focus()` sur un élément en `display: none` ne fait rien ; c'est le composant de dialogue qui doit orchestrer le focus à l'ouverture le cas échéant.
