# UX guidelines — assembling a BILLy screen

Conventions for assembling screens with billy-layout components. Every rule
reflects the patterns in use in billy-client (all cited examples are real).
API pages: see [docs/README.md](README.md).

---

## 1. Action buttons in the page header

**Rule: every page-level action lives in the header, never in the body.**
The standard trio:

```html
<billy-page-header title="Sales" subtitle="A list of your sales">
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>
```

- The title + subtitle come from [page-header](display/page-header.md); the buttons
  are projected into it via [header-action-bar](display/header-action-bar.md)
  (`HeaderAction[]`).
- **Only one `variant: 'primary'` action per page** — the add action or the main
  action ("Add a sale", "Send"). Icon `fa-solid fa-plus` for add actions.
- `variant: 'danger'`: only for a destructive page-level action
  ("Delete" on a consult page). Never two danger actions.
- Actions **without a variant** (secondary: "Duplicate", "Download"…) are
  automatically grouped into a segmented group, placed before the primary/danger pills.
- Mobile: the bar collapses to icons only — every action therefore needs an explicit
  `icon` and `title`.
- No floating add button (FAB) and no add button at the bottom of a list. Two
  sanctioned exceptions: the [empty-state](feedback/empty-state.md) CTA (a relay of
  the primary action when the list is empty) and the
  [add-button](buttons/add-button.md)/[upload-button](buttons/upload-button.md)
  tiles reserved for home screens (home-actions).
- On a **consult** page, the header actions act on the object being viewed
  (Edit / Send / Delete); the back button is handled by `billy-page-header`
  (`[backVisible]` + `back` output), not by a button in the action bar.

Real examples: `vente-list` (primary only), `devis-form`, `achat-consult`, `compte`.

## 2. Adding a list to a page

**Canonical structure** (see `vente-list`, `achat-list`, `devis-list`):

```html
<billy-page-header title="…" subtitle="…">
  <billy-header-action-bar [actions]="headerActions"></billy-header-action-bar>
</billy-page-header>

<div class="data-list">

  <div class="xxx-list-filters">
    <app-xxx-filter-bar …></app-xxx-filter-bar>
  </div>

  <div class="data-list-content loadable">
    @if (state.loading()) {
      <!-- loader -->
    } @else if (filtered().length === 0) {
      <billy-empty-state [type]="hasItems() ? 'search' : 'sale'" (createClicked)="askAdd()"/>
    } @else {
      <!-- groups + cards -->
    }
  </div>

</div>
```

The rules:

1. **`.data-list` wrapper** (`src/styles-data-list.scss` sheet, app-side): width,
   gutters and background shared by all lists. Do not reinvent a container.
2. **The filter bar is the first block of the list**, not part of the header.
   It is domain-specific (`*-filter-bar`, app-side) but built from library
   building blocks: [filter-toggle-buttons](display/filter-toggle-buttons.md) for
   segments (period, status), [dropdown](inputs/dropdown.md), a search field styled
   with `billy-forms`.
3. **Three states, always in this order**: loading → empty → content. The empty state
   uses [empty-state](feedback/empty-state.md) with the distinction between **truly
   empty** (the concept's type: `'sale'`, `'purchase'`… + a CTA relaying the header's
   add action) and **empty after filtering** (`type="search"`, no CTA). Test
   `filtered().length === 0` together with `hasItems()` to choose — never the other
   way around.
4. **Chronological grouping**: document lists are grouped by year
   (`year-block`/`year-header`) then quarter, with totals in the group header.
5. **One card per item**: documents (sale/purchase/quote/client) use the
   `invoice-card` skin (`src/app/shared/styles/invoice-card.scss`, app-side, API via
   `--ic-*` variables). Clicking the card opens the **consult view**; contextual
   actions go through the card's menu — no inline buttons repeated on every row.

## 3. When to use `billy-consult-card`

[consult-card](display/consult-card.md) = **the titled card of read-only screens**:
consult pages and dialogs, account tabs, file managers.

- **Yes**: grouping information on a consult view (`vente-consult`, `devis-form` for
  attachments, `compte`, upload-manager, peppol-inbox-list). Title = `label` +
  `icon` (chip); optional count badge.
- **The block's contextual action** (a single one, e.g. "Manage") is projected into the
  `[card-actions]` slot, to the right of the title — no button in the card body.
- **Anti-nesting rule** (project preference): a card with **a single block of content** =
  white card + chip title, **without** an inner grey section. Grey sections
  (`billy-section` from `billy-cards`) are reserved for **multi-block** cards
  (compte-form, achat-document). Never a panel inside a panel without necessity.
- **No**:
  - in a **form** → hand-rolled sections on the `billy-cards` mixins
    (compte-form/client-form pattern);
  - for an item **repeated in a list** → list card (`invoice-card`);
  - for an anchored floating panel (account menu) → [billy-panel](display/billy-panel.md);
  - accepted exception: `invoice-document` keeps its dedicated invoice look.

## 4. When to use `billy-save-bar`

[save-bar](forms/save-bar.md) = **the conclusion of every form**. Two contexts,
two skins:

1. **Full-page form** (add/edit: vente-form, devis-form, client-form…):
   the save-bar is the **last element of the `<form>`**, sticky at the bottom of the page:

   ```html
   <form [formGroup]="formGroup" (ngSubmit)="askSave()">
     …
     <billy-save-bar
       [disabled]="!formGroup.valid"
       [loading]="state.loading()"
       (cancel)="askCancel()">
     </billy-save-bar>
   </form>
   ```

   - `disabled` = form validity; `loading` = request in flight (the label switches
     to `labelSaveLoading`). Do not conflate the two: `loading` does not imply
     `disabled`.
   - Cancel is **always present** and navigates back without confirmation when the
     form is pristine.

2. **Dialog or side-panel footer** (vente-paiements, compte-password,
   fichiers-manager): the same component with `class="no-theme"` — it drops its
   sticky/frosted background and blends into the container's footer.

3. **Inside an already-white panel** (form embedded in a card, a consult-card, a
   panel section): the same component with `variant="embedded"` — transparent and
   compact, no sticky, so no card stacked on a card.

Placement rules:

- **Never a save-bar on a consult view**: the actions of a read-only screen go in the
  [header-action-bar](display/header-action-bar.md) (§1).
- A lone "Save" button outside the save-bar is forbidden in a form — the save-bar
  carries the submit semantics (beware of double triggering: its button is
  `type="submit"`, so do not wire both `(save)` **and** `(ngSubmit)` to the same action).
- Color variants of the main button (`classSave`: `sb-btn--info`,
  `sb-btn--warning`): reserved for send/at-risk actions (Peppol sending), not for
  restyling a plain save.
- In a **form-side-panel** or an overlay form, the same rule as in dialogs applies:
  save-bar in the footer, `no-theme` when the container already provides its own footer.

## 5. Decision recap

| Need | Component | Where |
|---|---|---|
| Page-level action (add, send, delete) | `HeaderAction` → header-action-bar | Inside `billy-page-header` |
| Add from an empty list | `billy-empty-state` CTA | List body (relay of the header) |
| Add/import tile on the home screen | `billy-add-button` / `billy-upload-button` | home-actions only |
| Read-only information block | `billy-consult-card` (+ `[card-actions]` slot) | Consult pages/dialogs |
| Form sections | `billy-cards` mixins | Forms |
| Concluding a full-page form | sticky `billy-save-bar` | Last child of the `<form>` |
| Concluding a dialog/panel | `billy-save-bar.no-theme` | Container footer |
| Concluding a form inside a white panel | `billy-save-bar variant="embedded"` | Last child of the panel |
| List filters | `*-filter-bar` (building blocks: filter-toggle-buttons, dropdown) | First block of `.data-list` |
| Empty list vs empty search | `billy-empty-state` concept type vs `search` | `.data-list-content` |
