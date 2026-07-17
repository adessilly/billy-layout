# [clickOutside] — ClickOutsideDirective & ClickOutsideService

> Catégorie `core` · source `projects/billy-layout/src/lib/core/click-outside/` · directive + service

## Rôle

Détection du « clic en dehors » pour fermer les surfaces flottantes, sans Bootstrap JS et compatible zoneless. Le service centralise **un seul** écouteur `click` sur `document` et publie la cible du clic dans un signal ; chaque directive posée sur un élément réagit à ce signal et émet `clickOutside` si le clic n'a pas eu lieu dans son sous-arbre. C'est la brique de fermeture des dropdowns maison : utilisée dans la librairie par `billy-dropdown` et `billy-attachment-button`, et dans l'app par le menu compte (`src/app/shared/components/icon-top-compte/billy-account-menu.component.html`) et le champ TVA (`src/app/shared/components/tva-field/tva-field.component.html`).

---

## ClickOutsideDirective

### Sélecteur & import

```ts
import { ClickOutsideDirective } from 'billy-layout';
```

Sélecteur : `[clickOutside]` · directive standalone (`standalone: true`).

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `listenClickOutside` | `boolean` | `true` | Interrupteur d'écoute. À `false`, les clics extérieurs sont ignorés. En pratique on y lie le signal d'ouverture (`[listenClickOutside]="isOpen()"`) pour ne réagir que quand la surface est visible. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `clickOutside` | `void` | Émis à chaque clic document dont la cible n'est pas contenue dans l'élément hôte (`elementRef.nativeElement.contains(target)` faux). |

### Fonctionnement interne

Un `effect()` dans le constructeur lit `clickOutsideService.clickEmitted()` ; le corps est enveloppé dans `untracked()` pour que seule la publication d'un clic (et pas `listenClickOutside`) déclenche l'effet. Si la cible est non nulle, hors écoute désactivée, et hors du sous-arbre de l'hôte → `clickOutside.emit()`.

---

## ClickOutsideService

### Import

```ts
import { ClickOutsideService } from 'billy-layout';
```

Service `@Injectable({ providedIn: 'root' })` — ne s'instancie qu'à sa première injection (en pratique, la première `ClickOutsideDirective` construite).

### API

| Membre | Type | Description |
|---|---|---|
| `clickEmitted` | `signal<null \| EventTarget>` | Cible du dernier clic document, `null` au repos. Le service fait `set(null)` puis `set(event.target)` à chaque clic : le passage par `null` casse l'égalité référentielle et garantit que l'effet des directives se rejoue même si on clique deux fois de suite sur le même élément. |

L'écouteur `document.addEventListener('click', …)` est posé dans le constructeur et jamais retiré (durée de vie = application).

---

## Exemple d'utilisation

Usage réel — `src/app/shared/components/icon-top-compte/billy-account-menu.component.html` :

```html
<div class="account-menu" (clickOutside)="close()" [listenClickOutside]="open()">
  <!-- déclencheur + panneau -->
</div>
```

```ts
import { ClickOutsideDirective } from 'billy-layout';

@Component({
  imports: [ClickOutsideDirective],
  /* ... */
})
export class BillyAccountMenuComponent {
  readonly open = signal(false);
  close() { this.open.set(false); }
}
```

## Styles & theming

Aucun style : directive purement comportementale.

## Pièges & notes

- **Le clic d'ouverture compte comme un clic** : sans garde, ouvrir un menu par un bouton situé hors de l'élément décoré le refermerait aussitôt. Deux parades : inclure le déclencheur dans le sous-arbre décoré (pattern du menu compte ci-dessus), ou piloter `listenClickOutside`.
- **`stopPropagation()` rend le clic invisible** : le service écoute sur `document`, un clic stoppé en chemin ne publie rien (ni fermeture, donc).
- Seul l'événement `click` est couvert — pas `mousedown`, ni la touche Échap, ni le focus clavier sortant.
- Conçu pour le zoneless : tout passe par signals/effect, aucun `NgZone`. C'est le remplaçant officiel des dropdowns Bootstrap dans l'app (cf. mémoire « Billy zoneless » : pattern `isOpen` + `ClickOutsideDirective`).
- Le service référence `document` directement dans son constructeur : non compatible SSR/plateforme serveur en l'état.
- Deux instances de la directive imbriquées réagissent chacune pour leur compte : un clic dans l'enfant est aussi « dedans » pour le parent (contains), donc pas de double fermeture parasite.
