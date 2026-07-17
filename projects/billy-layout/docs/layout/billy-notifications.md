# billy-notifications — BillyNotificationsComponent

> Catégorie `layout` · source `projects/billy-layout/src/lib/layout/shell/notifications/` · standalone component (+ base abstraite `BillyNotifCategory`, briques `billy-notif-item/-empty/-action`)

## Rôle

Cloche de notifications unifiée de la topbar : bouton avec badge de total et panneau déroulant à deux niveaux — niveau 1 la liste des catégories, niveau 2 la liste d'éléments d'une catégorie (avec bouton retour). Chaque catégorie est un composant autonome fourni par l'application en contenu projeté (il charge ses données, expose son compteur, affiche sa propre liste) ; le panneau ne gère que la cloche, la navigation entre niveaux et la synchronisation globale, déléguée à `BILLY_SHELL_CONFIG.syncNotifications`. Dans billy-client, la cloche est projetée dans le slot `[shell-notifications]` du shell (`src/app/auth/pages/auth-page.component.html`) avec trois catégories : achats Peppol entrants, envois Peppol, ventes impayées (`src/app/layout/notifications/`).

## API

### BillyNotificationsComponent

```ts
import { BillyNotificationsComponent } from 'billy-layout';
```

Sélecteur : `billy-notifications`. Aucun input ni output.

| Membre | Type | Description |
|---|---|---|
| `categories` | `contentChildren(BillyNotifCategory)` | Les catégories projetées, dans l'ordre d'affichage. |
| `open` | `signal<boolean>` | Panneau ouvert. |
| `categoryId` | `signal<BillyNotifCategoryId \| null>` | Catégorie ouverte (`null` = niveau catégories). |
| `syncLoading` | `signal<boolean>` | Synchronisation globale en cours. |
| `totalCount` | `computed<number>` | Somme des `count()` — badge de la cloche. |
| `activeCategory` | `computed<BillyNotifCategory \| null>` | Instance de la catégorie ouverte. |
| `toggle()` / `close()` / `openCategory(id)` / `back()` | | Navigation du panneau. |
| `syncAll()` | `Promise<void>` | `config.syncNotifications()` puis `refresh()` de chaque catégorie (gardé par `syncLoading`). |

Fermeture : clic document hors du host (`@HostListener('document:click')`) et touche Échap. Tokens consommés : `BILLY_SHELL_CONFIG` (`{ optional: true }`, pour `syncNotifications`).

**Câblage du contenu projeté** : le parent ne peut pas template-binder des composants projetés par l'application. Un `effect` dans le constructeur pousse donc l'état dans les signals de chaque catégorie (`activeCategory.set(...)`, `syncing.set(...)`) et s'abonne **impérativement, une seule fois** (WeakSet `wired`) à ses outputs : `syncRequested.subscribe(() => this.syncAll())`, `navigated.subscribe(() => this.close())`.

### BillyNotifCategory (`billy-notif-category.ts`)

```ts
import { BillyNotifCategory, BillyNotifCategoryId, provideBillyNotifCategory } from 'billy-layout';
```

`@Directive()` abstraite — base commune des catégories. `BillyNotifCategoryId = 'entrantes' | 'sortantes' | 'impayes'`.

| Membre | Nature | Description |
|---|---|---|
| `id` | abstrait | Identifiant unique (navigation entre niveaux). |
| `label`, `sub`, `icon`, `iconBg`, `iconColor` | abstraits | Métadonnées de la ligne de catégorie (niveau 1) et de l'entête. |
| `count` | abstrait, `Signal<number>` | Nombre d'éléments à traiter (badge cloche + compteurs). |
| `activeCategory` | `signal<BillyNotifCategoryId \| null>` | **Écrit par le panneau parent** (effect), pas un input. |
| `syncing` | `signal<boolean>` | **Écrit par le panneau parent** ; anime les icônes sync. |
| `syncRequested` | `output<void>` | Demande de synchro globale (abonné impérativement par le panneau). |
| `navigated` | `output<void>` | Un élément a ouvert son écran métier → le panneau se ferme. |
| `active` | `computed<boolean>` | `activeCategory() === this.id` — gate du template de la catégorie. |
| `refresh()` | abstrait | Recharge les données (appelé après une synchro globale). |
| `locale` | `protected` | `inject(LOCALE_ID)`. |
| `clientName(holder)` | `protected` | Helper « Nom Prénom » depuis `{ client?: { nom, prenom } }`. |

`provideBillyNotifCategory(() => MonComposant)` : provider `{ provide: BillyNotifCategory, useExisting: forwardRef(...) }` à déclarer dans les `providers` du composant de catégorie pour que le panneau le retrouve via `contentChildren(BillyNotifCategory)`.

### Briques d'affichage

**billy-notif-item — BillyNotifItemComponent** : ligne générique d'une liste (avatar à initiale, titre, sous-titre, colonne droite montant + statut). Le clic se gère sur l'élément hôte, côté appelant.

| Input | Type | Défaut | Description |
|---|---|---|---|
| `accentBg` | `string` | requis | Fond de l'avatar. |
| `accentColor` | `string` | requis | Couleur de l'avatar (et du statut par défaut). |
| `initialSource` | `string \| number \| null \| undefined` | `null` | Texte dont la 1re lettre (majuscule) sert d'initiale ; `?` à défaut. |
| `title` | `string` | requis | Titre (ellipsé). |
| `sub` | `string` | `''` | Sous-titre. |
| `amount` | `string \| null` | `null` | Montant (déjà formaté). |
| `status` | `string` | `''` | Libellé de statut. |
| `statusColor` | `string \| null` | `null` | Couleur du statut ; défaut `accentColor`. |

**billy-notif-empty — BillyNotifEmptyComponent** : état vide « Rien à traiter ici » (aucun input).

**billy-notif-action — BillyNotifActionComponent** : action de pied de panneau (icône + libellé projeté). Inputs : `icon: BillyIconName` (requis), `spinning: boolean` (défaut `false`, rotation 1s de l'icône). Clic sur l'hôte, côté appelant. Utilisé par le panneau lui-même pour « Synchroniser maintenant ».

## Slots / projection

- `billy-notifications` projette tout son contenu (`<ng-content />`) **dans le panneau**, sous les niveaux : les catégories restent instanciées en permanence — elles chargent leurs données et alimentent les compteurs même panneau fermé — et chacune n'affiche sa liste que quand `active()` est vrai.
- `billy-notif-action` projette son libellé après l'icône.

## Exemple d'utilisation — créer une nouvelle catégorie

1. **Créer un composant qui étend `BillyNotifCategory`** et déclare le provider (exemple réel : `src/app/layout/notifications/billy-notif-achats-peppol.component.ts`) :

```ts
@Component({
  selector: 'app-billy-notif-achats-peppol',
  templateUrl: './billy-notif-achats-peppol.component.html',
  styleUrls: ['./billy-notif-category.scss'],
  imports: [CurrencyPipe, BillyNotifItemComponent, BillyNotifEmptyComponent, BillyNotifActionComponent],
  providers: [provideBillyNotifCategory(() => BillyNotifAchatsPeppolComponent)],
})
export class BillyNotifAchatsPeppolComponent extends BillyNotifCategory implements OnInit {

  readonly id = 'entrantes' as const;
  readonly label = 'Peppol entrantes';
  readonly sub = 'Achats à réceptionner';
  readonly icon = 'achats' as const;
  readonly iconBg = '#E6F7FC';
  readonly iconColor = '#0E97BB';

  readonly achats = computed<Achat[]>(() => this.achatService.achatsPeppolUnread.data() ?? []);
  readonly count = computed(() => this.achats().length);

  ngOnInit(): void { lastValueFrom(this.achatService.listPeppolUnread()); }

  async refresh(): Promise<void> { await lastValueFrom(this.achatService.listPeppolUnread()); /* … */ }

  openAchat(achat: Achat): void {
    this.navigated.emit();                       // ferme le panneau
    this.routeurUtils.toAchatFormEdit(achat.id!);
  }
}
```

2. **Template gaté par `active()`**, avec les briques (`billy-notif-achats-peppol.component.html`) :

```html
@if (active()) {
  <div class="billy-notif-level">
    <div class="billy-notif-items">
      @if (count() === 0) { <billy-notif-empty /> }
      @for (achat of achats(); track achat.id) {
        <billy-notif-item
          [accentBg]="iconBg" [accentColor]="iconColor"
          [initialSource]="clientName(achat) || achat.libelle"
          [title]="achat.libelle" [sub]="subOf(achat)"
          [amount]="achat.prix | currency:'EUR'" status="À traiter"
          (click)="openAchat(achat)" />
      }
    </div>
    <div class="billy-notif-footer">
      <billy-notif-action icon="sync" [spinning]="syncing()" (click)="syncRequested.emit()">
        Synchroniser
      </billy-notif-action>
    </div>
  </div>
}
```

3. **Le projeter dans la cloche** (`src/app/auth/pages/auth-page.component.html`) :

```html
<billy-notifications shell-notifications>
  <app-billy-notif-achats-peppol />
  <app-billy-notif-envois-peppol />
  <app-billy-notif-ventes-impayees />
</billy-notifications>
```

## Styles & theming

- Hôte de la cloche : `<li class="billy-notifications">` — conçu pour la rangée `<ul>` de la topbar.
- Cloche 38×38 : hover `#EAEFF3`, ouverte `#E6F7FC`/`#0E97BB` ; badge rouge `#EF4444` bordé du fond de page. Animation « carillon » (`billyBellRing`, 6s en boucle) quand `totalCount() > 0` et panneau fermé — coupée par `prefers-reduced-motion`.
- Panneau : 300px ancré à droite (`top: calc(100% + 14px)`), fond blanc, radius 16px, apparition scale/fade (`transform-origin: top right`), `z-index: 30`. Mobile (< 767.98px) : `position: fixed; top: 62px; left/right: 12px` (pleine largeur).
- Niveaux : `.billy-notif-level` avec entrée glissée `billyNotifIn` ; accent `#0E97BB`/`#E6F7FC` pour compteurs et badges d'entête.
- Dark mode via `:host-context(body.dark-mode)` (panneau `#172224`, bordures `#49545a`, hovers `#223034`) ; les pastilles colorées inline (`iconBg`/`iconColor`, avatars) sont assombries par `filter: saturate(.85) brightness(.92)`.
- Les classes `.billy-notif-level` / `.billy-notif-footer` sont réutilisables par les templates de catégories ; billy-client ajoute ses propres règles partagées dans `src/app/layout/notifications/billy-notif-category.scss` (`.billy-notif-items`, etc.).

## Pièges & notes

- `activeCategory` et `syncing` de la catégorie sont des **signals écrits par le parent**, pas des inputs : ne jamais les setter soi-même dans la catégorie ; se contenter de lire `active()` et `syncing()`.
- Oublier `provideBillyNotifCategory(...)` dans les `providers` du composant rend la catégorie invisible pour `contentChildren` : pas de ligne au niveau 1, pas de comptage. (Le commentaire du helper mentionne `viewChildren` ; le panneau utilise en réalité `contentChildren`.)
- `BillyNotifCategoryId` est une union fermée (`'entrantes' | 'sortantes' | 'impayes'`) : ajouter une 4e catégorie impose d'étendre ce type dans la librairie.
- Les catégories vivent panneau fermé : charger les données dans `ngOnInit` (pas à l'ouverture) pour que le badge de la cloche soit juste dès le départ.
- Le handler de clic document ignore les cibles détachées du DOM (`!target.isConnected`) : un clic qui provoque un re-render du panneau (changement de niveau) n'est pas pris pour un clic extérieur.
- `syncAll()` attend `config.syncNotifications()` **puis** les `refresh()` séquentiellement ; sans `BILLY_SHELL_CONFIG`, seule la partie `refresh()` s'exécute.
- Les outputs sont abonnés une seule fois par instance (WeakSet) — émettre `navigated` / `syncRequested` depuis la catégorie est toujours sûr.
