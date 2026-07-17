# billy-empty-state — EmptyStateComponent

> Catégorie `feedback` · source `projects/billy-layout/src/lib/feedback/empty-state/empty-state.component.ts` · standalone component

## Rôle

État vide illustré pour les listes : une illustration SVG animée propre à chaque concept métier, un titre, un sous-titre et, pour les types « création », un bouton CTA qui émet `createClicked`. Les textes sont embarqués dans le composant (dictionnaire `COPY`) : l'appelant ne fournit que le `type`. Utilisé dans toutes les listes de `src/app` : `devis-list`, `vente-list`, `achat-list`, `client-list`, `agenda-list-tab-evenement`, `agenda-list-tab-recurrences` — avec le pattern « liste réellement vide → type métier, filtre sans résultat → type `recherche` ».

## API

### Sélecteur & import

```ts
import { EmptyStateComponent, EmptyStateType } from 'billy-layout';
```

Sélecteur : `billy-empty-state`.

### Inputs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `type` | `input.required<EmptyStateType>()` | — | Concept illustré ; détermine l'illustration, les textes et la présence du CTA. |

### Outputs

| Output | Type | Description |
|---|---|---|
| `createClicked` | `output<void>` | Émis au clic sur le bouton CTA (présent uniquement quand le type a un `cta`). |

### Types d'illustration (liste exhaustive)

```ts
export type EmptyStateType =
  | 'achat' | 'vente' | 'devis' | 'client'
  | 'evenements' | 'recurrences' | 'recherche';
```

| `type` | Illustration | Titre | CTA |
|---|---|---|---|
| `achat` | Ticket de caisse à bord déchiré balayé par un rayon de scan IA, pièce € flottante | « Aucun achat » | « Ajouter un achat » |
| `vente` | Facture avec badge « payé » qui pulse, flèche de croissance qui se dessine, mini bar-chart | « Aucune vente » | « Ajouter une vente » |
| `devis` | Document avec signature manuscrite qui se trace, stylo animé, badge horloge « en attente » | « Aucun devis » | « Ajouter un devis » |
| `client` | Trio d'avatars qui « respirent », orbite pointillée en rotation lente, badge + | « Aucun client » | « Ajouter un client » |
| `evenements` | Calendrier à anneaux avec grille vide | « Aucun événement » | « Créer un événement » |
| `recurrences` | Arc fléché en rotation continue autour d'un centre +, piste pointillée | « Aucune récurrence » | « Créer une récurrence » |
| `recherche` | Résultats fantômes estompés + loupe « ? » qui balaie | « Aucun résultat » | — (pas de CTA) |

Chaque sous-titre est une accroche de deux lignes (retour `\n`, rendu via `white-space: pre-line`), p.ex. pour `achat` : « Déposez vos factures d'achat, / Billy en extrait les données pour vous ».

## Exemple d'utilisation

Usage réel (`src/app/auth/pages/vente/vente-list/vente-list.component.html`) :

```html
<billy-empty-state [type]="hasVentes() ? 'recherche' : 'vente'" (createClicked)="askAdd()"/>
```

Si des ventes existent mais que le filtre ne renvoie rien → illustration `recherche` (sans CTA) ; si la liste est réellement vide → illustration `vente` avec CTA de création.

## Styles & theming

- Mise en page : colonne centrée (`.empty-wrap`), SVG de 220 × 187 px, titre 17 px gras, sous-titre 13 px, CTA en dégradé indigo→violet (`#6366f1 → #8b5cf6`) avec élévation au survol.
- Entrée en cascade : illustration, titre, sous-titre puis CTA apparaissent avec `es-enter` (fondu + translation) décalés de 0 / 0,08 / 0,14 / 0,2 s.
- Ombre portée du SVG (`drop-shadow`) **teintée par concept** via `.empty-wrap--<type>` (corail pour achat, vert pour vente, ambre pour devis, violet pour client, ardoise pour recherche).
- Motion design par classes SVG : `es-float` (flottement de la scène), `es-sparkle` (étincelles), `es-dot` (points décoratifs déphasés), `es-pop` (badges qui pulsent), plus des animations dédiées — `es-scan`/`es-coin` (achat), `es-draw`/`es-bar` (vente), `es-sign`/`es-pen`/`es-hand` (devis), `es-orbit`/`es-bob` (client), `es-rotor` (récurrences), `es-sweep` (recherche).
- Palette des illustrations codée en dur (pas de tokens `--billy-*`), mais **dark mode** géré via `:host-context(body.dark-mode)` : les classes génériques `es-card` / `es-line` / `es-line-stroke` / `es-glow` basculent les fonds de cartes en `#1f2937`, lignes en `#374151`, halo atténué ; titre/sous-titre éclaircis, drop-shadow supprimé.
- **`prefers-reduced-motion: reduce`** : toutes les animations (entrées ET boucles SVG) sont coupées (`animation: none !important`) ; les tracés `es-draw`/`es-sign` sont figés à l'état final (`stroke-dashoffset: 0`) et le rayon de scan `es-scan` est masqué (`display: none`) pour laisser une scène statique cohérente.

## Pièges & notes

- Textes non paramétrables : titre/sous-titre/CTA viennent du dictionnaire interne `COPY`. Pour un nouveau concept, ajouter le type + copy + `@case` SVG dans le composant.
- `recherche` est le seul type **sans CTA** : `createClicked` n'y est jamais émis (le bouton n'est pas rendu, via `@if (copy().cta)`).
- Le composant définit des `clipPath`/ids SVG fixes (`esAvL`, `esAvR`, `esAvM` pour `client`) : deux instances `client` simultanées partageraient ces ids — sans effet visuel en pratique (définitions identiques).
- Pas d'input de taille : l'illustration est fixée à 220 px de large ; adapter via CSS parent si besoin.
- Penser au pattern `type = filtreActif ? 'recherche' : '<concept>'` utilisé partout dans l'app pour distinguer « rien créé » de « rien trouvé ».
