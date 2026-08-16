# Changelog

All notable changes to the `billy-layout` package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed (breaking)

- **`ng2-pdf-viewer` peer dependency bumped to `^10.0.0`** (was `^9.0.0`), which
  brings `pdfjs-dist` 4.x. Consuming applications must upgrade and adapt their
  worker asset: pdf.js now ships the worker as an **ES module**, so
  `<billy-file-viewer-pdf>` points `window.pdfWorkerSrc` at
  `/assets/js/pdf.worker.min.mjs`. Update the copy rule in `angular.json`
  (`"glob": "pdf.worker.min.mjs"` instead of `pdf.worker.min.js`) — otherwise the
  worker 404s and the viewer stays blank. The `ng2-pdf-viewer`,
  `pdfjs-dist/build/pdf` and `pdfjs-dist/web/pdf_viewer` entries in
  `allowedCommonJsDependencies` are no longer needed (pdfjs-dist 4.x is pure ESM)
  and can be dropped. Details in
  [`docs/viewers/file-viewer.md`](projects/billy-layout/docs/viewers/file-viewer.md#pitfalls--notes).

### Fixed

- **`<billy-input-line>` now names the field it wraps** (WCAG 4.1.2): the visible
  label is associated with the projected control (`for` + `aria-labelledby`,
  auto-detected, or targeted with the new `fieldId` input). `mandatory` is exposed
  as `aria-required` with the asterisk turned decorative, and the `info` tooltip —
  mouse-only until now — is read through `aria-describedby`, appended to any
  description the field already carries. A field that already has its own
  `<label>` is left untouched. Details in [`docs/forms/input-line.md`](projects/billy-layout/docs/forms/input-line.md#accessibility).

### Added

- **`<billy-save-bar>` embedded variant** (non-breaking): the new `variant` input
  (`'floating' | 'embedded'`, default `'floating'` — the current sticky card)
  renders a compact transparent bar for a form that already lives inside a white
  panel: no surface, border, shadow or sticky positioning, tighter spacing and no
  128px floor on the buttons. Details in
  [`docs/forms/save-bar.md`](projects/billy-layout/docs/forms/save-bar.md).
- **Customizable topbar logo** (non-breaking): `BILLY_SHELL_CONFIG.logo`
  (`string | BillyShellLogo` — `src`, `alt`, `srcDark`), plus the `logo` and
  `logoTemplate` inputs on `<billy-shell>` / `<billy-topbar>` for a per-instance
  image or fully custom markup. Without any of them, the bar keeps rendering
  `assets/images/icon-384.png` with `alt="BILLy"`.

## [1.0.0] — 2026-07-21

First open-source release. 🎉

### Changed (breaking)

- **All-English public API.** Every French identifier was renamed (selectors,
  inputs/outputs, types, union values) and every user-visible default string is
  now English. The complete machine-readable migration table lives in
  [`breaking-changes.md`](breaking-changes.md). Highlights:
  - `billy-button-ajout` → `billy-add-button`, `billy-button-upload` → `billy-upload-button`
  - `billy-input-tva` → `billy-input-vat`, `billy-tva-display` → `billy-vat-display`, `TvaUtils` → `VatUtils`
  - `billy-input-prefixe-suffixe` → `billy-input-prefix-suffix` (+ all `prefixe*`/`suffixe*` inputs)
  - `billy-page-header`: `titre`/`sousTitre`/`retour*` → `title`/`subtitle`/`back*`
  - `Toastr`/`ToastrInstance`: `titre`/`icone` → `title`/`icon`
  - `BillyIconName`, `EmptyStateType`, `BillyNotifCategoryId`: French union values → English
  - French default labels (save bar, delete dialog, toastr titles, …) → English
- Documentation (47 pages), UX guidelines and the AI context (`docs/claude.md`)
  fully translated to English.

### Added

- **i18n module**: `provideBillyI18n('en' | 'fr', overrides?)` +
  `BillyI18nService` (signal-based, runtime-switchable). English by default;
  the original French copy ships as the built-in `fr` dictionary. Component
  label inputs keep precedence over the dictionary.
- MIT license, contributing guide, CI (build + unit tests) and issue templates.
- Unit tests for the value utils (VAT/IBAN/email/code formatting), the `Dialog`
  engine, `ToastrService` and CVA form fields.
- `VatUtils.countryLabel(raw, locale?)`: optional locale for country names via
  `Intl.DisplayNames` (English fallback).

## [0.1.1] — 2026

Internal releases, extracted from the BILLy application (French API).
