# billy-layout

[![npm version](https://img.shields.io/npm/v/billy-layout)](https://www.npmjs.com/package/billy-layout)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adessilly/billy-layout/blob/main/LICENSE)

BILLy layout + design system for Angular: application shell (topbar, sidebar,
notifications, mobile navigation bar), SCSS tokens & mixins, form fields,
panels, dialogs and feedback components.

Extracted from a production invoicing application, without Bootstrap and
without any business-code dependency.

**📚 Developer documentation: [docs/README.md](docs/README.md)** — one page per
component (API, examples, theming, pitfalls).
**🧭 UX guidelines: [docs/ux-guidelines.md](docs/ux-guidelines.md)** — screen
assembly conventions (header buttons, lists, consult cards, save bar).

> The documentation is **shipped inside the published package**: once the
> library is installed, everything is readable from
> `node_modules/billy-layout/docs/` (AI assistants included — start with
> `docs/README.md`, then `docs/ux-guidelines.md`).

**🤖 AI assistant (Claude Code, etc.)**: the package embeds
[docs/claude.md](docs/claude.md), a ready-to-use context. Add this line to your
application's `CLAUDE.md` and your assistant will know the layout, the design
system and the installed components:

```markdown
@node_modules/billy-layout/docs/claude.md
```

## Source layout

`src/lib/` is organized by category (mirrors `docs/`):

| Folder | Content |
|---|---|
| `core/` | cross-cutting building blocks: billy-icon, click-outside, autofocus, VAT/IBAN/email utils |
| `layout/` | application shell (topbar/sidebar/notifications) + mobile action bar |
| `inputs/` | CVA form fields: datepicker, dropdown, code-field, input-emails, input-password, button-switch, attachment-button |
| `forms/` | form structure: form-creation, default-form-signal, save-bar, form-side-panel |
| `buttons/` | action tiles: add-button, upload-button |
| `dialogs/` | `Dialog` engine, dialog-form, delete-dialog |
| `feedback/` | toastr, snackbar, loaders, empty-state |
| `display/` | billy-panel, consult-card, page-header, header-action-bar, tabs, filter-toggle-buttons |
| `viewers/` | file viewers (pdf/image/xml) |
| `styles/` | shared SCSS: tokens, reboot, mixins (published under `styles/`) |

## Consuming the library

- **TypeScript**: `import { … } from 'billy-layout'`. Inside this workspace the
  root `tsconfig.json` maps the package to `projects/billy-layout/src/public-api.ts`
  (source compilation — no need to build the lib during development).
- **SCSS**: the shared stylesheets live in `src/lib/styles/` and are resolved
  through `stylePreprocessorOptions.includePaths` (angular.json):

  ```scss
  @use 'billy-forms' as forms;   // field/button mixins
  @use 'billy-cards' as cards;   // card/section mixins
  @use 'billy-code-field' as code;
  @use 'billy-tokens';           // CSS variables --billy-* (:root + dark)
  @use 'billy-dialog';           // modal shell .billy-modal*
  @use 'billy-reboot';           // global normalization (box-sizing…)
  ```

  When published, these files are shipped under `billy-layout/styles/`
  (ng-packagr assets): an external consumer adds that folder to its
  `includePaths`.

## Application prerequisites

- **Fonts** (loaded by the application, see `src/index.html`):
  "Plus Jakarta Sans" (shell + design system). "Source Sans Pro" is only needed
  by the legacy compatibility layer (`billy-reboot` uses it as the base font of
  business pages).
- **Tokens & theme**: load `billy-tokens` in the global styles; dark mode relies
  on the `body.dark-mode` class, managed by `BillyDarkModeService`
  (localStorage key `billy_dark_mode`).
- **Providers**:
  - `BILLY_SHELL_CONFIG` — menu links, version, homeLink, logout, badges,
    notification sync;
  - `BILLY_DIALOG_ROUTER` (optional) — closes routed overlays for
    `billy-dialog-form`;
  - `BILLY_FILE_SOURCE` — content source for the `billy-file-viewer-*` viewers.

## Shell: slots

`<billy-shell>` projects three application zones into the topbar:

```html
<billy-shell>
  <app-search shell-search />
  <billy-notifications shell-notifications>
    <!-- categories: components extending BillyNotifCategory -->
  </billy-notifications>
  <app-account-menu shell-account />
  <router-outlet />
</billy-shell>
```

## Build & publish

```bash
ng build billy-layout   # ng-packagr → dist/billy-layout (FESM + DTS + styles/ + docs/)
cd dist/billy-layout && npm publish
```

## Migrating from 0.x

The pre-1.0 API used French identifiers. Version 1.0.0 renamed the entire
public API to English — see
[breaking-changes.md](https://github.com/adessilly/billy-layout/blob/main/breaking-changes.md)
for the complete old → new table (designed to be applied by an AI agent).
