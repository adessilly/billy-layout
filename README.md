# billy-layout

[![npm version](https://img.shields.io/npm/v/billy-layout)](https://www.npmjs.com/package/billy-layout)
[![CI](https://github.com/adessilly/billy-layout/actions/workflows/ci.yml/badge.svg)](https://github.com/adessilly/billy-layout/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-22-dd0031)](https://angular.dev)
[![Live demo](https://img.shields.io/badge/live%20demo-layout.compta--billy.be-0E97BB)](https://layout.compta-billy.be)

**🔗 [Live demo & interactive docs → layout.compta-billy.be](https://layout.compta-billy.be)** — every
component with a live playground, the UX guidelines, the design-token gallery
(try dark mode and the EN/FR switch).

**An Angular design system and application shell, extracted from a real-world
production app** (BILLy, an invoicing application). Standalone components,
signals everywhere, SCSS design tokens with first-class dark mode, built-in
i18n (English/French, runtime-switchable) — and documentation that ships
*inside* the npm package, ready to be consumed by AI coding assistants.

> 🤖 **AI-ready in one line.** The published package embeds its full docs and a
> curated LLM context. Add this to your app's `CLAUDE.md` and your assistant
> knows the whole design system:
>
> ```markdown
> @node_modules/billy-layout/docs/claude.md
> ```

## What's inside

| Category | Components |
|---|---|
| `layout/` | application shell: topbar, sidebar, notification center, mobile action bar |
| `inputs/` | CVA form fields: datepicker, dropdown, VAT/IBAN/email code fields, emails input, password with strength meter, button switch, attachment button |
| `forms/` | form structure: input lines, consult lines, save bar, side panel |
| `buttons/` | button, add tile, upload tile |
| `dialogs/` | dependency-free `Dialog` engine, dialog form, delete confirmation |
| `feedback/` | toastr, snackbar, loaders, animated checkmarks, empty states |
| `display/` | panels, consult cards, page header, header action bar, tabs, filter toggles |
| `viewers/` | PDF / image / XML file viewers |
| `styles/` | SCSS design tokens (`--billy-*`, light + dark), mixins, reboot |

Design-system rules for assembling screens (page-level actions, list structure,
save bars, empty states…) are documented in
[`docs/ux-guidelines.md`](projects/billy-layout/docs/ux-guidelines.md), and each
component has its own markdown page under
[`projects/billy-layout/docs/`](projects/billy-layout/docs/README.md) — API,
examples, theming, pitfalls.

## Quick start

```bash
npm install billy-layout
```

```html
<billy-shell>
  <billy-notifications shell-notifications />
  <router-outlet />
</billy-shell>
```

See the [library README](projects/billy-layout/README.md) for integration
prerequisites (fonts, tokens, `BILLY_*` providers) and the SCSS setup.

## Showcase site

**Live at [layout.compta-billy.be](https://layout.compta-billy.be).** This
repository is an Angular workspace containing the library **and** its
showcase site — a documentation app built with the library itself (shell,
tokens, cards, toasts…): one page per component with a **live demo** tab and a
**docs** tab, a UX guidelines page, and a live design-token gallery with dark
mode.

```bash
npm install
npm start          # showcase site on http://localhost:4201
```

The site compiles the library from sources, so it is also the development
environment: change a component, see it live.

| Folder | Content |
|---|---|
| `projects/billy-layout/` | the library (source `src/lib/`, markdown docs `docs/`, built by ng-packagr) |
| `src/` | the showcase site: pages, live demos, markdown viewer |
| `dist/billy-layout/` | the publishable package after `npm run build:lib` |

## Development

```bash
npm start              # showcase site (compiles the lib from sources)
npm run test:lib       # unit tests (vitest)
npm run build:lib      # ng-packagr → dist/billy-layout (FESM + DTS + styles/ + docs/)
```

## Contributing & license

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). A component
change is only *done* when its docs page and live demo are in sync.

MIT © [Adrien Dessilly](LICENSE). Migrating from the pre-1.0 French API? See
[breaking-changes.md](breaking-changes.md).
