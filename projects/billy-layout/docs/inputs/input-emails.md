# billy-input-emails — InputEmailsComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/input-emails/` · standalone component (ControlValueAccessor + Validator)

## Rôle

Champ multi-emails « à tags » : chaque adresse saisie devient un tag supprimable (`billy-input-email-tag`), avec autocomplétion par popup (`billy-input-emails-popup-suggestion`) dès 2 caractères tapés. Le tout se comporte comme un seul contrôle de formulaire dont la valeur est la liste jointe en chaîne. Il valide aussi le contrôle (`NG_VALIDATORS`) : une adresse mal formée rend le contrôle invalide et le tag passe en rouge.

Utilisé dans `src/app` par le panneau d'envoi d'emails : `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html` (champ « Destinataire(s) »).

## API

**Sélecteur & import**

```ts
import { InputEmailsComponent } from 'billy-layout';
```

**Inputs** (API signals — `input()`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `placeholder` | `string` | `'Entrez des emails'` | Affiché seulement quand aucun tag n'existe. |
| `availableEmails` | `string[]` | `[]` | **Liste des adresses proposées en autocomplétion, fournie par le consommateur.** Le composant a été découplé de `ClientService` lors de l'extraction en librairie : c'est au parent de passer la source (ex. `email-form-panel` passe `ClientService.emails`). |

**Outputs** — aucun output propre : tout passe par le CVA.

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `addEmail(email)` / `removeEmail(index)` | Ajout (dédoublonné) / suppression d'un tag, avec propagation au formulaire. |
| `focusInput()` | Redonne le focus au champ texte (appelé au clic sur la boîte). |
| `isValidEmail(email)` | Test par la regex interne (utilisée pour marquer les tags invalides). |
| `validate(control)` | Implémentation `Validator` (voir ci-dessous). |

**Sous-composants**

- `billy-input-email-tag` (`InputEmailTagComponent`) — un tag : inputs `email` (required), `invalid`, `disabled` ; output `remove`.
- `billy-input-emails-popup-suggestion` (`InputEmailsPopupSuggestionComponent`) — la popup : inputs `inputValue` (required), `availableEmails` (required), `excludedEmails`, `show` ; output `suggestionSelected`. Filtre insensible à la casse, exclut les adresses déjà taguées, limite à 10 suggestions.

## ControlValueAccessor

- **Type de la valeur modèle** : `string | null` — les adresses jointes par `', '` (ex. `"a@b.be, c@d.be"`), ou `null` quand la liste est vide.
- `writeValue()` accepte une chaîne séparée par virgules **ou** points-virgules, la découpe et nettoie les espaces.
- **NG_VALIDATORS** : le composant s'enregistre aussi comme `Validator`. Liste vide → valide (le `required` reste l'affaire du parent). Si au moins une adresse ne passe pas la regex, il retourne `{ invalidEmails: { value, invalidEmails: [...] } }`.
- `setDisabledState()` : désactive l'input et les boutons de suppression des tags (propriété `disabled`, non signal).

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/email-dialog/email-form/email-form-panel/email-form-panel.component.html` :

```html
<billy-input-line label="Destinataire(s)" [mandatory]="true">
  <billy-input-emails formControlName="to" [availableEmails]="availableEmails()"></billy-input-emails>
</billy-input-line>
```

Côté TS (`email-form-panel.component.ts`) — la source d'autocomplétion vient du consommateur :

```ts
// Autocomplétion des destinataires : billy-input-emails (billy-layout) est
// découplé de ClientService, la liste se passe par input.
private clientSharedService = inject(ClientService);
readonly availableEmails = this.clientSharedService.emails;
```

## Styles & theming

- La boîte `.email-tags-container` est l'ex-`.form-control` Bootstrap réécrit maison : c'est une `div` qui se fait passer pour un champ (les tags vivent dedans, `cursor: text`, clic → focus de l'input). Peau via les tokens `--billy-input-bg/-border/-radius/-color/-placeholder` et `@include forms.billy-focus` sur `:focus-within` (mixin `billy-forms`) ; hauteur min `forms.$field-height`. Dark mode automatique via les tokens.
- Tags : couleurs en dur (bleu-gris `#cedbe2` ; invalide rouge `#f8d7da`/`#721c24`) avec surcharge `:host-context(.dark-mode)`.
- Popup : positionnée en `absolute` sous le wrapper (`.email-input-wrapper { position: relative }`), `z-index: 1000`, max 200 px scrollable, couleurs en dur + variante `.dark-mode` — pas encore alignée sur les tokens `--billy-*`.

## Pièges & notes

- **`availableEmails` est un input obligatoire en pratique** : sans lui, aucune suggestion n'apparaît. Ne pas réintroduire d'injection de service applicatif dans la lib.
- **Création d'un tag** : `Espace`, `,`, `;` ou `Entrée` valident la saisie courante ; `Backspace` sur input vide retire le dernier tag ; le **collage** est intercepté (`paste`) et découpé sur `[,;\s]+` — coller une liste complète crée tous les tags d'un coup ; le **blur** ajoute l'email restant.
- **Coordination popup/champ sur `Entrée`** : la popup écoute `window:keydown` (`@HostListener`) et fait `preventDefault()` quand une suggestion est surlignée ; le champ vérifie `event.defaultPrevented` dans un `setTimeout(0)` pour ne pas créer un tag en double. De même le blur est temporisé (200 ms) pour laisser passer le clic sur une suggestion — ne pas retirer ces différés.
- La popup capte flèches/`Escape` au niveau `window` **uniquement** quand elle est visible avec des résultats ; `Escape` réinitialise la surbrillance (il ne ferme pas la popup, qui se ferme quand la saisie repasse sous 2 caractères ou au blur).
- **Zoneless** : état en signals (`emails`, `inputValue`, `showSuggestions`, `selectedIndex`), popup filtrée en `computed`, reset de la surbrillance via `effect`. La validation des adresses est une simple regex — moins stricte que `EmailUtils` de la famille code-field.
- Les doublons sont ignorés silencieusement (`addEmail` teste `includes`).
