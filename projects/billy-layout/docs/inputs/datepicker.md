# billy-datepicker — DatepickerComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/datepicker/` · standalone component (ControlValueAccessor)

## Rôle

Champ date autonome (sans Bootstrap ni dépendance applicative) qui remplace l'ancien `app-input-datepicker` basé sur `bsDatepicker`. Il combine une saisie manuelle `jj/mm/aaaa` et un calendrier (`billy-datepicker-calendar`) ouvert au clic sur le bouton ou avec `ArrowDown`. Sur desktop le calendrier s'affiche en popover ancré en `position: fixed` (il échappe donc aux `overflow` parents) ; sur mobile (≤ 640 px) il devient une bottom-sheet plein écran avec fond assombri et piège à focus.

Utilisé partout où une date est saisie dans `src/app` : `vente-form`, `devis-form`, `achat-form`, `prestations-form`, `vente-paiements-form`, `agenda-evenement-form`, `agenda-recurrence-form`, `agenda-filter-bar`, `recurrence-filter-bar`, etc.

## API

**Sélecteur & import**

```ts
import { DatepickerComponent } from 'billy-layout';
```

```html
<billy-datepicker formControlName="dateEmission"></billy-datepicker>
```

**Inputs** (API signals — `input()`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `invalid` | `boolean` | `false` | État d'erreur piloté par le parent (bordure rouge + `aria-invalid`). |
| `placeholder` | `string` | `'jj/mm/aaaa'` | Placeholder du champ texte. |
| `ariaLabel` | `string` | `'Date'` | `aria-label` de l'input. |
| `locale` | `string` | `'fr-FR'` | Locale transmise au calendrier (libellés `Intl`). |

**Outputs** — aucun output propre : la valeur passe par le CVA.

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `open()` / `close(focusField = false)` / `toggle()` | Ouverture/fermeture programmatique du panneau. |
| `onDatePicked(date: Date)` | Callback du calendrier : fixe la valeur, propage au formulaire, referme et re-focus le champ. |

Signaux exposés en lecture (utilisés par le template) : `value` (`Date | null`), `text` (saisie affichée), `isOpen`, `isMobile`, `isDisabled`, `panelPos`.

## ControlValueAccessor

- **Type de la valeur modèle** : `string | null` au format **`'yyyy-MM-dd'`** (ou `null` si le champ est vide ou la saisie invalide) — même contrat que l'ancien champ bsDatepicker.
- `writeValue()` accepte en entrée une chaîne `'yyyy-MM-dd'` (éventuellement suivie d'une heure, ex. ISO complet) **ou** un objet `Date` ; en interne tout est ramené à une `Date` locale à minuit.
- Saisie manuelle : accepte `jj/mm/aaaa` avec séparateurs `/`, `-` ou `.` ; une année sur 2 chiffres devient `20xx` ; les dates impossibles (31/02) sont refusées → modèle `null`.
- Pas de `NG_VALIDATORS` : le composant ne s'auto-valide pas, l'état d'erreur s'affiche via l'input `invalid` (ex. `[invalid]="!ctrl.dateEmission.valid && ctrl.dateEmission.touched"`).
- `setDisabledState()` : désactive input et bouton, et referme le panneau s'il était ouvert.

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/vente/vente-form/vente-form.component.html` :

```html
<div class="vf-field vf-span-4">
  <label class="vf-label">Date d'émission <span class="vf-req">*</span></label>
  <billy-datepicker
    [invalid]="!ctrl.dateEmission.valid && ctrl.dateEmission.touched"
    formControlName="dateEmission"></billy-datepicker>
</div>
```

## Styles & theming

- Styles inlinés (avec fallbacks) reprenant les règles de la mixin `billy-input` pour rester indépendant de l'application : tokens `--billy-input-bg`, `--billy-input-border`, `--billy-input-radius`, `--billy-input-color`, `--billy-input-placeholder`, `--billy-focus-border`, `--billy-focus-ring`, `--billy-danger`, `--billy-accent(-soft/-strong)`, `--billy-surface(-border/-shadow)`. Dark mode automatique via les tokens.
- Hauteur du champ personnalisable par instance : `--datepicker-height` (défaut 35 px).
- Panneau desktop : `position: fixed`, `z-index: 2000` (au-dessus des side-panels à 1051, sous les toasts à 9000+), repositionné au scroll/resize, bascule vers le haut (`openUp`) quand la place manque sous le champ.
- Mobile ≤ 640 px : backdrop `rgba(17,24,39,.45)`, feuille ancrée en bas avec poignée visuelle, coins arrondis 20 px, `padding-bottom: env(safe-area-inset-bottom)`, animation d'entrée `translateY(100%)`.
- `prefers-reduced-motion` : transitions et animations désactivées.

## Pièges & notes

- **Zoneless** : tout l'état est en signals ; les listeners globaux (`document click`, `scroll`, `resize`) sont posés/retirés à la main et nettoyés via `DestroyRef.onDestroy`.
- **Clavier** : `ArrowDown` sur le champ ouvre le calendrier, `Escape` referme (avec re-focus du champ). Dans le panneau desktop, `Tab` referme et rend le focus au champ ; en mode bottom-sheet, `Tab` est piégé dans la feuille (focus trap sur les `button` non désactivés).
- Le blur du champ reformate le texte (`text`) vers `jj/mm/aaaa` si la valeur est valide, mais ne vide pas une saisie partielle invalide — le modèle est `null` dans ce cas.
- Le popover fait 300 px de large / ~380 px de haut max ; la position `left` est bornée pour rester dans le viewport.

---

# billy-datepicker-calendar — DatepickerCalendarComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/datepicker/datepicker-calendar.component.ts` · standalone component (pas de CVA — composant de présentation)

## Rôle

Grille calendrier autonome (aucune dépendance applicative) utilisée par `billy-datepicker`, mais exportée séparément dans l'API publique et donc utilisable seule (ex. calendrier inline). Deux vues : jours et mois, navigation clavier complète (pattern ARIA grid, roving tabindex), libellés générés via `Intl` à partir de l'input `locale`. Semaine commençant le lundi. Dans `src/app`, il n'est consommé qu'indirectement via `billy-datepicker`.

## API

**Sélecteur & import**

```ts
import { DatepickerCalendarComponent } from 'billy-layout';
```

**Inputs**

| Input | Type | Défaut | Description |
|---|---|---|---|
| `selected` | `Date \| null` | `null` | Date sélectionnée (mise en évidence + mois affiché par défaut). |
| `locale` | `string` | `'fr-FR'` | Locale des libellés `Intl` (mois, jours, aria-labels). |
| `autofocusDay` | `boolean` | `false` | Donne le focus au jour actif dès le premier rendu (cas du popup). |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `datePicked` | `Date` | Jour choisi (date locale à minuit, heure retirée). |

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `focusActiveDay()` | Redonne le focus à l'élément porteur du `tabindex="0"` de la vue courante (utilisable par le parent à l'ouverture). |
| `goPrev()` / `goNext()` | Mois précédent/suivant (vue jours) ou année précédente/suivante (vue mois). |
| `toggleView()` / `showDays()` / `pickMonth(m)` | Bascule jours ↔ mois. |
| `pickDay(date)` / `pickToday()` | Émettent `datePicked`. |

## Exemple d'utilisation

Usage réel dans `datepicker.component.html` :

```html
<billy-datepicker-calendar
  [selected]="value()"
  [locale]="locale()"
  [autofocusDay]="true"
  (datePicked)="onDatePicked($event)" />
```

## Styles & theming

- Thème entièrement porté par les tokens `--billy-*` avec fallbacks : `--billy-input-color`, `--billy-text-soft`, `--billy-text-muted`, `--billy-accent`, `--billy-accent-soft`, `--billy-accent-strong`, `--billy-focus-ring`, `--billy-focus-border`, `--billy-surface`, `--billy-divider`. Dark mode automatique, aucune dépendance de style vers l'application.
- Largeur fixe 296 px ; jour « aujourd'hui » repéré par un point accent sous le chiffre ; jour sélectionné en disque accent.
- Responsive ≤ 640 px : grille pleine largeur (max 400 px centrée), cibles tactiles agrandies (jours 42 px, mois 46 px).
- `prefers-reduced-motion` respecté.

## Pièges & notes

- **Navigation clavier (vue jours)** : flèches = ±1 jour / ±7 jours, `Home`/`End` = début/fin de semaine, `PageUp`/`PageDown` = ±1 mois (`Shift` = ±12 mois). La grille suit le pattern ARIA grid avec roving tabindex (un seul jour à `tabindex="0"`).
- **Vue mois** : `role="listbox"`, flèches ±1/±3, `Escape` revient à la vue jours **sans** fermer le datepicker parent (stopPropagation).
- **Zoneless** : le focus après re-rendu passe par `afterRenderEffect` + un signal compteur `focusRequest` — « pas de `setTimeout` fiable » en zoneless. Le titre est annoncé aux lecteurs d'écran via une zone `aria-live="polite"`.
- `weekdays` et `monthNames` sont dérivés d'`Intl.DateTimeFormat` (semaine calée sur le lundi 5 janvier 2026) : changer `locale` traduit tout le calendrier.
