import { BillyIconName } from 'billy-layout';

/** Doc page of a library component presented by the site. */
export interface DocEntry {
  /** URL slug and markdown file name (without extension). */
  slug: string;
  /** Displayed name (tag, service or family). */
  label: string;
  /** One-line summary (taken from docs/README.md). */
  summary: string;
  /** Additional search tags. */
  tags?: string[];
}

/** Component category — mirrors the docs/ and src/lib/ tree. */
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
    intro: 'Cross-cutting building blocks: in-house icons, utility directives and value utils (VAT, IBAN, email).',
    entries: [
      { slug: 'billy-icon', label: 'billy-icon', summary: 'In-house SVG icon set (BillyIconName type), micro-animations on hover.', tags: ['icon', 'svg'] },
      { slug: 'click-outside', label: 'click-outside', summary: 'Directive [clickOutside] + ClickOutsideService: closing dropdowns in zoneless.', tags: ['directive', 'dropdown'] },
      { slug: 'autofocus', label: 'autofocus', summary: 'Directive [billyAutofocus]: automatic focus on display.', tags: ['directive', 'focus'] },
      { slug: 'code-utils', label: 'code-utils', summary: 'code-format (segments/statuses) + VatUtils, IbanUtils, EmailUtils (validation and suggestions).', tags: ['vat', 'iban', 'email', 'validation'] },
      { slug: 'i18n', label: 'i18n', summary: "provideBillyI18n('en' | 'fr') + BillyI18nService: built-in strings, overridable and runtime-switchable.", tags: ['i18n', 'locale', 'french'] },
    ],
  },
  {
    slug: 'layout',
    label: 'Layout',
    icon: 'open',
    intro: 'The complete application shell: topbar, collapsible sidebar, notification bell and mobile navigation.',
    entries: [
      { slug: 'billy-shell', label: 'billy-shell', summary: 'The entry point: topbar + sidebar + content shell, BILLY_SHELL_CONFIG token.', tags: ['shell', 'frame'] },
      { slug: 'billy-topbar', label: 'billy-topbar', summary: 'Topbar, shell-search / shell-notifications / shell-account slots, BillyDarkModeService.', tags: ['topbar', 'dark mode'] },
      { slug: 'billy-sidebar', label: 'billy-sidebar', summary: 'Sidebar (links, version, badges via config) + billy-nav-item.', tags: ['menu', 'navigation'] },
      { slug: 'billy-notifications', label: 'billy-notifications', summary: 'Two-level bell, abstract base BillyNotifCategory, item/empty/action building blocks.', tags: ['bell', 'notification'] },
      { slug: 'action-bar', label: 'action-bar', summary: 'Mobile bottom-of-screen navigation, BillyActionBarTab[] tabs provided by the app.', tags: ['mobile', 'navigation'] },
    ],
  },
  {
    slug: 'inputs',
    label: 'Inputs',
    icon: 'quotes',
    intro: 'ControlValueAccessor input fields: dates, lists, formatted codes, emails, password…',
    entries: [
      { slug: 'datepicker', label: 'datepicker', summary: "CVA 'yyyy-MM-dd' | null: desktop popover, mobile bottom-sheet + standalone calendar.", tags: ['date', 'calendar'] },
      { slug: 'dropdown', label: 'dropdown', summary: 'DropdownOption dropdown list, search mode, select2 parity.', tags: ['select', 'list'] },
      { slug: 'code-field', label: 'code-field', summary: 'The codes family: input-vat / input-iban / input-email + vat-display / iban-display views.', tags: ['vat', 'iban', 'email'] },
      { slug: 'input-emails', label: 'input-emails', summary: 'Multi-email input: tags + suggestions (availableEmails provided by the consumer).', tags: ['email', 'tags'] },
      { slug: 'input-password', label: 'input-password', summary: 'Password with strength gauge (checkStrength) and match check (compareTo).', tags: ['password'] },
      { slug: 'button-switch', label: 'button-switch', summary: 'iOS-style boolean CVA toggle.', tags: ['toggle', 'switch'] },
      { slug: 'attachment-button', label: 'attachment-button', summary: 'Attachments [(files)] + list panel.', tags: ['file', 'upload'] },
    ],
  },
  {
    slug: 'forms',
    label: 'Forms',
    icon: 'services',
    intro: 'Form structure: label + field rows, titled panels, sticky save-bar, side panel.',
    entries: [
      { slug: 'input-line', label: 'input-line', summary: 'Label + projected field row (required marker, tooltip).', tags: ['row', 'label'] },
      { slug: 'consult-line', label: 'consult-line', summary: 'Read-only counterpart of input-line.', tags: ['consult'] },
      { slug: 'input-prefix-suffix', label: 'input-prefix-suffix', summary: 'Field group + clickable prefix/suffix.', tags: ['addon'] },
      { slug: 'label-clipboard', label: 'label-clipboard', summary: 'Label copyable to the clipboard.', tags: ['copy', 'clipboard'] },
      { slug: 'default-form-signal', label: 'default-form-signal', summary: 'Signals base class for add/edit forms.', tags: ['form', 'signals'] },
      { slug: 'save-bar', label: 'save-bar', summary: 'Sticky Save/Cancel bar (variants, dialog mode).', tags: ['save', 'sticky'] },
      { slug: 'form-side-panel', label: 'form-side-panel', summary: 'Side panel with overlay and scroll lock.', tags: ['panel', 'overlay'] },
    ],
  },
  {
    slug: 'buttons',
    label: 'Buttons',
    icon: 'plus',
    intro: 'The versatile action button and the action tiles of home screens: add and import.',
    entries: [
      { slug: 'button', label: 'button', summary: 'Versatile action button: 5 colors × 6 variants × 3 sizes, label and/or icon.', tags: ['button', 'action', 'cta', 'variant'] },
      { slug: 'add-button', label: 'add-button', summary: '"Add" action tile (label + subtitle + icon).', tags: ['tile', 'add'] },
      { slug: 'upload-button', label: 'upload-button', summary: 'File import tile (hidden input, re-selection possible).', tags: ['tile', 'import'] },
    ],
  },
  {
    slug: 'dialogs',
    label: 'Dialogs',
    icon: 'account',
    intro: 'The Dialog engine (stack, lock, close gestures) and the ready-to-use dialogs.',
    entries: [
      { slug: 'dialog', label: 'dialog', summary: 'The Dialog class (stack, counted lock, close gestures), .billy-modal markup, BILLY_DIALOG_ROUTER.', tags: ['modal'] },
      { slug: 'dialog-form', label: 'dialog-form', summary: 'billy-dialog-form + header/body/footer, closeThen, relocation under <body>.', tags: ['modal', 'form'] },
      { slug: 'delete-dialog', label: 'delete-dialog', summary: 'Delete confirmation (openDialog / openDialogAndWait).', tags: ['delete', 'confirmation'] },
    ],
  },
  {
    slug: 'feedback',
    label: 'Feedback',
    icon: 'bell',
    intro: 'Toasts, snackbar, loaders and illustrated empty states.',
    entries: [
      { slug: 'toastr', label: 'toastr', summary: 'ToastrService + toasts (CSS-animated timer, capped stack, mobile pill).', tags: ['toast', 'notification'] },
      { slug: 'snackbar', label: 'snackbar', summary: 'Global "new version" banner.', tags: ['banner'] },
      { slug: 'app-loading', label: 'app-loading', summary: 'billy-loading: loading overlay (parent position: relative required).', tags: ['loader', 'loading'] },
      { slug: 'checkmark', label: 'checkmark', summary: 'Animated checkmark, failure cross + checkmark-loading spinner (DS colors).', tags: ['checkmark', 'animation', 'error'] },
      { slug: 'circular-loading', label: 'circular-loading', summary: 'Determinate progress ring.', tags: ['progress'] },
      { slug: 'empty-state', label: 'empty-state', summary: 'Illustrated empty states (7 types, CTA).', tags: ['empty', 'illustration'] },
    ],
  },
  {
    slug: 'display',
    label: 'Display',
    icon: 'sales',
    intro: 'Page structure: headers, action bars, consult cards, tabs and filters.',
    entries: [
      { slug: 'billy-panel', label: 'billy-panel', summary: 'Floating panel shell (anchored by the parent).', tags: ['panel', 'floating'] },
      { slug: 'consult-card', label: 'consult-card', summary: 'Consult card ([card-actions] slot, anti-nesting rule).', tags: ['card'] },
      { slug: 'nav-card', label: 'nav-card', summary: 'Navigation tile a[billy-nav-card] (icon chip, badge, chevron, cascade).', tags: ['card', 'navigation', 'tile'] },
      { slug: 'page-header', label: 'page-header', summary: 'Page header (title, back, buttons area).', tags: ['title', 'header'] },
      { slug: 'header-action-bar', label: 'header-action-bar', summary: 'Header action bar (HeaderAction).', tags: ['actions', 'buttons'] },
      { slug: 'tabs', label: 'tabs', summary: 'billy-tabs / billy-tab (projected or driven mode, permanently mounted tabs).', tags: ['tabs'] },
      { slug: 'filter-toggle-buttons', label: 'filter-toggle-buttons', summary: 'Segmented filters (toggle/chips variants).', tags: ['filters', 'segments'] },
    ],
  },
  {
    slug: 'viewers',
    label: 'Viewers',
    icon: 'search',
    intro: 'The file viewers: shared toolbar + PDF, image and XML renderings.',
    entries: [
      { slug: 'file-viewer', label: 'file-viewer', summary: 'Toolbar + pdf/image/xml viewers, BILLY_FILE_SOURCE / BillyViewerFile contract.', tags: ['pdf', 'image', 'xml'] },
    ],
  },
];

/** Total number of component doc pages. */
export const DOC_ENTRY_COUNT = DOC_CATEGORIES.reduce((n, c) => n + c.entries.length, 0);

export function findCategory(slug: string | null): DocCategory | undefined {
  return DOC_CATEGORIES.find(c => c.slug === slug);
}

export function findEntry(category: string | null, slug: string | null): { category: DocCategory; entry: DocEntry } | undefined {
  const cat = findCategory(category);
  const entry = cat?.entries.find(e => e.slug === slug);
  return cat && entry ? { category: cat, entry } : undefined;
}
