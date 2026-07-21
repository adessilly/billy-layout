# billy-layout 0.x → 1.0.0 — Breaking changes & migration table

> **Audience: an AI coding agent migrating an application that consumes `billy-layout`**
> (typically `billy-client`). Apply every rename below, in order. All renames are
> mechanical; section 7 lists behavioral changes that need a human/product decision.
>
> Scope of a "rename": TypeScript imports and usages, HTML templates (selectors,
> attribute/property/event bindings), and string literals typed against the listed
> unions. Use word-boundary matching — several old names are substrings of French
> prose that may exist in app copy (do NOT touch user-facing app text).

Package: `billy-layout` — old version `0.1.x` (French API) → new version `1.0.0` (English API).

## 1. Component selectors (HTML templates)

| Old selector | New selector |
|---|---|
| `billy-button-ajout` | `billy-add-button` |
| `billy-button-upload` | `billy-upload-button` |
| `billy-input-prefixe-suffixe` | `billy-input-prefix-suffix` |
| `billy-input-tva` | `billy-input-vat` |
| `billy-tva-display` | `billy-vat-display` |

All other selectors are unchanged.

## 2. Exported TypeScript symbols (imports from `'billy-layout'`)

| Old symbol | New symbol |
|---|---|
| `ButtonAjoutComponent` | `AddButtonComponent` |
| `ButtonUploadComponent` | `UploadButtonComponent` |
| `InputPrefixeSuffixeComponent` | `InputPrefixSuffixComponent` |
| `InputTvaComponent` | `InputVatComponent` |
| `TvaDisplayComponent` | `VatDisplayComponent` |
| `TvaUtils` | `VatUtils` |

All other exported symbols keep their names (`PageHeaderComponent`, `ToastrService`, `Dialog`, …).

## 3. Inputs / outputs (template bindings AND programmatic access)

### `billy-page-header` (`PageHeaderComponent`)

| Old | New | Kind |
|---|---|---|
| `titre` | `title` | input (required) |
| `sousTitre` | `subtitle` | input |
| `retourVisible` | `backVisible` | input |
| `retourTitre` | `backLabel` | input (default is now `'Back'`, was `'Retour'`) |
| `retour` | `back` | output |

Template example: `<billy-page-header titre="…" [sousTitre]="…" (retour)="…">` → `<billy-page-header title="…" [subtitle]="…" (back)="…">`.

### `billy-delete-dialog` (`DeleteDialogComponent`)

| Old | New | Kind |
|---|---|---|
| `titre` | `title` | model |
| `prix` | `price` | model |

Method signature: `openDialogAndWait(titre, sousTitre, label)` → `openDialogAndWait(title, subtitle, label)` (positional — call sites unchanged unless they used named comments).

### `billy-file-viewer-pdf`, `billy-file-viewer-image`, `billy-file-viewer-xml`

| Old | New |
|---|---|
| `fichier` | `file` |

### `billy-input-prefix-suffix` (`InputPrefixSuffixComponent`)

| Old | New | Kind |
|---|---|---|
| `prefixe` / `suffixe` | `prefix` / `suffix` | input |
| `prefixeIcon` / `suffixeIcon` | `prefixIcon` / `suffixIcon` | input |
| `prefixeClickable` / `suffixeClickable` | `prefixClickable` / `suffixClickable` | input |
| `prefixeClick` / `suffixeClick` | `prefixClick` / `suffixClick` | output |

## 4. Interface / type field renames

### `Toastr` and `ToastrInstance` (used by `ToastrService.pushMessage`, custom toast templates)

| Old field | New field |
|---|---|
| `titre` | `title` |
| `icone` | `icon` |

Example: `toastr.pushMessage({ titre: 'X', message: 'Y', icone: 'fa-…' })` → `toastr.pushMessage({ title: 'X', message: 'Y', icon: 'fa-…' })`.

### `BillyNotifCategory.clientName()` structural parameter (app-side notification category components)

`{ client?: { nom?: string; prenom?: string } }` → `{ client?: { lastName?: string; firstName?: string } }`.
Adapt call sites: map business objects, e.g. `clientName({ client: { lastName: c.nom, firstName: c.prenom } })`, or rename upstream fields.

## 5. String-literal union renames

Only replace these literals where they are typed against the given union (icon bindings, empty-state types, notif ids, glyph kinds) — never in free text.

### `BillyIconName` (`<billy-icon name="…">`, `BillyMenuLink.icon`, `BillyNotifCategory.icon`, tabs/action-bar configs)

| Old | New |
|---|---|
| `'accueil'` | `'home'` |
| `'achats'` | `'purchases'` |
| `'devis'` | `'quotes'` |
| `'ventes'` | `'sales'` |
| `'prestations'` | `'services'` |
| `'agenda'` | `'calendar'` |
| `'compte'` | `'account'` |

(`'clients'`, `'peppol'` and all already-English names are unchanged.)

### `EmptyStateType` (`<billy-empty-state [type]="…">`)

| Old | New |
|---|---|
| `'achat'` | `'purchase'` |
| `'vente'` | `'sale'` |
| `'devis'` | `'quote'` |
| `'client'` | `'client'` (unchanged) |
| `'evenements'` | `'events'` |
| `'recurrences'` | `'recurring'` |
| `'recherche'` | `'search'` |

### `BillyNotifCategoryId` (notification category components: `readonly id`, `activeCategory` comparisons)

| Old | New |
|---|---|
| `'entrantes'` | `'incoming'` |
| `'sortantes'` | `'outgoing'` |
| `'impayes'` | `'unpaid'` |

### `CodeGlyphKind` (`<billy-code-glyph [kind]="…">`)

| Old | New |
|---|---|
| `'tva'` | `'vat'` |

## 6. Renamed files inside the published package

| Old path | New path |
|---|---|
| `node_modules/billy-layout/docs/buttons/button-ajout.md` | `docs/buttons/add-button.md` |
| `node_modules/billy-layout/docs/buttons/button-upload.md` | `docs/buttons/upload-button.md` |
| `node_modules/billy-layout/docs/forms/input-prefixe-suffixe.md` | `docs/forms/input-prefix-suffix.md` |

The AI context reference `@node_modules/billy-layout/docs/claude.md` is unchanged (content now English).

## 7. Behavioral change — built-in strings are English by default; French via i18n

Every user-visible built-in string (default labels, dialog copy, tooltips,
empty states, password criteria, toast titles, file-viewer controls, code-field
diagnostics) is now English **by default**. The original French copy still
ships with the library, behind the new i18n module.

### 7a. THE fix for a French application — one provider

```ts
// app.config.ts
import { provideBillyI18n } from 'billy-layout';

providers: [
  provideBillyI18n('fr'),
  // …
]
```

This restores the exact pre-1.0 French strings everywhere (they were preserved
verbatim in the built-in `fr` dictionary): save bar, delete dialog, add/upload
tiles, toast titles, empty states, password criteria, shell tooltips,
notification panel, file viewers, dropdown/datepicker/emails placeholders and
the VAT/IBAN/email field diagnostics. Individual strings can be overridden:
`provideBillyI18n('fr', { saveBar: { save: 'Enregistrer' } })`, and the label
inputs of the components (`labelSave`, `backLabel`, …) still take precedence.
Runtime switching: `inject(BillyI18nService).setLocale('en' | 'fr')`.

### 7b. Call sites that pass explicit French labels today

Existing explicit labels (e.g. `success(msg, 'Succès')`, `labelSave="..."`)
keep working unchanged — with `provideBillyI18n('fr')` they become redundant
and MAY be removed, but this is optional cleanup, not required.

### 7c. Utility functions

`VatUtils.countryLabel(raw)` now returns **English** country names by default;
pass a locale for French: `VatUtils.countryLabel(raw, 'fr')` (via
`Intl.DisplayNames`). The diagnostic methods (`VatUtils.describe`, IBAN/email
equivalents) accept an optional `locale?: 'en' | 'fr'` — the code-field
components pass the i18n locale automatically, so no app change is needed
beyond 7a.

## 8. Suggested migration procedure

1. `npm install billy-layout@^1.0.0`.
2. Add `provideBillyI18n('fr')` to `app.config.ts` (section 7a) if the app must
   stay French.
3. Apply section 2 (TS symbols), then section 1 (selectors), then section 3
   (bindings), then section 5 (union literals — typed contexts only).
4. Apply section 4 field renames (`titre`→`title`, `icone`→`icon` on Toastr
   objects; `clientName` param mapping).
5. Build: `ng build` — every remaining compile error is a missed rename (the
   old names no longer exist, so the compiler finds all of them **except**
   selector typos in templates, which surface as `NG8001` unknown element).
6. Grep for leftovers: `grep -rnE "billy-button-ajout|billy-input-tva|billy-tva-display|billy-input-prefixe-suffixe|ButtonAjout|InputTva|TvaDisplay|TvaUtils|InputPrefixeSuffixe|\[titre\]|\[sousTitre\]|\(retour\)|\[fichier\]|\[prix\]" src/`.
7. Run the app and visually check: toasts, save bars, delete dialogs, page
   headers, empty states, password field, notification center — all should be
   in French again thanks to step 2.
