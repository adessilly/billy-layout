# billy-layout — developer documentation

One page per component/family: purpose, API (signal inputs/outputs, CVA), real-world
usage examples taken from billy-client, theming (`--billy-*` tokens, dark mode) and
pitfalls. The `docs/` tree mirrors `src/lib/`.

**🧭 [UX guidelines](ux-guidelines.md)** — where to place action and add buttons,
how to structure a list page, when to use consult-card and save-bar.

**🤖 [claude.md](claude.md)** — ready-to-use context for your AI assistant:
import it into the consuming application's `CLAUDE.md`
(`@node_modules/billy-layout/docs/claude.md`).

## core — cross-cutting building blocks

- [billy-icon](core/billy-icon.md) — `<billy-icon>`: in-house SVG icon set (type `BillyIconName`), micro-animations on hover.
- [click-outside](core/click-outside.md) — `[clickOutside]` directive + `ClickOutsideService`: dropdown dismissal in zoneless mode (a single document listener).
- [autofocus](core/autofocus.md) — `[billyAutofocus]` directive (currently unused in the app).
- [code-utils](core/code-utils.md) — `code-format` (segments/statuses) + `VatUtils` (Belgian mod 97 check digits), `IbanUtils` (ISO mod 97), `EmailUtils` (diagnostics + domain suggestion).
- [i18n](core/i18n.md) — `provideBillyI18n('en' | 'fr')` + `BillyI18nService`: built-in component strings, overridable, runtime-switchable (signals).

## layout — application shell & navigation

- [billy-shell](layout/billy-shell.md) — `<billy-shell>`, `BillyShellService`, `BILLY_SHELL_CONFIG` token (`BillyShellConfig`, `BillyMenuLink`): the entry point, with the full assembly.
- [billy-topbar](layout/billy-topbar.md) — topbar, `[shell-search]`/`[shell-notifications]`/`[shell-account]` slots, `BillyDarkModeService`.
- [billy-sidebar](layout/billy-sidebar.md) — sidebar (links/version/badges via config) + `<billy-nav-item>`.
- [billy-notifications](layout/billy-notifications.md) — two-level notification bell, abstract base `BillyNotifCategory`, item/empty/action building blocks, "create a category" guide.
- [action-bar](layout/action-bar.md) — bottom-of-screen mobile navigation, `BillyActionBarTab[]` tabs supplied by the app.

## inputs — input fields (ControlValueAccessor)

- [datepicker](inputs/datepicker.md) — `<billy-datepicker>` (CVA `'yyyy-MM-dd' | null`, desktop popover / mobile bottom sheet) + `<billy-datepicker-calendar>`.
- [dropdown](inputs/dropdown.md) — `<billy-dropdown>` (`DropdownOption`, searchable mode, select2 parity).
- [code-field](inputs/code-field.md) — the code-field family: `CodeFieldBase`, `<billy-input-vat/-iban/-email>`, `<billy-vat-display/-iban-display>`, glyph/status/value building blocks.
- [input-emails](inputs/input-emails.md) — multi-email entry (tags + suggestions, `availableEmails` supplied by the consumer).
- [input-password](inputs/input-password.md) — password field with strength meter (`checkStrength`) and match check (`compareTo`).
- [button-switch](inputs/button-switch.md) — iOS-style boolean CVA toggle.
- [attachment-button](inputs/attachment-button.md) — attachments `[(files)]` + list panel.

## forms — form structure

- [input-line](forms/input-line.md) — label + projected field row (required flag, tooltip).
- [consult-line](forms/consult-line.md) — read-only counterpart of input-line.
- [input-prefix-suffix](forms/input-prefix-suffix.md) — field group with clickable prefix/suffix.
- [label-clipboard](forms/label-clipboard.md) — copy-to-clipboard label.
- [default-form-signal](forms/default-form-signal.md) — signal-based base class for add/edit forms.
- [save-bar](forms/save-bar.md) — sticky Save/Cancel bar (variants, dialog mode).
- [form-side-panel](forms/form-side-panel.md) — side panel with overlay and scroll lock.

## buttons — action buttons

- [button](buttons/button.md) — general-purpose action button (5 colors × 6 variants × 3 sizes, label and/or icon).
- [add-button](buttons/add-button.md) — "add" action tile (label + subtitle + icon).
- [upload-button](buttons/upload-button.md) — file import tile (hidden input, re-selection supported).

## dialogs — engine & dialogs

- [dialog](dialogs/dialog.md) — the `Dialog` class (stack, counted lock, close gestures), `.billy-modal` markup, `BILLY_DIALOG_ROUTER` token.
- [dialog-form](dialogs/dialog-form.md) — `<billy-dialog-form>` + header/body/footer, `closeThen`, relocation under `<body>` and its consequences.
- [delete-dialog](dialogs/delete-dialog.md) — delete confirmation (`openDialog`/`openDialogAndWait`).

## feedback — notifications & states

- [toastr](feedback/toastr.md) — `ToastrService` + toasts (timer = CSS animation, capped stack, mobile pill).
- [snackbar](feedback/snackbar.md) — global "new version" banner.
- [app-loading](feedback/app-loading.md) — `<billy-loading>`: loading overlay (requires a `position: relative` parent).
- [checkmark](feedback/checkmark.md) — animated checkmark, `checkmark-failed` failure cross + `checkmark-loading` spinner (design system colors).
- [circular-loading](feedback/circular-loading.md) — determinate progress ring (currently unused in the app).
- [empty-state](feedback/empty-state.md) — illustrated empty states (7 types, CTA).

## display — panels & page structure

- [billy-panel](display/billy-panel.md) — floating panel shell (anchored by the parent).
- [consult-card](display/consult-card.md) — consultation card (`[card-actions]` slot, anti-nesting rule).
- [nav-card](display/nav-card.md) — navigation tile `a[billy-nav-card]`/`button[billy-nav-card]` (icon chip, badge, chevron, staggered entrance).
- [page-header](display/page-header.md) — page header (title, back button, button area).
- [header-action-bar](display/header-action-bar.md) — header action bar (`HeaderAction`).
- [tabs](display/tabs.md) — `<billy-tabs<T>>` / `<billy-tab>` (projected or controlled mode, tabs stay mounted).
- [filter-toggle-buttons](display/filter-toggle-buttons.md) — segmented filters (toggle/chips variants).

## viewers — file viewers

- [file-viewer](viewers/file-viewer.md) — toolbar + pdf/image/xml viewers, `BILLY_FILE_SOURCE` / `BillyViewerFile` contract.

## styles — shared SCSS

- [styles](styles/styles.md) — `--billy-*` tokens (light/dark), reboot, `billy-forms`/`billy-cards`/`billy-code-field` mixins, `.billy-modal*` modal shell, consumption via includePaths.
