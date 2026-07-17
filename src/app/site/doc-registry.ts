import { BillyIconName } from 'billy-layout';

/** Fiche d'un composant de la librairie présenté par le site. */
export interface DocEntry {
  /** Slug d'URL et nom du fichier markdown (sans extension). */
  slug: string;
  /** Nom affiché (balise, service ou famille). */
  label: string;
  /** Résumé d'une ligne (repris de docs/README.md). */
  summary: string;
  /** Tags de recherche complémentaires. */
  tags?: string[];
}

/** Catégorie de composants — miroir de l'arborescence docs/ et src/lib/. */
export interface DocCategory {
  slug: string;
  label: string;
  icon: BillyIconName;
  intro: string;
  entries: DocEntry[];
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    slug: 'core',
    label: 'Core',
    icon: 'check',
    intro: 'Briques transverses : icônes maison, directives utilitaires et utils de valeurs (TVA, IBAN, email).',
    entries: [
      { slug: 'billy-icon', label: 'billy-icon', summary: 'Jeu d’icônes SVG maison (type BillyIconName), micro-animations au survol.', tags: ['icone', 'svg'] },
      { slug: 'click-outside', label: 'click-outside', summary: 'Directive [clickOutside] + ClickOutsideService : fermeture des dropdowns en zoneless.', tags: ['directive', 'dropdown'] },
      { slug: 'autofocus', label: 'autofocus', summary: 'Directive [billyAutofocus] : focus automatique à l’affichage.', tags: ['directive', 'focus'] },
      { slug: 'code-utils', label: 'code-utils', summary: 'code-format (segments/statuts) + TvaUtils, IbanUtils, EmailUtils (validation et suggestions).', tags: ['tva', 'iban', 'email', 'validation'] },
    ],
  },
  {
    slug: 'layout',
    label: 'Layout',
    icon: 'open',
    intro: 'Le shell applicatif complet : topbar, sidebar repliable, cloche de notifications et navigation mobile.',
    entries: [
      { slug: 'billy-shell', label: 'billy-shell', summary: 'Le point d’entrée : coque topbar + sidebar + contenu, token BILLY_SHELL_CONFIG.', tags: ['shell', 'coque'] },
      { slug: 'billy-topbar', label: 'billy-topbar', summary: 'Topbar, slots shell-search / shell-notifications / shell-account, BillyDarkModeService.', tags: ['topbar', 'dark mode'] },
      { slug: 'billy-sidebar', label: 'billy-sidebar', summary: 'Sidebar (liens, version, badges via config) + billy-nav-item.', tags: ['menu', 'navigation'] },
      { slug: 'billy-notifications', label: 'billy-notifications', summary: 'Cloche à deux niveaux, base abstraite BillyNotifCategory, briques item/empty/action.', tags: ['cloche', 'notification'] },
      { slug: 'action-bar', label: 'action-bar', summary: 'Navigation mobile en bas d’écran, onglets BillyActionBarTab[] fournis par l’app.', tags: ['mobile', 'navigation'] },
    ],
  },
  {
    slug: 'inputs',
    label: 'Inputs',
    icon: 'devis',
    intro: 'Champs de saisie ControlValueAccessor : dates, listes, codes formatés, emails, mot de passe…',
    entries: [
      { slug: 'datepicker', label: 'datepicker', summary: 'CVA ‘yyyy-MM-dd’ | null : popover desktop, bottom-sheet mobile + calendrier autonome.', tags: ['date', 'calendrier'] },
      { slug: 'dropdown', label: 'dropdown', summary: 'Liste déroulante DropdownOption, mode recherche, parité select2.', tags: ['select', 'liste'] },
      { slug: 'code-field', label: 'code-field', summary: 'La famille codes : input-tva / input-iban / input-email + affichages tva-display / iban-display.', tags: ['tva', 'iban', 'email'] },
      { slug: 'input-emails', label: 'input-emails', summary: 'Saisie multi-emails : tags + suggestions (availableEmails fourni par le consommateur).', tags: ['email', 'tags'] },
      { slug: 'input-password', label: 'input-password', summary: 'Mot de passe avec jauge de robustesse (checkStrength) et correspondance (compareTo).', tags: ['mot de passe'] },
      { slug: 'button-switch', label: 'button-switch', summary: 'Toggle booléen CVA façon iOS.', tags: ['toggle', 'switch'] },
      { slug: 'attachment-button', label: 'attachment-button', summary: 'Pièces jointes [(files)] + panneau liste.', tags: ['fichier', 'upload'] },
    ],
  },
  {
    slug: 'forms',
    label: 'Forms',
    icon: 'prestations',
    intro: 'La structure des formulaires : lignes label + champ, panneaux titrés, save-bar sticky, panneau latéral.',
    entries: [
      { slug: 'input-line', label: 'input-line', summary: 'Ligne label + champ projeté (obligatoire, infobulle).', tags: ['ligne', 'label'] },
      { slug: 'consult-line', label: 'consult-line', summary: 'Pendant lecture seule d’input-line.', tags: ['consultation'] },
      { slug: 'input-prefixe-suffixe', label: 'input-prefixe-suffixe', summary: 'Groupe champ + préfixe/suffixe cliquables.', tags: ['addon'] },
      { slug: 'label-clipboard', label: 'label-clipboard', summary: 'Libellé copiable dans le presse-papier.', tags: ['copie', 'presse-papier'] },
      { slug: 'default-form-signal', label: 'default-form-signal', summary: 'Classe de base signals des formulaires add/edit.', tags: ['formulaire', 'signals'] },
      { slug: 'save-bar', label: 'save-bar', summary: 'Barre sticky Enregistrer/Annuler (variantes, mode dialogue).', tags: ['enregistrer', 'sticky'] },
      { slug: 'form-side-panel', label: 'form-side-panel', summary: 'Panneau latéral avec overlay et verrou de scroll.', tags: ['panneau', 'overlay'] },
    ],
  },
  {
    slug: 'buttons',
    label: 'Buttons',
    icon: 'plus',
    intro: 'Le bouton d’action polyvalent et les tuiles d’action des écrans d’accueil : ajouter et importer.',
    entries: [
      { slug: 'button', label: 'button', summary: 'Bouton d’action polyvalent : 5 couleurs × 6 variantes × 3 tailles, label et/ou icône.', tags: ['bouton', 'action', 'cta', 'variante'] },
      { slug: 'button-ajout', label: 'button-ajout', summary: 'Tuile d’action « ajouter » (label + sous-titre + icône).', tags: ['tuile', 'ajout'] },
      { slug: 'button-upload', label: 'button-upload', summary: 'Tuile d’import de fichier (input caché, re-sélection possible).', tags: ['tuile', 'import'] },
    ],
  },
  {
    slug: 'dialogs',
    label: 'Dialogs',
    icon: 'compte',
    intro: 'Le moteur Dialog (pile, verrou, gestes de fermeture) et les dialogues prêts à l’emploi.',
    entries: [
      { slug: 'dialog', label: 'dialog', summary: 'La classe Dialog (pile, verrou compté, gestes de fermeture), markup .billy-modal, BILLY_DIALOG_ROUTER.', tags: ['modale'] },
      { slug: 'dialog-form', label: 'dialog-form', summary: 'billy-dialog-form + header/body/footer, closeThen, déplacement sous <body>.', tags: ['modale', 'formulaire'] },
      { slug: 'delete-dialog', label: 'delete-dialog', summary: 'Confirmation de suppression (openDialog / openDialogAndWait).', tags: ['suppression', 'confirmation'] },
    ],
  },
  {
    slug: 'feedback',
    label: 'Feedback',
    icon: 'bell',
    intro: 'Toasts, snackbar, loaders et états vides illustrés.',
    entries: [
      { slug: 'toastr', label: 'toastr', summary: 'ToastrService + toasts (minuteur en animation CSS, pile plafonnée, pilule mobile).', tags: ['toast', 'notification'] },
      { slug: 'snackbar', label: 'snackbar', summary: 'Bandeau « nouvelle version » global.', tags: ['bandeau'] },
      { slug: 'app-loading', label: 'app-loading', summary: 'billy-loading : overlay de chargement (parent position: relative requis).', tags: ['loader', 'chargement'] },
      { slug: 'checkmark', label: 'checkmark', summary: 'Coche animée, croix d’échec + spinner checkmark-loading (couleurs du DS).', tags: ['coche', 'animation', 'erreur'] },
      { slug: 'circular-loading', label: 'circular-loading', summary: 'Anneau de progression déterminé.', tags: ['progression'] },
      { slug: 'empty-state', label: 'empty-state', summary: 'États vides illustrés (7 types, CTA).', tags: ['vide', 'illustration'] },
    ],
  },
  {
    slug: 'display',
    label: 'Display',
    icon: 'ventes',
    intro: 'La structure de page : en-têtes, barres d’actions, cartes de consultation, onglets et filtres.',
    entries: [
      { slug: 'billy-panel', label: 'billy-panel', summary: 'Coque de panneau flottant (ancrage par le parent).', tags: ['panneau', 'flottant'] },
      { slug: 'consult-card', label: 'consult-card', summary: 'Carte de consultation (slot [card-actions], règle anti-imbrication).', tags: ['carte'] },
      { slug: 'nav-card', label: 'nav-card', summary: 'Tuile de navigation a[billy-nav-card] (pastille-icône, badge, chevron, cascade).', tags: ['carte', 'navigation', 'tuile'] },
      { slug: 'page-header', label: 'page-header', summary: 'En-tête de page (titre, retour, zone de boutons).', tags: ['titre', 'header'] },
      { slug: 'header-action-bar', label: 'header-action-bar', summary: 'Barre d’actions d’en-tête (HeaderAction).', tags: ['actions', 'boutons'] },
      { slug: 'tabs', label: 'tabs', summary: 'billy-tabs / billy-tab (mode projeté ou piloté, onglets montés en permanence).', tags: ['onglets'] },
      { slug: 'filter-toggle-buttons', label: 'filter-toggle-buttons', summary: 'Filtres segmentés (variantes toggle/chips).', tags: ['filtres', 'segments'] },
    ],
  },
  {
    slug: 'viewers',
    label: 'Viewers',
    icon: 'search',
    intro: 'Les visionneuses de fichiers : toolbar commune + rendus PDF, image et XML.',
    entries: [
      { slug: 'file-viewer', label: 'file-viewer', summary: 'Toolbar + viewers pdf/image/xml, contrat BILLY_FILE_SOURCE / BillyViewerFile.', tags: ['pdf', 'image', 'xml'] },
    ],
  },
];

/** Nombre total de fiches composants. */
export const DOC_ENTRY_COUNT = DOC_CATEGORIES.reduce((n, c) => n + c.entries.length, 0);

export function findCategory(slug: string | null): DocCategory | undefined {
  return DOC_CATEGORIES.find(c => c.slug === slug);
}

export function findEntry(category: string | null, slug: string | null): { category: DocCategory; entry: DocEntry } | undefined {
  const cat = findCategory(category);
  const entry = cat?.entries.find(e => e.slug === slug);
  return cat && entry ? { category: cat, entry } : undefined;
}
