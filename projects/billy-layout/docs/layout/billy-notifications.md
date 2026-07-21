# billy-notifications — BillyNotificationsComponent

> Category `layout` · source `projects/billy-layout/src/lib/layout/shell/notifications/` · standalone component (+ abstract base `BillyNotifCategory`, building blocks `billy-notif-item/-empty/-action`)

## Role

Unified notification bell of the topbar: a button with a total badge and a two-level dropdown panel — level 1 the list of categories, level 2 the item list of one category (with a back button). Each category is an autonomous component provided by the application as projected content (it loads its data, exposes its counter, displays its own list); the panel only manages the bell, navigation between levels and the global synchronization, delegated to `BILLY_SHELL_CONFIG.syncNotifications`. In billy-client, the bell is projected into the shell's `[shell-notifications]` slot (`src/app/auth/pages/auth-page.component.html`) with three categories: incoming Peppol purchases, Peppol sendings, unpaid sales (`src/app/layout/notifications/`).

## API

### BillyNotificationsComponent

```ts
import { BillyNotificationsComponent } from 'billy-layout';
```

Selector: `billy-notifications`. No input or output.

| Member | Type | Description |
|---|---|---|
| `categories` | `contentChildren(BillyNotifCategory)` | The projected categories, in display order. |
| `open` | `signal<boolean>` | Panel open. |
| `categoryId` | `signal<BillyNotifCategoryId \| null>` | Open category (`null` = categories level). |
| `syncLoading` | `signal<boolean>` | Global synchronization in progress. |
| `totalCount` | `computed<number>` | Sum of the `count()`s — bell badge. |
| `activeCategory` | `computed<BillyNotifCategory \| null>` | Instance of the open category. |
| `toggle()` / `close()` / `openCategory(id)` / `back()` | | Panel navigation. |
| `syncAll()` | `Promise<void>` | `config.syncNotifications()` then `refresh()` of each category (guarded by `syncLoading`). |

Closing: document click outside the host (`@HostListener('document:click')`) and the Escape key. Consumed tokens: `BILLY_SHELL_CONFIG` (`{ optional: true }`, for `syncNotifications`).

The panel's built-in strings come from the i18n dictionary: bell tooltip/header title `topbar.notifications` (EN "Notifications"), back button `notifications.back` (EN "Back"), "Sync now" action `notifications.syncNow`, empty-category copy `notifications.emptyTitle` / `.emptySubtitle`. Built-in strings are localizable — see [i18n](../core/i18n.md).

**Wiring of the projected content**: the parent cannot template-bind components projected by the application. An `effect` in the constructor therefore pushes the state into each category's signals (`activeCategory.set(...)`, `syncing.set(...)`) and subscribes **imperatively, only once** (`wired` WeakSet) to its outputs: `syncRequested.subscribe(() => this.syncAll())`, `navigated.subscribe(() => this.close())`.

### BillyNotifCategory (`billy-notif-category.ts`)

```ts
import { BillyNotifCategory, BillyNotifCategoryId, provideBillyNotifCategory } from 'billy-layout';
```

Abstract `@Directive()` — common base of the categories. `BillyNotifCategoryId = 'incoming' | 'outgoing' | 'unpaid'`.

| Member | Nature | Description |
|---|---|---|
| `id` | abstract | Unique identifier (navigation between levels). |
| `label`, `sub`, `icon`, `iconBg`, `iconColor` | abstract | Metadata of the category row (level 1) and of the header. |
| `count` | abstract, `Signal<number>` | Number of items to handle (bell badge + counters). |
| `activeCategory` | `signal<BillyNotifCategoryId \| null>` | **Written by the parent panel** (effect), not an input. |
| `syncing` | `signal<boolean>` | **Written by the parent panel**; animates the sync icons. |
| `syncRequested` | `output<void>` | Global sync request (subscribed imperatively by the panel). |
| `navigated` | `output<void>` | An item opened its business screen → the panel closes. |
| `active` | `computed<boolean>` | `activeCategory() === this.id` — gate of the category's template. |
| `refresh()` | abstract | Reloads the data (called after a global sync). |
| `locale` | `protected` | `inject(LOCALE_ID)`. |
| `clientName(holder)` | `protected` | "Lastname Firstname" helper from `{ client?: { nom, prenom } }`. |

`provideBillyNotifCategory(() => MyComponent)`: `{ provide: BillyNotifCategory, useExisting: forwardRef(...) }` provider to declare in the category component's `providers` so the panel finds it via `contentChildren(BillyNotifCategory)`.

### Display building blocks

**billy-notif-item — BillyNotifItemComponent**: generic list row (initial avatar, title, subtitle, right column with amount + status). The click is handled on the host element, by the caller.

| Input | Type | Default | Description |
|---|---|---|---|
| `accentBg` | `string` | required | Avatar background. |
| `accentColor` | `string` | required | Avatar color (and default status color). |
| `initialSource` | `string \| number \| null \| undefined` | `null` | Text whose first letter (uppercased) is used as the initial; `?` otherwise. |
| `title` | `string` | required | Title (ellipsized). |
| `sub` | `string` | `''` | Subtitle. |
| `amount` | `string \| null` | `null` | Amount (already formatted). |
| `status` | `string` | `''` | Status label. |
| `statusColor` | `string \| null` | `null` | Status color; defaults to `accentColor`. |

**billy-notif-empty — BillyNotifEmptyComponent**: empty state (no input); its copy comes from the i18n dictionary (`notifications.emptyTitle` / `.emptySubtitle`, EN "Nothing to handle here" / "Everything is up to date in this category.").

**billy-notif-action — BillyNotifActionComponent**: panel footer action (icon + projected label). Inputs: `icon: BillyIconName` (required), `spinning: boolean` (default `false`, 1s icon rotation). Click on the host, by the caller. Used by the panel itself for "Sync now".

## Slots / projection

- `billy-notifications` projects all of its content (`<ng-content />`) **inside the panel**, below the levels: categories stay instantiated permanently — they load their data and feed the counters even with the panel closed — and each one only shows its list when `active()` is true.
- `billy-notif-action` projects its label after the icon.

## Usage example — creating a new category

1. **Create a component that extends `BillyNotifCategory`** and declares the provider (real example: `src/app/layout/notifications/billy-notif-achats-peppol.component.ts`):

```ts
@Component({
  selector: 'app-billy-notif-achats-peppol',
  templateUrl: './billy-notif-achats-peppol.component.html',
  styleUrls: ['./billy-notif-category.scss'],
  imports: [CurrencyPipe, BillyNotifItemComponent, BillyNotifEmptyComponent, BillyNotifActionComponent],
  providers: [provideBillyNotifCategory(() => BillyNotifAchatsPeppolComponent)],
})
export class BillyNotifAchatsPeppolComponent extends BillyNotifCategory implements OnInit {

  readonly id = 'incoming' as const;
  readonly label = 'Incoming Peppol';
  readonly sub = 'Purchases to receive';
  readonly icon = 'purchases' as const;
  readonly iconBg = '#E6F7FC';
  readonly iconColor = '#0E97BB';

  readonly achats = computed<Achat[]>(() => this.achatService.achatsPeppolUnread.data() ?? []);
  readonly count = computed(() => this.achats().length);

  ngOnInit(): void { lastValueFrom(this.achatService.listPeppolUnread()); }

  async refresh(): Promise<void> { await lastValueFrom(this.achatService.listPeppolUnread()); /* … */ }

  openAchat(achat: Achat): void {
    this.navigated.emit();                       // closes the panel
    this.routeurUtils.toAchatFormEdit(achat.id!);
  }
}
```

2. **Template gated by `active()`**, using the building blocks (`billy-notif-achats-peppol.component.html`):

```html
@if (active()) {
  <div class="billy-notif-level">
    <div class="billy-notif-items">
      @if (count() === 0) { <billy-notif-empty /> }
      @for (achat of achats(); track achat.id) {
        <billy-notif-item
          [accentBg]="iconBg" [accentColor]="iconColor"
          [initialSource]="clientName(achat) || achat.libelle"
          [title]="achat.libelle" [sub]="subOf(achat)"
          [amount]="achat.prix | currency:'EUR'" status="To handle"
          (click)="openAchat(achat)" />
      }
    </div>
    <div class="billy-notif-footer">
      <billy-notif-action icon="sync" [spinning]="syncing()" (click)="syncRequested.emit()">
        Sync
      </billy-notif-action>
    </div>
  </div>
}
```

3. **Project it into the bell** (`src/app/auth/pages/auth-page.component.html`):

```html
<billy-notifications shell-notifications>
  <app-billy-notif-achats-peppol />
  <app-billy-notif-envois-peppol />
  <app-billy-notif-ventes-impayees />
</billy-notifications>
```

## Styles & theming

- Bell host: `<li class="billy-notifications">` — designed for the topbar's `<ul>` row.
- Bell 38×38: hover `#EAEFF3`, open `#E6F7FC`/`#0E97BB`; red badge `#EF4444` outlined with the page background. "Chime" animation (`billyBellRing`, 6s loop) when `totalCount() > 0` and the panel is closed — disabled by `prefers-reduced-motion`.
- Panel: 300px anchored to the right (`top: calc(100% + 14px)`), white background, 16px radius, scale/fade appearance (`transform-origin: top right`), `z-index: 30`. Mobile (< 767.98px): `position: fixed; top: 62px; left/right: 12px` (full width).
- Levels: `.billy-notif-level` with a `billyNotifIn` slide-in entrance; accent `#0E97BB`/`#E6F7FC` for counters and header badges.
- Dark mode via `:host-context(body.dark-mode)` (panel `#172224`, borders `#49545a`, hovers `#223034`); the inline colored badges (`iconBg`/`iconColor`, avatars) are darkened by `filter: saturate(.85) brightness(.92)`.
- The `.billy-notif-level` / `.billy-notif-footer` classes are reusable by category templates; billy-client adds its own shared rules in `src/app/layout/notifications/billy-notif-category.scss` (`.billy-notif-items`, etc.).

## Pitfalls & notes

- The category's `activeCategory` and `syncing` are **signals written by the parent**, not inputs: never set them yourself inside the category; just read `active()` and `syncing()`.
- Forgetting `provideBillyNotifCategory(...)` in the component's `providers` makes the category invisible to `contentChildren`: no row at level 1, no counting. (The helper's comment mentions `viewChildren`; the panel actually uses `contentChildren`.)
- `BillyNotifCategoryId` is a closed union (`'incoming' | 'outgoing' | 'unpaid'`): adding a 4th category requires extending this type in the library.
- Categories live while the panel is closed: load the data in `ngOnInit` (not on opening) so the bell badge is correct from the start.
- The document click handler ignores targets detached from the DOM (`!target.isConnected`): a click that triggers a panel re-render (level change) is not mistaken for an outside click.
- `syncAll()` awaits `config.syncNotifications()` **then** the `refresh()`es sequentially; without `BILLY_SHELL_CONFIG`, only the `refresh()` part runs.
- Outputs are subscribed once per instance (WeakSet) — emitting `navigated` / `syncRequested` from the category is always safe.
