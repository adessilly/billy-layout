# billy-layout-project

Workspace de la librairie **billy-layout** (design system + layout BILLy) et de
son **site vitrine** : un site Angular qui documente et démontre chaque
composant — en étant lui-même construit avec la librairie (shell, tokens,
cartes, toasts…).

## Arborescence

| Dossier | Contenu |
|---|---|
| `projects/billy-layout/` | la librairie (source `src/lib/`, docs markdown `docs/`, buildée par ng-packagr) |
| `src/` | le site vitrine (`ng serve`) : pages, démos live, viewer markdown |
| `dist/billy-layout/` | le paquet publiable après `npm run build:lib` |

## Démarrer

```bash
npm install
npm start          # site vitrine sur http://localhost:4200
```

Le site compile la librairie **par les sources** (`tsconfig.json` mappe
`billy-layout` sur `projects/billy-layout/src/public-api.ts`) : pas besoin de
builder la lib pour développer.

## Le site vitrine

- **Accueil** : hero animé + les 9 catégories de composants.
- **Une page par fiche** (`/c/<catégorie>/<slug>`) : onglets **Démo** (composant
  vivant, interactif) et **Documentation** (la fiche `docs/*.md` rendue).
- **Guidelines UX** (`/guidelines`) et **Styles & tokens** (`/styles`, avec
  nuancier vivant des variables `--billy-*` — testez le dark mode de la topbar).
- La topbar embarque une **recherche de fiches**, la **cloche de notifications**
  (catégorie de démo) et le menu compte — tous composants de la lib.

Les fiches markdown de `projects/billy-layout/docs/` sont servies en assets
(`/docs/**`) et les liens relatifs entre fiches sont réécrits vers les routes
du site (voir `src/app/site/markdown/markdown-viewer.component.ts`).

Ajouter une démo : créer le composant dans `src/app/demos/<catégorie>-demos.ts`
et l'enregistrer dans `src/app/demos/demo-registry.ts` (la pastille « démo
live » et l'onglet apparaissent automatiquement).

## Builder & publier la librairie

```bash
npm run build:lib             # ng-packagr → dist/billy-layout (FESM + DTS + styles/ + docs/)
cd dist/billy-layout && npm publish
```

Voir `projects/billy-layout/README.md` pour les prérequis d'intégration côté
application (fonts, tokens, providers `BILLY_*`).
