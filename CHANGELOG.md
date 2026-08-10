# Changelog

All notable changes to the `billy-layout` package are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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
