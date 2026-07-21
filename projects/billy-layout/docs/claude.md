# billy-layout — contexte pour votre assistant IA

> Ce fichier est livré avec le paquet. Importez-le dans le `CLAUDE.md` de votre
> application en une ligne :
>
> ```markdown
> @node_modules/billy-layout/docs/claude.md
> ```
>
> Votre assistant saura ainsi, à chaque session, que l'application embarque le
> design system BILLy — et où en trouver la documentation complète.

Cette application utilise **billy-layout**, la librairie Angular du design
system BILLy : shell applicatif (topbar, sidebar, notifications, action-bar
mobile), champs de formulaire (ControlValueAccessor), dialogues, feedback,
panneaux de consultation et tokens SCSS `--billy-*`.

## Règles pour l'assistant

1. **Ne pas réinventer l'UI.** Avant de créer un composant visuel (bouton,
   champ, carte, dialogue, toast, état vide…), vérifier si billy-layout le
   fournit déjà. L'index complet — une fiche par composant avec API signals,
   exemples réels, theming et pièges — est dans
   `node_modules/billy-layout/docs/README.md`.
2. **Respecter les guidelines UX** définies dans
   `node_modules/billy-layout/docs/ux-guidelines.md` pour tout assemblage
   d'écran : placement des actions de page, structure des listes, cartes de
   consultation (`consult-card`), barre d'enregistrement (`save-bar`),
   états vides.
3. **Styles via le design system.** Utiliser les tokens CSS `--billy-*`
   (couleurs, surfaces, light/dark) et les mixins SCSS partagés
   (`billy-forms`, `billy-cards`, `billy-code-field`…) plutôt que des valeurs
   en dur — détails dans `node_modules/billy-layout/docs/styles/styles.md`.
   Le mode sombre repose sur la classe `body.dark-mode`, pilotée par
   `BillyDarkModeService`.
4. **Imports TypeScript** depuis l'entrée unique du paquet :
   `import { … } from 'billy-layout'`. Composants standalone, API à base de
   signals (`input()` / `output()` / `model()`).

## Carte des familles de composants

| Famille | Contenu | Fiches |
|---|---|---|
| `layout/` | `<billy-shell>` (topbar, sidebar, notifications, slots), action-bar mobile | `docs/layout/` |
| `inputs/` | datepicker, dropdown, champs codes (TVA/IBAN/email), multi-emails, password, switch, pièces jointes | `docs/inputs/` |
| `forms/` | input-line/consult-line, save-bar, form-side-panel, base de formulaire signals | `docs/forms/` |
| `buttons/` | bouton d'action (couleurs × variantes × tailles), tuiles ajout/upload | `docs/buttons/` |
| `dialogs/` | moteur `Dialog`, `<billy-dialog-form>`, confirmation de suppression | `docs/dialogs/` |
| `feedback/` | toastr, snackbar, loaders, checkmark, empty-state | `docs/feedback/` |
| `display/` | consult-card, page-header, header-action-bar, tabs, nav-card, filtres | `docs/display/` |
| `viewers/` | visionneuses pdf/image/xml (`BILLY_FILE_SOURCE`) | `docs/viewers/` |
| `core/` | `<billy-icon>`, click-outside, autofocus, utils TVA/IBAN/email | `docs/core/` |
| `styles/` | tokens `--billy-*`, reboot, mixins SCSS | `docs/styles/` |

Tous les chemins ci-dessus sont relatifs à `node_modules/billy-layout/`.
