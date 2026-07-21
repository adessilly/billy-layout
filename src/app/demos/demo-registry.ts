import { Type } from '@angular/core';

/**
 * Registry of live demos, keyed by page (`category/slug`).
 * Each demo is a small standalone component, lazy-loaded on the component's
 * page ("Demo" tab). Pages without an entry here only show the
 * documentation (base classes, heavy contracts like file-viewer…).
 */
export const DEMO_LOADERS: Record<string, () => Promise<Type<unknown>>> = {
  'core/billy-icon': () => import('./core-demos').then(m => m.IconDemoComponent),
  'core/click-outside': () => import('./core-demos').then(m => m.ClickOutsideDemoComponent),
  'core/autofocus': () => import('./core-demos').then(m => m.AutofocusDemoComponent),
  'core/code-utils': () => import('./core-demos').then(m => m.CodeUtilsDemoComponent),

  'layout/billy-shell': () => import('./layout-demos').then(m => m.ShellDemoComponent),
  'layout/billy-topbar': () => import('./layout-demos').then(m => m.TopbarDemoComponent),
  'layout/billy-sidebar': () => import('./layout-demos').then(m => m.SidebarDemoComponent),
  'layout/billy-notifications': () => import('./layout-demos').then(m => m.NotificationsDemoComponent),
  'layout/action-bar': () => import('./layout-demos').then(m => m.ActionBarDemoComponent),

  'inputs/datepicker': () => import('./inputs-demos').then(m => m.DatepickerDemoComponent),
  'inputs/dropdown': () => import('./inputs-demos').then(m => m.DropdownDemoComponent),
  'inputs/code-field': () => import('./inputs-demos').then(m => m.CodeFieldDemoComponent),
  'inputs/input-emails': () => import('./inputs-demos').then(m => m.InputEmailsDemoComponent),
  'inputs/input-password': () => import('./inputs-demos').then(m => m.InputPasswordDemoComponent),
  'inputs/button-switch': () => import('./inputs-demos').then(m => m.ButtonSwitchDemoComponent),
  'inputs/attachment-button': () => import('./inputs-demos').then(m => m.AttachmentButtonDemoComponent),

  'forms/input-line': () => import('./forms-demos').then(m => m.InputLineDemoComponent),
  'forms/consult-line': () => import('./forms-demos').then(m => m.ConsultLineDemoComponent),
  'forms/input-prefix-suffix': () => import('./forms-demos').then(m => m.InputPrefixSuffixDemoComponent),
  'forms/label-clipboard': () => import('./forms-demos').then(m => m.LabelClipboardDemoComponent),
  'forms/save-bar': () => import('./forms-demos').then(m => m.SaveBarDemoComponent),
  'forms/form-side-panel': () => import('./forms-demos').then(m => m.FormSidePanelDemoComponent),

  'buttons/button': () => import('./buttons-demos').then(m => m.ButtonDemoComponent),
  'buttons/add-button': () => import('./buttons-demos').then(m => m.AddButtonDemoComponent),
  'buttons/upload-button': () => import('./buttons-demos').then(m => m.UploadButtonDemoComponent),

  'dialogs/delete-dialog': () => import('./dialogs-demos').then(m => m.DeleteDialogDemoComponent),
  'dialogs/dialog-form': () => import('./dialogs-demos').then(m => m.DialogFormDemoComponent),

  'feedback/toastr': () => import('./feedback-demos').then(m => m.ToastrDemoComponent),
  'feedback/snackbar': () => import('./feedback-demos').then(m => m.SnackbarDemoComponent),
  'feedback/app-loading': () => import('./feedback-demos').then(m => m.AppLoadingDemoComponent),
  'feedback/checkmark': () => import('./feedback-demos').then(m => m.CheckmarkDemoComponent),
  'feedback/circular-loading': () => import('./feedback-demos').then(m => m.CircularLoadingDemoComponent),
  'feedback/empty-state': () => import('./feedback-demos').then(m => m.EmptyStateDemoComponent),

  'display/billy-panel': () => import('./display-demos').then(m => m.BillyPanelDemoComponent),
  'display/consult-card': () => import('./display-demos').then(m => m.ConsultCardDemoComponent),
  'display/nav-card': () => import('./display-demos').then(m => m.NavCardDemoComponent),
  'display/page-header': () => import('./display-demos').then(m => m.PageHeaderDemoComponent),
  'display/header-action-bar': () => import('./display-demos').then(m => m.HeaderActionBarDemoComponent),
  'display/tabs': () => import('./display-demos').then(m => m.TabsDemoComponent),
  'display/filter-toggle-buttons': () => import('./display-demos').then(m => m.FilterToggleButtonsDemoComponent),
};

export function hasDemo(category: string, slug: string): boolean {
  return `${category}/${slug}` in DEMO_LOADERS;
}
