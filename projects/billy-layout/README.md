# billy-layout

Layout + design system BILLy : shell applicatif (topbar, sidebar, notifications,
barre de navigation mobile), tokens & mixins SCSS, champs de formulaire,
panneaux, dialogues et composants de feedback.

Extraite de billy-client sans dépendance Bootstrap ni dépendance au code
métier — voir `library-migration.md` à la racine du workspace pour l'historique
et les décisions.

**📚 Documentation développeur : [docs/README.md](docs/README.md)** — une fiche
par composant (API, exemples, theming, pièges).
**🧭 Guidelines UX : [docs/ux-guidelines.md](docs/ux-guidelines.md)** — conventions
d'assemblage des écrans (boutons de header, listes, consult-card, save-bar).

> La documentation est **embarquée dans le paquet publié** : une fois la librairie
> installée, tout est lisible dans `node_modules/billy-layout/docs/` (assistants IA
> compris — commencez par `docs/README.md` puis `docs/ux-guidelines.md`).

**🤖 Assistant IA (Claude Code, etc.)** : le paquet embarque
[docs/claude.md](docs/claude.md), un contexte prêt à l'emploi. Ajoutez cette
ligne au `CLAUDE.md` de votre application et votre assistant connaîtra le
layout, le design system et les composants installés :

```markdown
@node_modules/billy-layout/docs/claude.md
```

## Arborescence

`src/lib/` est organisé par catégories (miroir de `docs/`) :

| Dossier | Contenu |
|---|---|
| `core/` | briques transverses : billy-icon, click-outside, autofocus, utils TVA/IBAN/email |
| `layout/` | shell applicatif (topbar/sidebar/notifications) + action-bar mobile |
| `inputs/` | champs de saisie CVA : datepicker, dropdown, code-field, input-emails, input-password, button-switch, attachment-button |
| `forms/` | structure de formulaires : form-creation, default-form-signal, save-bar, form-side-panel |
| `buttons/` | tuiles d'action : button-ajout, button-upload |
| `dialogs/` | moteur `Dialog`, dialog-form, delete-dialog |
| `feedback/` | toastr, snackbar, loaders, empty-state |
| `display/` | billy-panel, consult-card, page-header, header-action-bar, tabs, filter-toggle-buttons |
| `viewers/` | visionneuses de fichiers (pdf/image/xml) |
| `styles/` | SCSS partagés : tokens, reboot, mixins (assets publiés sous `styles/`) |

## Consommation dans le workspace

- **TypeScript** : `import { … } from 'billy-layout'` — le `tsconfig.json` racine
  mappe le paquet sur `projects/billy-layout/src/public-api.ts` (compilation par
  les sources, pas besoin de builder la lib en dev).
- **SCSS** : les feuilles partagées vivent dans `src/lib/styles/` et sont
  résolues par `stylePreprocessorOptions.includePaths` (angular.json) :

  ```scss
  @use 'billy-forms' as forms;   // mixins des champs/boutons
  @use 'billy-cards' as cards;   // mixins des cartes/sections
  @use 'billy-code-field' as code;
  @use 'billy-tokens';           // variables CSS --billy-* (:root + dark)
  @use 'billy-dialog';           // coque modale .billy-modal*
  @use 'billy-reboot';           // normalisation globale (box-sizing…)
  ```

  À la publication, ces fichiers sont expédiés dans `billy-layout/styles/`
  (assets ng-packagr) : un consommateur externe ajoute ce dossier à ses
  `includePaths`.

## Prérequis côté application

- **Fonts** (chargées par l'application, cf. `src/index.html`) :
  « Plus Jakarta Sans » (shell + design system). « Source Sans Pro » n'est
  requise que par la couche de compat legacy de billy-client (`billy-reboot`
  l'utilise comme police de base des pages métier).
- **Tokens & thème** : charger `billy-tokens` dans les styles globaux ; le mode
  sombre repose sur la classe `body.dark-mode`, gérée par `BillyDarkModeService`
  (clé localStorage `billy_dark_mode`).
- **Providers** (voir `app.config.ts` de billy-client pour l'exemple complet) :
  - `BILLY_SHELL_CONFIG` — liens du menu, version, homeLink, logout, badges,
    synchro des notifications ;
  - `BILLY_DIALOG_ROUTER` (optionnel) — fermeture des overlays routés pour
    `billy-dialog-form` ;
  - `BILLY_FILE_SOURCE` — source de contenu des viewers `app-file-viewer-*`.

## Shell : slots

`<billy-shell>` projette trois zones métier vers la topbar :

```html
<billy-shell>
  <app-billy-search shell-search />
  <billy-notifications shell-notifications>
    <!-- catégories : composants qui étendent BillyNotifCategory -->
  </billy-notifications>
  <app-billy-account-menu shell-account />
  <router-outlet />
</billy-shell>
```

## Build & publication

```bash
ng build billy-layout   # ng-packagr → dist/billy-layout (FESM + DTS + styles/)
cd dist/billy-layout && npm publish
```
