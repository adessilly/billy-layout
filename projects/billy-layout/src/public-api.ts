/*
 * Public API Surface of billy-layout
 *
 * Layout + design system BILLy. Organized by category (mirrors docs/):
 *   core/     cross-cutting building blocks: icons, directives, value utils
 *   layout/   application shell (topbar/sidebar/notifications) + action bar
 *   inputs/   form fields (CVA)
 *   forms/    form structure (lines, panels, save bar)
 *   buttons/  action buttons
 *   dialogs/  Dialog engine + dialogs
 *   feedback/ toastr, snackbar, loaders, empty states
 *   display/  panels and page structure
 *   viewers/  file viewers
 *   styles/   shared SCSS (tokens, mixins, reboot — assets, see README)
 */

// ── core ─────────────────────────────────────────────────────────────────────
export * from './lib/core/i18n/billy-i18n';
export * from './lib/core/icon/billy-icon.component';
export * from './lib/core/click-outside/click-outside.directive';
export * from './lib/core/click-outside/click-outside.service';
export * from './lib/core/autofocus/autofocus.directive';
export * from './lib/core/utils/code-format';
export * from './lib/core/utils/vat-utils';
export * from './lib/core/utils/iban-utils';
export * from './lib/core/utils/email-utils';

// ── layout ───────────────────────────────────────────────────────────────────
export * from './lib/layout/shell/billy-shell-config';
export * from './lib/layout/shell/billy-shell.component';
export * from './lib/layout/shell/billy-shell.service';
export * from './lib/layout/shell/billy-sidebar.component';
export * from './lib/layout/shell/billy-topbar.component';
export * from './lib/layout/shell/billy-nav-item.component';
export * from './lib/layout/shell/billy-dark-mode.service';
export * from './lib/layout/shell/notifications/billy-notifications.component';
export * from './lib/layout/shell/notifications/billy-notif-category';
export * from './lib/layout/shell/notifications/billy-notif-action.component';
export * from './lib/layout/shell/notifications/billy-notif-empty.component';
export * from './lib/layout/shell/notifications/billy-notif-item.component';
export * from './lib/layout/action-bar/action-bar.component';

// ── inputs (form fields, CVA) ────────────────────────────────────────────────
export * from './lib/inputs/datepicker/datepicker.component';
export * from './lib/inputs/datepicker/datepicker-calendar.component';
export * from './lib/inputs/dropdown/dropdown.component';
export * from './lib/inputs/code-field';
export * from './lib/inputs/input-emails/input-emails.component';
export * from './lib/inputs/input-password/input-password.component';
export * from './lib/inputs/button-switch/button-switch.component';
export * from './lib/inputs/attachment-button/attachment-button.component';
export * from './lib/inputs/attachment-button/attachment-button-list/attachment-button-list.component';

// ── forms (form structure) ───────────────────────────────────────────────────
export * from './lib/forms/form-creation';
export * from './lib/forms/default-form/default-form-signal.component';
export * from './lib/forms/save-bar/save-bar.component';
export * from './lib/forms/form-side-panel/form-side-panel.component';

// ── buttons ──────────────────────────────────────────────────────────────────
export * from './lib/buttons/button/button.component';
export * from './lib/buttons/add-button/add-button.component';
export * from './lib/buttons/upload-button/upload-button.component';

// ── dialogs ──────────────────────────────────────────────────────────────────
export * from './lib/dialogs/dialog/dialog-utils';
export * from './lib/dialogs/dialog/billy-dialog-router';
export * from './lib/dialogs/dialog-form';
export * from './lib/dialogs/delete-dialog/delete-dialog.component';

// ── feedback ─────────────────────────────────────────────────────────────────
export * from './lib/feedback/toastr/toastr';
export * from './lib/feedback/toastr/toastr.service';
export * from './lib/feedback/toastr/toastr.component';
export * from './lib/feedback/toastr/toastr-list-panel/toastr-list-panel.component';
export * from './lib/feedback/snackbar/snackbar.component';
export * from './lib/feedback/app-loading/app-loading.component';
export * from './lib/feedback/checkmark/checkmark.component';
export * from './lib/feedback/checkmark-failed/checkmark-failed.component';
export * from './lib/feedback/checkmark-loading/checkmark-loading.component';
export * from './lib/feedback/circular-loading/circular-loading.component';
export * from './lib/feedback/empty-state/empty-state.component';

// ── display (panels & page structure) ────────────────────────────────────────
export * from './lib/display/billy-panel/billy-panel.component';
export * from './lib/display/consult-card/consult-card.component';
export * from './lib/display/nav-card/nav-card.component';
export * from './lib/display/page-header/page-header.component';
export * from './lib/display/header-action-bar/header-action-bar.component';
export * from './lib/display/header-action-bar/header-action';
export * from './lib/display/tabs/tabs.component';
export * from './lib/display/tabs/tab.component';
export * from './lib/display/filter-toggle-buttons/filter-toggle-buttons.component';

// ── viewers ──────────────────────────────────────────────────────────────────
export * from './lib/viewers/file-viewer/billy-file-source';
export * from './lib/viewers/file-viewer/file-viewer-toolbar/file-viewer-toolbar.component';
export * from './lib/viewers/file-viewer/file-viewer-pdf/file-viewer-pdf.component';
export * from './lib/viewers/file-viewer/file-viewer-image/file-viewer-image.component';
export * from './lib/viewers/file-viewer/file-viewer-xml/file-viewer-xml.component';
