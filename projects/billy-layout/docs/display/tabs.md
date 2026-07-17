# billy-tabs / billy-tab — TabsComponent&lt;T&gt; / TabComponent

> Catégorie `display` · source `projects/billy-layout/src/lib/display/tabs/` · standalone components

## Rôle

Barre d'onglets « maison » BILLy (indépendante de l'ancien `ad-tabs`) : *segmented control* arrondi aligné sur la charte (accent cyan `--billy-*`), avec pastille active **coulissante** (indicateur animé), navigation clavier et comportement responsive élaboré (repli des libellés inactifs, puis défilement horizontal avec fondus latéraux).

Deux modes d'usage :

- **Projeté** : des `<billy-tab>` dans le contenu ; `billy-tabs` gère la sélection en interne et bascule l'affichage des panneaux, **qui restent montés dans le DOM** (`[hidden]`).
- **Piloté (headless)** : la barre seule, décrite par l'input `items` ; la sélection est contrôlée par le parent via `selected` / `(selectedChange)`. Pratique dans un en-tête de page où le contenu vit ailleurs.

Utilisation dans `src/app` (vérifiée par grep) : `agenda-list` (barre `size="sm"` dans le `billy-page-header`, onglets Événements / Récurrences / Liaisons) et `compte-prompt` (bascule de vue de l'éditeur de prompt). Les deux en mode **piloté** — aucun usage projeté à ce jour dans l'app.

## API

**Sélecteurs** : `billy-tabs`, `billy-tab` · **Import** : `import { TabsComponent, TabComponent, TabItem } from 'billy-layout';`

### `TabsComponent<T extends string = string>` — générique

Le paramètre `T` type les ids d'onglets en mode piloté (ex. `TabItem<AgendaTab>[]` → `selectedChange` émet un `AgendaTab`).

#### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `items` | `TabItem<T>[] \| null` | `null` | Mode piloté : onglets décrits par input au lieu de `<billy-tab>` projetés. `null` = mode projeté. |
| `selected` | `T \| null` | `null` | Mode piloté : id de l'onglet sélectionné (contrôlé par le parent). Id inconnu → premier onglet actif. |
| `size` | `'md' \| 'sm'` | `'md'` | `'sm'` : variante dense pour les barres d'en-tête. |

#### Outputs

| Output | Type | Description |
|---|---|---|
| `selectedChange` | `output<T>` | Mode piloté : émis avec l'id de l'onglet cliqué (ou atteint au clavier). En mode projeté la sélection est interne, rien n'est émis. |

### `TabComponent` (`billy-tab`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `''` | Libellé affiché dans la barre. |
| `icon` | `string` | `''` | Classe d'icône FontAwesome optionnelle (ex. `fa-solid fa-user`). |

Expose aussi `active: signal<boolean>` — **piloté par `billy-tabs`**, ne pas l'écrire soi-même.

### Interface exportée `TabItem<T>`

```ts
export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: string; // classe FontAwesome optionnelle
}
```

## Slots / projection

- `<ng-content>` de `billy-tabs` : les `<billy-tab>` (mode projeté). Le corps `.app-tabs-body` (padding-top 22px) est masqué en mode piloté.
- `<ng-content>` de `billy-tab` : le contenu du panneau, rendu dans un `role="tabpanel"` masqué via `[hidden]` quand inactif.

## Exemple d'utilisation

Mode piloté typé (`agenda-list`) :

```ts
readonly tabItems: TabItem<AgendaTab>[] = [
  { id: 'evenements',  label: 'Événements',  icon: 'fa-solid fa-calendar-days' },
  { id: 'recurrences', label: 'Récurrences', icon: 'fa-solid fa-rotate' },
  { id: 'liaisons',    label: 'Liaisons',    icon: 'fa-solid fa-link' },
];
```

```html
<billy-tabs size="sm"
  [items]="tabItems"
  [selected]="activeTab()"
  (selectedChange)="activeTab.set($event)" />
```

Mode projeté (les panneaux restent montés) :

```html
<billy-tabs>
  <billy-tab label="Encodage" icon="fa-solid fa-user"> … </billy-tab>
  <billy-tab label="Historique" icon="fa-solid fa-clock-rotate-left"> … </billy-tab>
</billy-tabs>
```

## Styles & theming

- Tokens `--billy-*` (avec fallbacks) : barre `--billy-surface` / `--billy-surface-border`, indicateur et onglet actif `--billy-accent-soft` / `--billy-accent-strong`, texte inactif `--billy-text-muted`, hover `--billy-input-color` / `--billy-divider`, focus `--billy-focus-ring`. Dark mode : seuls les ombres sont neutralisées via `:host-context(.dark-mode)`, le reste suit les tokens.
- Pastille active = indicateur absolu (`translate3d` + width/height animés, `cubic-bezier(0.22, 1, 0.36, 1)`) ; avant la première mesure, un fond statique de secours est posé sur le bouton actif (`has-indicator` bascule ensuite).
- **Responsive en 2 crans** : (1) si tous les onglets ont une icône, les libellés des onglets **inactifs** se replient (`grid-template-columns 1fr → 0fr` animé) — déclenché par media query ≤ 768px **ou** par débordement mesuré (cliquet `overflowCompact`, relâché quand le viewport regagne ~16px) ; (2) en dernier recours, la barre défile horizontalement avec fondus latéraux en `mask-image` et centrage automatique de l'onglet actif.
- `prefers-reduced-motion: reduce` : toutes les transitions coupées, scroll `auto`.
- Variante `size="sm"` : paddings/radius/typo réduits pour les en-têtes de page.

## Pièges & notes

- **Les onglets projetés restent montés** : le contenu est masqué via `[hidden]`, jamais détruit — l'état des composants enfants est préservé et leurs appels réseau ne sont pas relancés au switch. Ne pas compter sur `ngOnInit`/`ngOnDestroy` à chaque changement d'onglet.
- Mode piloté = **entièrement contrôlé** : `selectedChange` n'écrit rien tout seul, le parent doit répercuter la valeur dans `selected` (sinon l'onglet ne bouge pas visuellement).
- Le repli responsive des libellés **exige une icône sur chaque onglet** (`collapsible`) ; sans icônes, on passe directement au défilement.
- Ne pas mélanger les modes : `items` non-null masque le corps (`.app-tabs-body--none`) — des `<billy-tab>` projetés en même temps ne seraient jamais affichés.
- Accessibilité incluse : `role="tablist"` / `role="tab"` / `aria-selected`, *roving tabindex*, flèches gauche/droite + Home/End ; en mode compact, les onglets inactifs récupèrent un `title` avec leur libellé.
- `TabItem.id` étend `string` : utiliser un type union (`type AgendaTab = 'evenements' | …`) pour bénéficier du typage de `selectedChange`.
