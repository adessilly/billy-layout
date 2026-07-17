# Guidelines UX — assembler un écran BILLy

Conventions d'assemblage des écrans avec les composants de billy-layout. Chaque règle
reflète les patterns en vigueur dans billy-client (les exemples cités sont réels).
Fiches API : voir [docs/README.md](README.md).

---

## 1. Boutons d'action en tête de page

**Règle : toute action de niveau page vit dans le header, jamais dans le corps.**
Le trio standard :

```html
<billy-page-header titre="Ventes" sousTitre="Liste de vos ventes">
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>
```

- Le titre + sous-titre viennent de [page-header](display/page-header.md) ; les boutons
  sont projetés dedans via [header-action-bar](display/header-action-bar.md)
  (`HeaderAction[]`).
- **Une seule action `variant: 'primary'` par page** — c'est l'action d'ajout ou l'action
  principale (« Ajouter une vente », « Envoyer »). Icône `fa-solid fa-plus` pour l'ajout.
- `variant: 'danger'` : uniquement pour une action destructive de niveau page
  (« Supprimer » sur une consultation). Jamais deux actions danger.
- Les actions **sans variant** (secondaires : « Dupliquer », « Télécharger »…) sont
  regroupées automatiquement en groupe segmenté, avant les pilules primary/danger.
- Mobile : la barre passe en icônes seules — chaque action doit donc avoir un `icon` et
  un `title` explicites.
- Pas de bouton d'ajout flottant (FAB) ni de bouton d'ajout en bas de liste. Deux
  exceptions cadrées : le CTA de l'[empty-state](feedback/empty-state.md) (relais de
  l'action primary quand la liste est vide) et les tuiles
  [button-ajout](buttons/button-ajout.md)/[button-upload](buttons/button-upload.md)
  réservées aux écrans d'accueil (home-actions).
- Sur une page de **consultation**, les actions du header agissent sur l'objet consulté
  (Modifier / Envoyer / Supprimer) ; le bouton retour est géré par `billy-page-header`
  (`[retour]` + output `retour`), pas par un bouton dans la barre d'actions.

Exemples réels : `vente-list` (primary seul), `devis-form`, `achat-consult`, `compte`.

## 2. Ajouter une liste dans une page

**Structure canonique** (cf. `vente-list`, `achat-list`, `devis-list`) :

```html
<billy-page-header titre="…" sousTitre="…">
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>

<div class="data-list">

  <div class="xxx-list-filters">
    <app-xxx-filter-bar …></app-xxx-filter-bar>
  </div>

  <div class="data-list-content loadable">
    @if (state.loading()) {
      <!-- loader -->
    } @else if (filtered().length === 0) {
      <billy-empty-state [type]="hasItems() ? 'recherche' : 'vente'" (createClicked)="askAdd()"/>
    } @else {
      <!-- groupes + cartes -->
    }
  </div>

</div>
```

Les règles :

1. **Wrapper `.data-list`** (feuille `src/styles-data-list.scss`, app-side) : largeur,
   gouttières et fond communs à toutes les listes. Ne pas réinventer un conteneur.
2. **La barre de filtres est le premier bloc de la liste**, pas un élément du header.
   Elle est spécifique au métier (`*-filter-bar`, app-side) mais se construit avec les
   briques de la lib : [filter-toggle-buttons](display/filter-toggle-buttons.md) pour les
   segments (période, statut), [dropdown](inputs/dropdown.md), champ de recherche stylé
   `billy-forms`.
3. **Trois états, toujours dans cet ordre** : chargement → vide → contenu. L'état vide
   utilise [empty-state](feedback/empty-state.md) avec la distinction **vide réel**
   (type du concept : `'vente'`, `'achat'`… + CTA qui relaie l'action d'ajout du header)
   vs **vide de filtrage** (`type="recherche"`, sans CTA). Tester
   `filtered().length === 0` avec `hasItems()` pour choisir — jamais l'inverse.
4. **Groupement chronologique** : les listes de documents se groupent par année
   (`year-block`/`year-header`) puis trimestre, avec totaux dans l'en-tête de groupe.
5. **Une carte par élément** : les documents (vente/achat/devis/client) utilisent la
   peau `invoice-card` (`src/app/shared/styles/invoice-card.scss`, app-side, API par
   variables `--ic-*`). Le clic sur la carte ouvre la **consultation**, les actions
   contextuelles passent par le menu de la carte — pas de boutons inline répétés sur
   chaque ligne.

## 3. Quand utiliser `billy-consult-card`

[consult-card](display/consult-card.md) = **la carte titrée des écrans de lecture** :
pages et dialogues de consultation, onglets du compte, gestionnaires de fichiers.

- **Oui** : regrouper l'information en consultation (`vente-consult`, `devis-form` pour
  les pièces jointes, `compte`, upload-manager, peppol-inbox-list). Titre = `label` +
  `icon` (pastille) ; badge de comptage optionnel.
- **L'action contextuelle du bloc** (une seule, ex. « Gérer ») se projette dans le slot
  `[card-actions]`, à droite du titre — pas de bouton dans le corps de la carte.
- **Règle anti-imbrication** (préférence projet) : une carte à **contenu unique** =
  carte blanche + titre à pastille, **sans** section grise interne. Les sections grises
  (`billy-section` de `billy-cards`) sont réservées aux cartes **multi-blocs**
  (compte-form, achat-document). Jamais de panneau dans un panneau sans nécessité.
- **Non** :
  - dans un **formulaire** → sections maison sur les mixins `billy-cards`
    (pattern compte-form/client-form) ;
  - pour un élément **répété dans une liste** → carte de liste (`invoice-card`) ;
  - pour un panneau flottant ancré (menu compte) → [billy-panel](display/billy-panel.md) ;
  - exception assumée : `invoice-document` garde son visuel de facture spécifique.

## 4. Quand utiliser `billy-save-bar`

[save-bar](forms/save-bar.md) = **la conclusion de tout formulaire**. Deux contextes,
deux habillages :

1. **Formulaire pleine page** (add/edit : vente-form, devis-form, client-form…) :
   la save-bar est le **dernier élément du `<form>`**, sticky en bas de page :

   ```html
   <form [formGroup]="formGroup" (ngSubmit)="askSave()">
     …
     <billy-save-bar
       [disabled]="!formGroup.valid"
       [loading]="state.loading()"
       (cancel)="askCancel()">
     </billy-save-bar>
   </form>
   ```

   - `disabled` = validité du formulaire ; `loading` = requête en cours (le libellé
     passe sur `labelSaveLoading`). Ne pas confondre : `loading` n'implique pas
     `disabled`.
   - Annuler est **toujours présent** et revient en arrière sans confirmation si le
     formulaire est vierge.

2. **Pied de dialogue ou de side-panel** (vente-paiements, compte-password,
   fichiers-manager) : même composant avec `class="no-theme"` — il perd son fond
   sticky/givré et se fond dans le footer du conteneur.

Les règles de placement :

- **Jamais de save-bar en consultation** : les actions d'un écran de lecture vont dans
  la [header-action-bar](display/header-action-bar.md) (§1).
- Un bouton « Enregistrer » isolé hors save-bar est interdit dans un formulaire — c'est
  elle qui porte la sémantique submit (attention au double déclenchement : son bouton
  est `type="submit"`, ne pas câbler `(save)` **et** `(ngSubmit)` sur la même action).
- Variantes de couleur du bouton principal (`classSave` : `sb-btn--info`,
  `sb-btn--warning`) : réservées aux actions d'envoi/à-risque (envoi Peppol), pas pour
  varier le style d'un simple enregistrement.
- Dans un **form-side-panel** ou un formulaire en overlay, même règle qu'en dialogue :
  save-bar en pied, `no-theme` si le conteneur fournit déjà son propre footer.

## 5. Récapitulatif de décision

| Besoin | Composant | Où |
|---|---|---|
| Action de niveau page (ajout, envoi, suppression) | `HeaderAction` → header-action-bar | Dans `billy-page-header` |
| Ajouter depuis une liste vide | CTA d'`billy-empty-state` | Corps de liste (relais du header) |
| Tuile d'ajout/import sur l'accueil | `billy-button-ajout` / `billy-button-upload` | home-actions uniquement |
| Bloc d'information en lecture | `billy-consult-card` (+ slot `[card-actions]`) | Pages/dialogues de consultation |
| Sections d'un formulaire | mixins `billy-cards` | Formulaires |
| Conclure un formulaire pleine page | `billy-save-bar` sticky | Dernier enfant du `<form>` |
| Conclure un dialogue/panneau | `billy-save-bar.no-theme` | Footer du conteneur |
| Filtres d'une liste | `*-filter-bar` (briques : filter-toggle-buttons, dropdown) | Premier bloc de `.data-list` |
| Liste vide vs recherche vide | `billy-empty-state` type concept vs `recherche` | `.data-list-content` |
