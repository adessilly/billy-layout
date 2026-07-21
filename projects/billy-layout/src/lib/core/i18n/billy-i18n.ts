import { computed, EnvironmentProviders, inject, provideEnvironmentInitializer, Service, signal } from '@angular/core';

// ═══════════════════════════════════════════════════════════════════════════
// billy-layout i18n — built-in strings of the components.
//
// English is the default. French ships with the library. Every string can be
// overridden, and the label inputs of the components always win over the
// dictionary. Bootstrap with `provideBillyI18n('fr')`, switch at runtime with
// `BillyI18nService.setLocale()`.
// ═══════════════════════════════════════════════════════════════════════════

export type BillyLocale = 'en' | 'fr';

/** Copy of one empty-state type (also the shape components read back). */
export interface EmptyStateCopy {
  title: string;
  subtitle: string;
  cta?: string;
}

/** Every built-in string of the components, grouped by component. */
export interface BillyI18nStrings {
  topbar: { toggleMenu: string; home: string; darkMode: string; logout: string; notifications: string };
  notifications: { back: string; syncNow: string; emptyTitle: string; emptySubtitle: string };
  actionBar: { mainNavigation: string };
  addButton: { label: string };
  uploadButton: { label: string; subtitle: string; loading: string };
  saveBar: { save: string; saving: string; back: string };
  pageHeader: { back: string };
  deleteDialog: { title: string; message: string; warning: string; confirm: string; cancel: string; close: string };
  toastr: { success: string; error: string; warning: string; info: string; saveSuccess: string; saveError: string; close: string };
  snackbar: { message: string; buttonTitle: string; buttonLabel: string; closeTitle: string; dismiss: string };
  checkmark: { success: string; loading: string; failed: string };
  appLoading: { loading: string };
  emptyState: {
    purchase: EmptyStateCopy; sale: EmptyStateCopy; quote: EmptyStateCopy; client: EmptyStateCopy;
    events: EmptyStateCopy; recurring: EmptyStateCopy; search: EmptyStateCopy;
  };
  password: {
    minLength: string; lowercase: string; uppercase: string; digit: string; special: string;
    weak: string; fair: string; good: string; excellent: string;
    show: string; hide: string; match: string; mustMatch: string;
  };
  dropdown: { searchPlaceholder: string; noResults: string; remove: string };
  datepicker: {
    ariaLabel: string; openCalendar: string; chooseDate: string; chooseMonth: string; dateLocale: string;
    prevMonth: string; prevYear: string; nextMonth: string; nextYear: string;
    chooseMonthYear: string; backToDays: string; today: string;
  };
  inputEmails: { placeholder: string };
  codeDisplay: { empty: string; copy: string; copied: string };
  codeField: { verified: string; invalid: string; validFormat: string; typing: string };
  attachments: { close: string; deleteFile: string; header: string; addFile: string };
  viewer: { close: string; prevPage: string; nextPage: string; zoomIn: string; zoomOut: string; copy: string; copied: string; cannotDisplay: string };
}

/** Partial dictionary: any subset of groups/keys. */
export type BillyI18nOverrides = { [G in keyof BillyI18nStrings]?: Partial<BillyI18nStrings[G]> };

export const BILLY_I18N_EN: BillyI18nStrings = {
  topbar: {
    toggleMenu: 'Collapse / expand the menu',
    home: 'Home',
    darkMode: 'Light / dark mode',
    logout: 'Log out',
    notifications: 'Notifications',
  },
  notifications: {
    back: 'Back',
    syncNow: 'Sync now',
    emptyTitle: 'Nothing to handle here',
    emptySubtitle: 'Everything is up to date in this category.',
  },
  actionBar: { mainNavigation: 'Main navigation' },
  addButton: { label: 'Add' },
  uploadButton: { label: 'Import', subtitle: 'From a file', loading: 'Loading…' },
  saveBar: { save: 'Save', saving: 'Saving…', back: 'Back' },
  pageHeader: { back: 'Back' },
  deleteDialog: {
    title: 'Delete confirmation',
    message: 'Do you want to delete this record?',
    warning: 'This action cannot be undone.',
    confirm: 'Delete',
    cancel: 'Cancel',
    close: 'Close',
  },
  toastr: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    saveSuccess: 'Saved successfully',
    saveError: 'Error while saving',
    close: 'Close',
  },
  snackbar: {
    message: 'New version available.',
    buttonTitle: 'Click here to refresh and update',
    buttonLabel: 'Update',
    closeTitle: 'Ignore this message',
    dismiss: 'Dismiss',
  },
  checkmark: { success: 'Success', loading: 'Loading', failed: 'Failed' },
  appLoading: { loading: 'Loading' },
  emptyState: {
    purchase: {
      title: 'No purchases',
      subtitle: 'Drop in your purchase invoices,\nBilly extracts the data for you',
      cta: 'Add a purchase',
    },
    sale: {
      title: 'No sales',
      subtitle: 'Create your first invoice\nand send it in one click',
      cta: 'Add a sale',
    },
    quote: {
      title: 'No quotes',
      subtitle: 'Write your first quote,\nonce accepted it becomes an invoice',
      cta: 'Add a quote',
    },
    client: {
      title: 'No clients',
      subtitle: 'Add your first client to create\nquotes and invoices in no time',
      cta: 'Add a client',
    },
    events: {
      title: 'No events',
      subtitle: 'Create your first event\nto keep track of your deadlines',
      cta: 'Create an event',
    },
    recurring: {
      title: 'No recurring events',
      subtitle: 'Set up recurring schedules to\nautomate your regular events',
      cta: 'Create a recurring event',
    },
    search: {
      title: 'No results',
      subtitle: 'Nothing matches your criteria,\nadjust the search or the period',
    },
  },
  password: {
    minLength: '8 characters minimum',
    lowercase: 'One lowercase letter',
    uppercase: 'One uppercase letter',
    digit: 'One digit',
    special: 'One special character',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
    show: 'Show password',
    hide: 'Hide password',
    match: 'Both passwords match',
    mustMatch: 'Must match the new password',
  },
  dropdown: { searchPlaceholder: 'Search…', noResults: 'No results', remove: 'Remove' },
  datepicker: {
    ariaLabel: 'Date',
    openCalendar: 'Open the calendar',
    chooseDate: 'Choose a date',
    chooseMonth: 'Choose a month',
    dateLocale: 'en',
    prevMonth: 'Previous month',
    prevYear: 'Previous year',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    chooseMonthYear: 'choose month and year',
    backToDays: 'Back to days',
    today: 'Today',
  },
  inputEmails: { placeholder: 'Enter email addresses' },
  codeDisplay: { empty: 'Not provided', copy: 'Copy', copied: 'Copied' },
  codeField: {
    verified: 'Verified',
    invalid: 'Invalid',
    validFormat: 'Valid format',
    typing: 'Typing in progress',
  },
  attachments: { close: 'Close', deleteFile: 'Delete this file', header: 'Attachments', addFile: 'Add a file' },
  viewer: {
    close: 'Close',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    copy: 'Copy content',
    copied: 'Copied!',
    cannotDisplay: 'Unable to display this file.',
  },
};

export const BILLY_I18N_FR: BillyI18nStrings = {
  topbar: {
    toggleMenu: 'Replier / déplier le menu',
    home: 'Accueil',
    darkMode: 'Mode clair / sombre',
    logout: 'Me déconnecter',
    notifications: 'Notifications',
  },
  notifications: {
    back: 'Retour',
    syncNow: 'Synchroniser maintenant',
    emptyTitle: 'Rien à traiter ici',
    emptySubtitle: 'Tout est à jour dans cette catégorie.',
  },
  actionBar: { mainNavigation: 'Navigation principale' },
  addButton: { label: 'Ajouter' },
  uploadButton: { label: 'Importer', subtitle: 'Depuis un fichier', loading: 'Chargement…' },
  saveBar: { save: 'Sauvegarder', saving: 'Sauvegarde…', back: 'Retour' },
  pageHeader: { back: 'Retour' },
  deleteDialog: {
    title: 'Confirmation suppression',
    message: 'Voulez-vous supprimer cet enregistrement ?',
    warning: 'Cette action est définitive.',
    confirm: 'Supprimer',
    cancel: 'Annuler',
    close: 'Fermer',
  },
  toastr: {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
    saveSuccess: 'Sauvegarde effectuée avec succès',
    saveError: 'Erreur durant la sauvegarde',
    close: 'Fermer',
  },
  snackbar: {
    message: 'Nouvelle version disponible.',
    buttonTitle: 'Cliquez ici pour rafraîchir et mettre à jour',
    buttonLabel: 'Mettre à jour',
    closeTitle: 'Ignorer ce message',
    dismiss: 'Ignorer',
  },
  checkmark: { success: 'Succès', loading: 'Chargement', failed: 'Échec' },
  appLoading: { loading: 'Chargement' },
  emptyState: {
    purchase: {
      title: 'Aucun achat',
      subtitle: 'Déposez vos factures d’achat,\nBilly en extrait les données pour vous',
      cta: 'Ajouter un achat',
    },
    sale: {
      title: 'Aucune vente',
      subtitle: 'Créez votre première facture\net envoyez-la en un clic',
      cta: 'Ajouter une vente',
    },
    quote: {
      title: 'Aucun devis',
      subtitle: 'Rédigez votre premier devis,\nune fois accepté il devient facture',
      cta: 'Ajouter un devis',
    },
    client: {
      title: 'Aucun client',
      subtitle: 'Ajoutez votre premier client pour créer\ndevis et factures en un clin d’œil',
      cta: 'Ajouter un client',
    },
    events: {
      title: 'Aucun événement',
      subtitle: 'Créez votre premier événement\npour suivre vos échéances',
      cta: 'Créer un événement',
    },
    recurring: {
      title: 'Aucune récurrence',
      subtitle: 'Configurez des récurrences pour\nautomatiser vos événements réguliers',
      cta: 'Créer une récurrence',
    },
    search: {
      title: 'Aucun résultat',
      subtitle: 'Aucun élément ne correspond à vos critères,\najustez la recherche ou la période',
    },
  },
  password: {
    minLength: '8 caractères minimum',
    lowercase: 'Une lettre minuscule',
    uppercase: 'Une lettre majuscule',
    digit: 'Un chiffre',
    special: 'Un caractère spécial',
    weak: 'Faible',
    fair: 'Moyen',
    good: 'Bon',
    excellent: 'Excellent',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    match: 'Les deux mots de passe correspondent',
    mustMatch: 'Doit être identique au nouveau mot de passe',
  },
  dropdown: { searchPlaceholder: 'Rechercher…', noResults: 'Aucun résultat', remove: 'Retirer' },
  datepicker: {
    ariaLabel: 'Date',
    openCalendar: 'Ouvrir le calendrier',
    chooseDate: 'Choisir une date',
    chooseMonth: 'Choisir un mois',
    dateLocale: 'fr-FR',
    prevMonth: 'Mois précédent',
    prevYear: 'Année précédente',
    nextMonth: 'Mois suivant',
    nextYear: 'Année suivante',
    chooseMonthYear: 'choisir le mois et l\'année',
    backToDays: 'Revenir aux jours',
    today: 'Aujourd\'hui',
  },
  inputEmails: { placeholder: 'Entrez des emails' },
  codeDisplay: { empty: 'Non renseigné', copy: 'Copier', copied: 'Copié' },
  codeField: {
    verified: 'Vérifié',
    invalid: 'Invalide',
    validFormat: 'Format conforme',
    typing: 'Saisie en cours',
  },
  attachments: { close: 'Fermer', deleteFile: 'Supprimer ce fichier', header: 'Pièces jointes', addFile: 'Ajouter un fichier' },
  viewer: {
    close: 'Fermer',
    prevPage: 'Page précédente',
    nextPage: 'Page suivante',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    copy: 'Copier le contenu',
    copied: 'Copié !',
    cannotDisplay: 'Impossible d’afficher ce fichier.',
  },
};

const DICTIONARIES: Record<BillyLocale, BillyI18nStrings> = {
  en: BILLY_I18N_EN,
  fr: BILLY_I18N_FR,
};

function mergeOverrides(base: BillyI18nStrings, overrides: BillyI18nOverrides): BillyI18nStrings {
  const keys = Object.keys(overrides) as (keyof BillyI18nStrings)[];
  if (keys.length === 0) { return base; }

  const merged = { ...base };
  for (const group of keys) {
    merged[group] = { ...base[group], ...overrides[group] } as never;
  }
  return merged;
}

/**
 * Built-in strings of the billy-layout components.
 *
 * Signal-based: changing the locale re-renders every label instantly. The
 * label inputs of the components (e.g. `labelSave` on the save bar) always
 * take precedence over this dictionary.
 */
@Service()
export class BillyI18nService {

  private readonly currentLocale = signal<BillyLocale>('en');
  private readonly overrides = signal<BillyI18nOverrides>({});

  /** Active locale ('en' by default). */
  readonly locale = this.currentLocale.asReadonly();

  /** The resolved dictionary: built-in strings of the locale + overrides. */
  readonly strings = computed(() => mergeOverrides(DICTIONARIES[this.currentLocale()], this.overrides()));

  /** Sets the locale and (optionally) per-string overrides. */
  use(locale: BillyLocale, overrides: BillyI18nOverrides = {}): void {
    this.currentLocale.set(locale);
    this.overrides.set(overrides);
  }

  /** Switches the locale, keeping the current overrides. */
  setLocale(locale: BillyLocale): void {
    this.currentLocale.set(locale);
  }

}

/**
 * Configures the language of the billy-layout components at bootstrap:
 *
 * ```ts
 * providers: [provideBillyI18n('fr')]
 * // or with overrides:
 * providers: [provideBillyI18n('fr', { saveBar: { save: 'Enregistrer' } })]
 * ```
 */
export function provideBillyI18n(locale: BillyLocale, overrides?: BillyI18nOverrides): EnvironmentProviders {
  return provideEnvironmentInitializer(() => inject(BillyI18nService).use(locale, overrides ?? {}));
}
