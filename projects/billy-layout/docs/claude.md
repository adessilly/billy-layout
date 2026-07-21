# billy-layout — context for your AI assistant

> This file ships with the package. Import it into your application's
> `CLAUDE.md` with a single line:
>
> ```markdown
> @node_modules/billy-layout/docs/claude.md
> ```
>
> Your assistant will then know, in every session, that the application embeds
> the BILLy design system — and where to find its full documentation.

This application uses **billy-layout**, the Angular library of the BILLy design
system: application shell (topbar, sidebar, notifications, mobile action-bar),
form fields (ControlValueAccessor), dialogs, feedback, consultation panels and
`--billy-*` SCSS tokens.

## Rules for the assistant

1. **Do not reinvent the UI.** Before creating any visual component (button,
   field, card, dialog, toast, empty state…), check whether billy-layout
   already provides it. The full index — one page per component with the
   signals API, real examples, theming and pitfalls — is in
   `node_modules/billy-layout/docs/README.md`.
2. **Follow the UX guidelines** defined in
   `node_modules/billy-layout/docs/ux-guidelines.md` for any screen assembly:
   placement of page actions, list structure, consultation cards
   (`consult-card`), save bar (`save-bar`), empty states.
3. **Style through the design system.** Use the `--billy-*` CSS tokens
   (colors, surfaces, light/dark) and the shared SCSS mixins
   (`billy-forms`, `billy-cards`, `billy-code-field`…) rather than hard-coded
   values — details in `node_modules/billy-layout/docs/styles/styles.md`.
   Dark mode relies on the `body.dark-mode` class, driven by
   `BillyDarkModeService`.
4. **TypeScript imports** from the package's single entry point:
   `import { … } from 'billy-layout'`. Standalone components, signal-based
   API (`input()` / `output()` / `model()`).

## i18n — built-in component strings

The components' built-in strings (button labels, dialog copy, tooltips, empty
states…) come from an i18n dictionary — English by default, French shipped.
Configure the language at bootstrap with `provideBillyI18n('en' | 'fr')`, with
optional per-string overrides
(`provideBillyI18n('fr', { saveBar: { save: 'Enregistrer' } })`); switch at
runtime via `BillyI18nService.setLocale()` (signal-based, instant). The label
inputs of the components (`labelSave`, `backLabel`, …) always win over the
dictionary — do not hard-code translations that the dictionary already
provides. Full reference: `node_modules/billy-layout/docs/core/i18n.md`.

## Component family map

| Family | Contents | Docs |
|---|---|---|
| `layout/` | `<billy-shell>` (topbar, sidebar, notifications, slots), mobile action-bar | `docs/layout/` |
| `inputs/` | datepicker, dropdown, code fields (VAT/IBAN/email), multi-emails, password, switch, attachments | `docs/inputs/` |
| `forms/` | input-line/consult-line, save-bar, form-side-panel, signal-based form base class | `docs/forms/` |
| `buttons/` | action button (colors × variants × sizes), add/upload tiles | `docs/buttons/` |
| `dialogs/` | `Dialog` engine, `<billy-dialog-form>`, delete confirmation | `docs/dialogs/` |
| `feedback/` | toastr, snackbar, loaders, checkmark, empty-state | `docs/feedback/` |
| `display/` | consult-card, page-header, header-action-bar, tabs, nav-card, filters | `docs/display/` |
| `viewers/` | pdf/image/xml viewers (`BILLY_FILE_SOURCE`) | `docs/viewers/` |
| `core/` | `<billy-icon>`, click-outside, autofocus, VAT/IBAN/email utils | `docs/core/` |
| `styles/` | `--billy-*` tokens, reboot, SCSS mixins | `docs/styles/` |

All paths above are relative to `node_modules/billy-layout/`.
