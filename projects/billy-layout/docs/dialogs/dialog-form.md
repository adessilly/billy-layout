# dialog-form — `DialogFormComponent`

> Catégorie `dialogs` · source `projects/billy-layout/src/lib/dialogs/dialog-form/` · standalone components (`billy-dialog-form` + slots `billy-dialog-form-header` / `-body` / `-footer`)

## Rôle

`billy-dialog-form` est le dialogue « formulaire / consultation » générique de la lib : il fournit la coque `.billy-modal` complète, l'ouvre **automatiquement** dès l'affichage du composant (`ngAfterViewInit`), la déplace sous `<body>`, et articule la fermeture avec le routeur de l'application quand le dialogue est porté par une route « overlay » (token optionnel `BILLY_DIALOG_ROUTER`). Le contenu est fourni par trois composants-slots à base de `TemplateRef` : header (avec croix de fermeture intégrée), body, footer.

Exports (`lib/dialogs/dialog-form/index.ts`) : `DialogFormComponent`, `DialogFormHeaderComponent`, `DialogFormBodyComponent`, `DialogFormFooterComponent`, plus le tableau de commodité `DialogFormModule` regroupant les quatre.

## API

### `billy-dialog-form` (DialogFormComponent)

**Inputs**

| Input | Type | Défaut | Description |
|---|---|---|---|
| `large` | `boolean` | `false` | Pose `billy-modal-dialog--large` (équivalent `modal-xl` : 800px ≥ 992px, 1140px ≥ 1200px). |
| `maxWidth` | `number \| null` | `null` | `max-width` en px appliqué à `.billy-modal-dialog` (prioritaire visuellement sur la largeur par défaut de 500px). |

**Outputs**

| Output | Type | Émis quand |
|---|---|---|
| `closed` | `void` | Le dialogue est entièrement fermé, **si** la fermeture vient d'un bouton (`askCloseDialog`/`closeThen`) **ou** d'un geste standard (Échap, clic-fond, `data-billy-dismiss`, croix du header) alors que le composant est encore vivant. **Pas émis** quand la fermeture vient du routeur (composant déjà détruit : overlay remplacé ou effacé). |

**Slots (contentChild)**

| Sélecteur | Rend | Note |
|---|---|---|
| `billy-dialog-form-header` | `.billy-modal-header` + contenu projeté + **croix de fermeture** `data-billy-dismiss` intégrée | Optionnel |
| `billy-dialog-form-body` | `.billy-modal-body` + contenu projeté | Optionnel |
| `billy-dialog-form-footer` | `.billy-modal-footer` + contenu projeté | Optionnel |

Chaque slot est un composant standalone dont le template est un simple `<ng-template>` capturé par `viewChild.required<TemplateRef<any>>(TemplateRef)` (propriété `template`) et stampé par `*ngTemplateOutlet` dans la coque de `billy-dialog-form`. Le contenu ne s'affiche donc **jamais** à l'endroit où le slot est déclaré.

**Méthodes publiques**

| Méthode | Signature | Description |
|---|---|---|
| `askCloseDialog` | `askCloseDialog(): void` | Fermeture programmatique « bouton » : pose `closeFromButtonAction`, joue l'animation, puis (via `listenClose`) délègue la navigation à `BILLY_DIALOG_ROUTER.closeOverlay()` et émet `closed`. |
| `closeThen` | `closeThen(action: () => void): void` | Ferme le dialogue (**animation comprise**) puis exécute `action`, à qui revient toute la navigation (autre overlay ou page). Naviguer sans attendre la fin de l'animation laisserait le verrou de scroll du `<body>` être levé après coup, cassant le scroll du dialogue suivant. |
| `closeDialog` | `closeDialog(): void` | Appelle `dialogRouter?.closeOverlay()` (no-op si le token n'est pas fourni). Normalement appelé en interne. |
| `detectChanges` | `detectChanges(): void` | Force une détection de changements locale. |

**Cycle de vie**

1. `ngAfterViewInit` : `detectChanges()` puis `openDialog()` — `document.body.appendChild(...)` de la racine `#dialogRoot`, `new Dialog(...)`, `show()`.
2. `listenClose().pipe(first())` : à la fermeture complète —
   - si un `afterClose` a été posé par `closeThen`, il est exécuté (c'est l'action qui pilote la navigation) ;
   - sinon, si le composant **n'est pas détruit** (fermeture par geste utilisateur), `dialogRouter?.closeOverlay()` referme la route overlay ;
   - sinon (composant détruit = fermeture pilotée par le routeur), **rien** : re-naviguer écraserait un overlay fraîchement ouvert ;
   - `closed` est émis selon la règle du tableau ci-dessus ; enfin `document.body.removeChild(...)`.
3. `ngOnDestroy` : si la fermeture ne vient pas d'un bouton, `modal.hide()` (cas : le routeur retire l'overlay pendant que le dialogue est encore affiché).

## Exemple d'utilisation

Usage réel : les dialogues de consultation routés en overlay — `src/app/auth/pages/devis/devis-consult-dialog/` (idem `vente-consult-dialog`, `achat-consult-dialog`, `client-consult-dialog`, `email-dialog`, `peppol-facture-dialog`…).

Template (`devis-consult-dialog.component.html`) :

```html
<billy-dialog-form [large]="true">

  <billy-dialog-form-header>
    <div class="dcd-header">
      <h4 class="dcd-title">{{ d?.libelle || 'Devis' }}</h4>
      <button type="button" class="dcd-btn" (click)="askExpand()">Agrandir</button>
      <button type="button" class="dcd-btn dcd-btn--primary" (click)="askEdit()">Modifier</button>
    </div>
  </billy-dialog-form-header>

  <billy-dialog-form-body>
    <billy-loading [loading]="loading()"></billy-loading>
    @if (d) {
      <app-devis-document [devis]="d"></app-devis-document>
    }
  </billy-dialog-form-body>

</billy-dialog-form>
```

Composant : `closeThen` pour basculer proprement vers une autre page (fermeture animée, verrou de scroll relâché, **puis** navigation) :

```ts
private readonly dialogForm = viewChild.required(DialogFormComponent);

askEdit(): void {
  this.dialogForm().closeThen(async () => {
    await this.routerUtils.closeOverlay();
    this.routerUtils.toDevisFormEdit(id);
  });
}
```

Côté app, le pont routeur est fourni dans `src/app/app.config.ts` :

```ts
{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService },
```

## Styles & theming

- La coque visuelle `.billy-modal*` est **globale** (`lib/styles/_billy-dialog.scss`, chargée par le `styles.scss` de l'app) — tokens `--billy-*`, dark mode automatique.
- Les CSS des slots (`dialog-form-header.component.css`, etc.) restent effectifs malgré le déplacement sous `<body>` : les nœuds stampés portent les attributs `_ngcontent` de leur composant d'origine. Le header stylise notamment la croix `.close` (32×32, hover `--billy-divider`, focus visible `--billy-focus-border`).
- La racine du template ne porte **pas** `tabindex="-1"` — volontaire : cela désactivait le focus des champs de recherche des select2.

## Pièges & notes

- **La modale vit sous `<body>`**, hors du host du composant hôte. Conséquences :
  - les styles `:host` / `:host-context(...)` du composant qui utilise `billy-dialog-form` **ne matchent pas** le contenu du dialogue ;
  - pour le dark mode, le pattern maison est `::ng-deep body.dark-mode { .mes-classes-prefixees { … } }` (voir `devis-consult-dialog.component.scss`, section « Dark mode ») — sans risque de collision si les classes sont préfixées (ex. `dcd-`) ;
  - côté Playwright/tests E2E, cibler le dialogue par des sélecteurs **globaux** (`.billy-modal …`), pas relatifs au composant hôte.
- **Ouverture automatique** : afficher le composant (route overlay, `@if`) suffit à ouvrir le dialogue ; il n'existe pas de méthode `open()`.
- **Ne jamais naviguer directement depuis un bouton du dialogue** : passer par `closeThen(...)` pour laisser l'animation finir et le verrou `body.billy-dialog-open` se lever au bon moment.
- Sans provider `BILLY_DIALOG_ROUTER`, Échap/clic-fond ferment visuellement mais la route overlay reste active (le composant est toujours monté) — fournir le token dès que le dialogue est routé.
- `closed` ne fait pas la différence entre validation et abandon : c'est un signal de fermeture, la sémantique métier (sauvegarde effectuée, etc.) est à porter par l'appelant.
