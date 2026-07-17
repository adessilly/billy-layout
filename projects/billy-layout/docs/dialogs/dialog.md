# dialog — `Dialog`

> Catégorie `dialogs` · source `projects/billy-layout/src/lib/dialogs/dialog/dialog-utils.ts` · classe (+ token d'injection `BILLY_DIALOG_ROUTER`, `projects/billy-layout/src/lib/dialogs/dialog/billy-dialog-router.ts`)

## Rôle

`Dialog` est le moteur des dialogues modaux du design system, **sans aucune dépendance à Bootstrap**. Il reprend à l'identique le contrat de l'ancienne coque `bootstrap.Modal` : `show()` / `hide()`, et deux évènements *terminaux* (`listenShow()` / `listenClose()`) émis **une fois la transition CSS finie**. Ce différé est essentiel : les appelants retirent l'élément du `<body>` et enchaînent la navigation dans `listenClose()` — les notifier plus tôt casserait l'animation.

La classe ne fait **que** le comportement (affichage, transitions, gestes de fermeture, pile, verrou de scroll). La coque visuelle `.billy-modal*` est une feuille **globale** : `projects/billy-layout/src/lib/styles/_billy-dialog.scss`, chargée par le `src/styles.scss` de l'application (`@use 'billy-dialog';`, via l'`includePaths` `projects/billy-layout/src/lib/styles` d'`angular.json`).

## API

### Constructeur

```ts
new Dialog(host: HTMLElement)
```

`host` est la **racine** `.billy-modal` (l'élément plein écran qui sert de fond, de zone de clic-pour-fermer et de conteneur de défilement).

### Méthodes publiques

| Méthode | Signature | Description |
|---|---|---|
| `show` | `show(): void` | Ouvre le dialogue : pousse l'instance dans la pile, pose `billy-dialog-open` sur `<body>`, branche les écouteurs (mousedown/click/keydown), pose `aria-modal="true"`, passe `display` à `block`, force un reflow puis ajoute la classe `is-open` (déclenche la transition d'opacité). No-op si l'instance n'est pas à l'état `idle`. |
| `hide` | `hide(): void` | Ferme le dialogue : retire `is-open`, attend la fin de transition puis démonte tout (`teardown`) et émet `listenClose()`. No-op si l'état n'est ni `opening` ni `open` (une fermeture peut donc couper une ouverture en cours). |
| `listenShow` | `listenShow(): Observable<void>` | Émet **une seule fois**, quand le dialogue est entièrement ouvert (transition comprise), puis complète. |
| `listenClose` | `listenClose(): Observable<void>` | Émet **une seule fois**, quand le dialogue est entièrement fermé (transition comprise), puis complète. C'est là qu'on retire l'élément du `<body>` et qu'on enchaîne la navigation. |

### Cycle de vie interne

Machine à états `idle → opening → open → closing → closed`. Une instance est **à usage unique** : après fermeture (`closed`), `show()` ne fait plus rien — pour rouvrir, créer un `new Dialog(...)` sur le même élément. Cas géré : rouvrir sur le **même élément hôte** (ex. `app-ai-extract-dialog` enchaîne les ouvertures) démonte silencieusement l'instance précédente restée dans la pile, **sans** émettre `listenClose()` (sinon l'appelant retirerait du `<body>` l'élément qu'on s'apprête à réafficher).

### Gestes de fermeture

Ferment le dialogue (appellent `hide()`) :

- la touche **Échap** — dialogues empilés : **seul celui du dessus de la pile** répond ;
- un **clic sur le fond** — uniquement si le `mousedown` a eu lieu sur le fond aussi (un glisser démarré dans le dialogue et relâché sur le fond ne ferme pas) ;
- tout élément portant l'attribut **`data-billy-dismiss`** (remplaçant de `data-bs-dismiss`), où qu'il soit dans l'arbre (détection par `closest()`).

### Pile et verrou de scroll

- `openStack` (module-level) : dialogues ouverts, du plus ancien au plus récent. Sert au routage d'Échap et au verrou.
- `body.billy-dialog-open` (`overflow: hidden`, défini dans `_billy-dialog.scss`) : posé au premier `show()`, retiré **seulement quand la pile est vide** — un dialogue peut en ouvrir un autre (ex. confirmation de suppression depuis un formulaire) sans que le scroll soit rendu entre les deux. C'est un verrou *compté* de fait.

### Filet de sécurité de transition

`transitionend` n'arrive jamais si la transition ne part pas (onglet en arrière-plan, `prefers-reduced-motion`, transition surchargée à `none`). Un repli à **400 ms** (`TRANSITION_FALLBACK_MS`) garantit que `listenShow()` / `listenClose()` émettent quand même. Seule la transition **d'opacité de la racine** est écoutée (les `transitionend` des enfants — transform du dialogue, animations SVG — remontent et sont ignorés).

## Markup attendu

```html
<div class="billy-modal" tabindex="-1" role="dialog" #modalRef>        <!-- élément passé au constructeur -->
  <div class="billy-modal-dialog billy-modal-dialog--centered" role="document">
    <div class="billy-modal-content">
      <button type="button" data-billy-dismiss aria-label="Fermer">…</button>
      … contenu …
    </div>
  </div>
</div>
```

Classes disponibles (voir `_billy-dialog.scss`) : `.billy-modal-dialog--centered` (centrage vertical), `.billy-modal-dialog--large` (équivalent `modal-xl` : 800px ≥ 992px, 1140px ≥ 1200px), `.billy-modal-header` / `-body` / `-footer` / `-title`.

## Exemple d'utilisation

Usage réel : `src/app/auth/pages/vente/vente-send-dialog/vente-send-dialog.component.ts` (choix du canal d'envoi d'une facture, rendu sous forme de `Promise`) :

```ts
open(noteCredit = false): Promise<VenteSendChoice | null> {
  // Déplacé sous <body> pour échapper aux stacking contexts (topbar, overlays).
  const element = this.modalRef().nativeElement;
  if (element.parentElement?.tagName !== 'BODY') {
    document.body.appendChild(element);
  }
  const modal = new Dialog(element);
  modal.show();
  modal.listenClose().pipe(first()).subscribe(() => {
    document.body.removeChild(element);
    this.settle(null);                        // fermeture sans choix = abandon
  });
  return new Promise(resolve => { this.resolver = resolve; });
}
```

Le pattern canonique : **appendChild sous `<body>` → `new Dialog` → `show()` → `listenClose().pipe(first())` → `removeChild`**.

## Le token `BILLY_DIALOG_ROUTER`

```ts
export interface BillyDialogRouter {
  closeOverlay(): void;
}
export const BILLY_DIALOG_ROUTER = new InjectionToken<BillyDialogRouter>('BILLY_DIALOG_ROUTER');
```

Pont de navigation des dialogues **routés** : `billy-dialog-form` est utilisé par des dialogues portés par une route « overlay » ; quand l'utilisateur ferme par un geste (Échap, clic sur le fond), il faut aussi quitter la route. La librairie ne connaît pas le routeur de l'application : celle-ci fournit ce token — **optionnel** ; sans lui, la fermeture visuelle fonctionne mais aucune navigation n'a lieu.

Côté billy-client (`src/app/app.config.ts`) :

```ts
{ provide: BILLY_DIALOG_ROUTER, useExisting: RouteurUtilsService },
```

## Styles & theming

- Coque : `projects/billy-layout/src/lib/styles/_billy-dialog.scss` (racine `z-index: 1055`, fond `rgba(17,24,39,.5)`, transition opacité 0.15s + glissement `translateY(-30px)` → 0 en 0.25s).
- Géométrie identique à Bootstrap (500px par défaut, paliers `--large`, marges) pour que la migration n'ait déplacé aucun dialogue.
- Couleurs via les tokens `--billy-*` (surface, bord, ombre) → **dark mode automatique**.
- `.billy-modal-dialog` est en `pointer-events: none` : les clics de la gouttière atteignent la racine (fermeture au fond), le `.billy-modal-content` les reprend (`pointer-events: auto`).
- `prefers-reduced-motion: reduce` : transitions coupées (le repli 400 ms de `Dialog` prend le relais).

## Pièges & notes

- **Instance à usage unique** : après une fermeture complète, recréer un `Dialog` pour rouvrir. `listenShow`/`listenClose` sont des `Subject` complétés — ils n'émettront plus.
- **Ne pas retirer l'élément du `<body>` avant `listenClose()`** : l'animation de fermeture serait tronquée et le démontage des écouteurs incomplet.
- **Le clic-fond exige mousedown + click sur la racine** : une sélection de texte qui déborde du dialogue ne le ferme pas — comportement voulu.
- **Échap et pile** : seul le dialogue du dessus capte Échap ; utile quand `billy-delete-dialog` s'ouvre par-dessus un `billy-dialog-form`.
- Les commentaires d'en-tête du fichier mentionnent encore `src/styles-dialog.scss` : la coque vit désormais dans la lib (`lib/styles/_billy-dialog.scss`), importée par le `styles.scss` de l'app.
- Le passage `display: none ↔ block` piloté en JS rejoue les animations CSS d'illustration des dialogues à chaque ouverture (exploité par delete-dialog et vente-send-dialog).
