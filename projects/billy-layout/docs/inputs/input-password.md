# billy-input-password — InputPasswordComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/input-password/` · standalone component (ControlValueAccessor)

## Rôle

Champ mot de passe du design system : icône cadenas, bouton œil afficher/masquer, label optionnel intégré, et — en option — une jauge de robustesse animée avec liste de critères (`checkStrength`) ou un indicateur de correspondance en direct (`compareTo`, pour un champ de confirmation). La jauge est **purement indicative** : la validité reste portée par les validators du formulaire parent.

Utilisé dans `src/app` par le changement de mot de passe : `src/app/auth/pages/compte/compte-password/compte-password.component.html` (trois instances : ancien mot de passe, nouveau avec jauge, confirmation avec comparaison).

## API

**Sélecteur & import**

```ts
import { InputPasswordComponent, PasswordCriterion } from 'billy-layout';
```

**Inputs** (API signals — `input()`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `''` | Label affiché au-dessus du champ (`<label for>` relié à l'input via un id auto `billy-password-N`). |
| `mandatory` | `boolean` | `false` | Ajoute l'astérisque accent au label. |
| `placeholder` | `string` | `'••••••••'` | Placeholder. |
| `autocomplete` | `string` | `'new-password'` | Valeur de l'attribut `autocomplete` (`current-password` pour un champ existant). |
| `checkStrength` | `boolean` | `false` | Affiche la jauge de robustesse + la liste des 5 critères sous le champ. |
| `compareTo` | `string \| null` | `null` | Valeur à égaler (champ de confirmation) : affiche l'indicateur de correspondance dès que le champ n'est pas vide. |
| `invalid` | `boolean` | `false` | État invalide piloté par le parent (classe `is-invalid` → mixin `billy-input-invalid`). |

**Outputs** — aucun : la valeur passe par le CVA.

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `toggleShow()` | Bascule l'affichage en clair (`type="text"` ↔ `type="password"`). |

Computed exposés : `criteria` (`PasswordCriterion[]` : 8 caractères min, minuscule, majuscule, chiffre, caractère spécial), `strength` (`{ level: 0–4, label: ''/Faible/Moyen/Bon/Excellent, tone }` selon le nombre de critères remplis), `matches` (égalité stricte avec `compareTo`), `panelOpen` (panneau déplié au focus, maintenu tant que le champ n'est pas vide).

## ControlValueAccessor

- **Type de la valeur modèle** : `string` (jamais transformée). `writeValue(null)` devient `''`.
- Pas de `NG_VALIDATORS` : la jauge et les critères sont indicatifs ; l'invalidité visuelle passe par l'input `invalid`.
- `setDisabledState()` : signal `disabled` → attribut `disabled` de l'input (le bouton œil reste cliquable).

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/compte/compte-password/compte-password.component.html` :

```html
<billy-input-password class="cp-field"
  formControlName="newPassword"
  label="Nouveau mot de passe"
  autocomplete="new-password"
  [checkStrength]="true"
  [mandatory]="true" />

<billy-input-password class="cp-field"
  formControlName="newPasswordRetype"
  label="Confirmer le nouveau mot de passe"
  autocomplete="new-password"
  [compareTo]="newPasswordValue()"
  [mandatory]="true" />
```

## Styles & theming

- Champ basé sur les mixins `billy-forms` : `@include forms.billy-input`, `billy-input-invalid`, `billy-focus` (bouton œil). Tokens : `--billy-input-*`, `--billy-text-soft/-muted`, `--billy-accent(-strong)`, `--billy-divider`, `--billy-section-bg/-border`, `--billy-addon-hover-bg`, `--billy-focus-ring`.
- Accents sémantiques de la jauge définis localement (ils n'existent pas dans la charte) : `--ip-ok` `#059669`, `--ip-warn` `#d97706`, `--ip-bad` `#dc2626` — éclaircis en dark mode.
- **Dark mode sans `:host-context`** : le composant vit aussi dans des dialogues déplacés sous `<body>` ; la surcharge passe par `::ng-deep body.dark-mode .ip-root` (+ tokens).
- Panneau de robustesse déplié/replié par `grid-template-rows: 0fr → 1fr` (animation de hauteur sans JS) ; 4 segments de jauge avec `transition-delay` en cascade ; coche des critères dessinée en `stroke-dashoffset`.
- Autofill WebKit neutralisé (`-webkit-box-shadow` inset couleur du fond). `prefers-reduced-motion` respecté.

## Pièges & notes

- `compareTo` attend une **valeur**, pas un contrôle : le parent doit exposer la valeur du premier champ (ex. signal `newPasswordValue()`). L'indicateur n'apparaît que si `compareTo !== null` **et** que le champ courant n'est pas vide.
- La jauge n'invalide rien : pour bloquer la soumission, poser des validators sur le `FormControl` (c'est ce que fait `compte-password`) et relayer l'état via `[invalid]`.
- Le bouton œil a `aria-pressed` et des `aria-label` francisés ; la jauge et l'indicateur de correspondance sont en `role="status"` (annonce aux lecteurs d'écran).
- **Zoneless** : état interne en signals (`value`, `show`, `focused`, `disabled`) et dérivations en `computed` — rien à faire côté consommateur.
- L'id auto-incrémenté (`billy-password-N`, compteur module) garantit l'unicité label/input pour plusieurs instances sur la même page.
