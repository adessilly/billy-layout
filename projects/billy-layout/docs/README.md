# billy-layout — documentation développeur

Une fiche par composant/famille : rôle, API (inputs/outputs signals, CVA), exemples
d'utilisation réels tirés de billy-client, theming (tokens `--billy-*`, dark mode) et
pièges. L'arborescence de `docs/` est le miroir de `src/lib/`.

**🧭 [Guidelines UX](ux-guidelines.md)** — où placer les boutons d'action et d'ajout,
comment structurer une page de liste, quand utiliser consult-card et save-bar.

## core — briques transverses

- [billy-icon](core/billy-icon.md) — `<billy-icon>` : jeu d'icônes SVG maison (type `BillyIconName`), micro-animations au survol.
- [click-outside](core/click-outside.md) — directive `[clickOutside]` + `ClickOutsideService` : fermeture des dropdowns en zoneless (un seul listener document).
- [autofocus](core/autofocus.md) — directive `[billyAutofocus]` (aucun usage app actuellement).
- [code-utils](core/code-utils.md) — `code-format` (segments/statuts) + `TvaUtils` (clé belge mod 97), `IbanUtils` (mod 97 ISO), `EmailUtils` (diagnostic + suggestion de domaine).

## layout — shell applicatif & navigation

- [billy-shell](layout/billy-shell.md) — `<billy-shell>`, `BillyShellService`, token `BILLY_SHELL_CONFIG` (`BillyShellConfig`, `BillyMenuLink`) : le point d'entrée, avec l'assemblage complet.
- [billy-topbar](layout/billy-topbar.md) — topbar, slots `[shell-search]`/`[shell-notifications]`/`[shell-account]`, `BillyDarkModeService`.
- [billy-sidebar](layout/billy-sidebar.md) — sidebar (liens/version/badges via config) + `<billy-nav-item>`.
- [billy-notifications](layout/billy-notifications.md) — cloche à deux niveaux, base abstraite `BillyNotifCategory`, briques item/empty/action, guide « créer une catégorie ».
- [action-bar](layout/action-bar.md) — navigation mobile bas d'écran, onglets `BillyActionBarTab[]` fournis par l'app.

## inputs — champs de saisie (ControlValueAccessor)

- [datepicker](inputs/datepicker.md) — `<billy-datepicker>` (CVA `'yyyy-MM-dd' | null`, popover desktop / bottom-sheet mobile) + `<billy-datepicker-calendar>`.
- [dropdown](inputs/dropdown.md) — `<billy-dropdown>` (`DropdownOption`, mode searchable, parité select2).
- [code-field](inputs/code-field.md) — la famille codes : `CodeFieldBase`, `<billy-input-tva/-iban/-email>`, `<billy-tva-display/-iban-display>`, briques glyph/status/value.
- [input-emails](inputs/input-emails.md) — saisie multi-emails (tags + suggestions, `availableEmails` fourni par le consommateur).
- [input-password](inputs/input-password.md) — mot de passe avec jauge de robustesse (`checkStrength`) et correspondance (`compareTo`).
- [button-switch](inputs/button-switch.md) — toggle booléen CVA façon iOS.
- [attachment-button](inputs/attachment-button.md) — pièces jointes `[(files)]` + panneau liste.

## forms — structure de formulaires

- [input-line](forms/input-line.md) — ligne label + champ projeté (obligatoire, infobulle).
- [consult-line](forms/consult-line.md) — pendant lecture seule d'input-line.
- [input-prefixe-suffixe](forms/input-prefixe-suffixe.md) — groupe champ + préfixe/suffixe cliquables.
- [label-clipboard](forms/label-clipboard.md) — libellé copiable dans le presse-papier.
- [default-form-signal](forms/default-form-signal.md) — classe de base signals des formulaires add/edit.
- [save-bar](forms/save-bar.md) — barre sticky Enregistrer/Annuler (variantes, mode dialogue).
- [form-side-panel](forms/form-side-panel.md) — panneau latéral avec overlay et verrou de scroll.

## buttons — boutons d'action

- [button-ajout](buttons/button-ajout.md) — tuile d'action « ajouter » (label + sous-titre + icône).
- [button-upload](buttons/button-upload.md) — tuile d'import de fichier (input caché, re-sélection possible).

## dialogs — moteur & dialogues

- [dialog](dialogs/dialog.md) — la classe `Dialog` (pile, verrou compté, gestes de fermeture), markup `.billy-modal`, token `BILLY_DIALOG_ROUTER`.
- [dialog-form](dialogs/dialog-form.md) — `<billy-dialog-form>` + header/body/footer, `closeThen`, déplacement sous `<body>` et ses conséquences.
- [delete-dialog](dialogs/delete-dialog.md) — confirmation de suppression (`openDialog`/`openDialogAndWait`).

## feedback — notifications & états

- [toastr](feedback/toastr.md) — `ToastrService` + toasts (minuteur = animation CSS, pile plafonnée, pilule mobile).
- [snackbar](feedback/snackbar.md) — bandeau « nouvelle version » global.
- [app-loading](feedback/app-loading.md) — `<billy-loading>` : overlay de chargement (parent `position: relative` requis).
- [checkmark](feedback/checkmark.md) — coche animée, croix d'échec `checkmark-failed` + spinner `checkmark-loading` (couleurs du design system).
- [circular-loading](feedback/circular-loading.md) — anneau de progression déterminé (sans usage app actuellement).
- [empty-state](feedback/empty-state.md) — états vides illustrés (7 types, CTA).

## display — panneaux & structure de page

- [billy-panel](display/billy-panel.md) — coque de panneau flottant (ancrage par le parent).
- [consult-card](display/consult-card.md) — carte de consultation (slot `[card-actions]`, règle anti-imbrication).
- [nav-card](display/nav-card.md) — tuile de navigation `a[billy-nav-card]`/`button[billy-nav-card]` (pastille-icône, badge, chevron, apparition en cascade).
- [page-header](display/page-header.md) — en-tête de page (titre, retour, zone de boutons).
- [header-action-bar](display/header-action-bar.md) — barre d'actions d'en-tête (`HeaderAction`).
- [tabs](display/tabs.md) — `<billy-tabs<T>>` / `<billy-tab>` (mode projeté ou piloté, onglets montés en permanence).
- [filter-toggle-buttons](display/filter-toggle-buttons.md) — filtres segmentés (variantes toggle/chips).

## viewers — visionneuses de fichiers

- [file-viewer](viewers/file-viewer.md) — toolbar + viewers pdf/image/xml, contrat `BILLY_FILE_SOURCE` / `BillyViewerFile`.

## styles — SCSS partagés

- [styles](styles/styles.md) — tokens `--billy-*` (light/dark), reboot, mixins `billy-forms`/`billy-cards`/`billy-code-field`, coque modale `.billy-modal*`, consommation via includePaths.
