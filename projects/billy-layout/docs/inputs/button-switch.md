# billy-button-switch — ButtonSwitchComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/button-switch/` · standalone component (ControlValueAccessor)

## Rôle

Interrupteur « maison » BILLy — bascule gauche/droite façon iOS, qui remplace l'ancien `ad-button-switch` (thème « switch ») de ad-library. C'est un simple `<button role="switch">` accessible (clavier Espace/Entrée, `aria-checked`), aligné sur la charte des formulaires, avec libellé et icône d'état optionnels.

Utilisé dans `src/app` : `vente-form` (note de crédit), `client-form` (exonération TVA), `agenda-recurrence-form`, `peppol-facture-summary`.

## API

**Sélecteur & import**

```ts
import { ButtonSwitchComponent } from 'billy-layout';
```

**Inputs** (API signals — `input()`)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `labelOn` | `string` | `''` | Libellé affiché à droite quand l'état est actif (optionnel). |
| `labelOff` | `string` | `''` | Libellé affiché quand l'état est inactif (optionnel). |
| `iconOn` | `string` | `''` | Classe d'icône (fonte, ex. Font Awesome) affichée dans le curseur à l'état actif. |
| `iconOff` | `string` | `''` | Classe d'icône affichée dans le curseur à l'état inactif. |
| `disabled` | `boolean` (`booleanAttribute`) | `false` | Désactivation statique, cumulée avec celle du formulaire. |

**Outputs**

| Output | Type | Description |
|---|---|---|
| `valueChange` | `boolean` | Émis à chaque bascule (en plus de la propagation CVA). |

**Méthodes publiques**

| Méthode | Description |
|---|---|
| `toggle()` | Bascule l'état (no-op si désactivé) : met à jour le modèle, appelle `onTouched` et émet `valueChange`. |

Computed exposés : `checked`, `isDisabled`, `currentLabel`, `currentIcon`.

## ControlValueAccessor

- **Type de la valeur modèle** : `boolean`. `writeValue()` coerce n'importe quoi en booléen (`!!v`) — un `null`/`undefined` devient `false`.
- Compatible `[ngModel]`, `[(ngModel)]`, `formControlName` **et** la directive signal-forms `[formField]`.
- Pas de `NG_VALIDATORS`.
- `setDisabledState()` : cumulé avec l'input `disabled` (`isDisabled = disabled() || disabledFromForm()`), le bouton reçoit `disabled` + `aria-disabled`.

## Exemple d'utilisation

Extraits réels de `src/app` :

```html
<!-- vente-form.component.html (formulaire réactif) -->
<div class="vf-switch-box">
  <billy-button-switch id="switchNoteCredit" formControlName="noteCredit"></billy-button-switch>
  <span class="vf-switch-text">Document rectificatif</span>
</div>

<!-- client-form.component.html (signal-forms) -->
<billy-button-switch [formField]="formClient.exitTva" id="switchExitTva"></billy-button-switch>
```

## Styles & theming

- Variables locales sur `:host` : `--bsw-track-off` (`#d1d5db`), `--bsw-track-on` (= `--billy-accent`), `--bsw-thumb` (`#fff`) ; rail 46×26 px, curseur 20 px.
- Dark mode via `:host-context(body.dark-mode)` : rail inactif `#49545a`, curseur `#e8eaed`.
- Libellé d'état en `--billy-input-color`, passant à `--billy-accent-strong` à l'état actif ; l'icône du curseur est teintée `--bsw-track-on`.
- Micro-interactions : « étirement » du curseur façon iOS pendant l'appui (`:active` élargit le thumb à 24 px), anneau `--billy-focus-ring` sur `:focus-visible` (porté par le rail, pas d'outline navigateur), transitions spring sur `transform`.
- Désactivé : `opacity: 0.55` + `cursor: not-allowed`.

## Pièges & notes

- C'est un `<button type="button">` : il ne soumet pas le formulaire, et le clavier natif (Espace/Entrée) est intercepté par `onKeydown` avec `preventDefault`.
- Pas d'input `id` : l'attribut `id` posé sur `<billy-button-switch id="switchExitTva">` reste sur l'élément **hôte**, pas sur le `<button>` interne. Un `<label for>` externe (comme dans `client-form`) cible donc un élément non labellisable : cliquer le label ne bascule pas le switch. Prévoir le libellé via `labelOn`/`labelOff` ou accepter ce comportement.
- `writeValue` ne déclenche ni `valueChange` ni `onChange` (pas de boucle) : `valueChange` ne reflète que les interactions utilisateur.
- **Zoneless** : état interne en signals (`innerValue`, `disabledFromForm`) + `computed` ; aucune dépendance à zone.js.
