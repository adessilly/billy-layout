# billy-save-bar — SaveBarComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/save-bar/` · standalone component

## Rôle

Barre d'actions de formulaire, collante en bas d'écran (`position: sticky`) : bouton « Sauvegarder » (avec état chargement) à droite, bouton « Retour »/annuler fantôme, et une zone libre à gauche pour des actions supplémentaires. C'est la conclusion standard de tous les formulaires de l'app : `src/app/auth/pages/achat/achat-form/achat-form.component.html`, `src/app/auth/pages/vente/vente-form/vente-form.component.html`, `src/app/auth/pages/devis/devis-form/devis-form.component.html`, `src/app/auth/pages/compte/compte.component.html`… Elle sert aussi de footer de dialogue via la classe `no-theme` (vente-paiements, compte-password, fichiers-email).

## API

### Sélecteur & import

```ts
import { SaveBarComponent } from 'billy-layout';
```

Sélecteur : `<billy-save-bar>`.

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Désactive le bouton sauvegarder (typiquement `!formGroup.valid`). |
| `loading` | `boolean` | `false` | Remplace icône + libellé du bouton sauvegarder par un spinner et `labelSaveLoading`. N'empêche pas le clic : combiner avec `disabled` si besoin. |
| `labelSave` | `string` | `'Sauvegarder'` | Libellé du bouton principal. |
| `iconSave` | `string` | `'fa-solid fa-floppy-disk'` | Icône du bouton principal ; chaîne vide pour ne pas en afficher. |
| `classSave` | `string` | `'sb-btn--info'` | Variante de couleur du bouton principal, ajoutée à sa liste de classes. Variantes fournies : `sb-btn--info` (bleu) et `sb-btn--warning` (orange) — les seules utilisées par les consommateurs. |
| `labelSaveLoading` | `string` | `'Sauvegarde...'` | Libellé affiché pendant `loading`. |
| `labelCancel` | `string` | `'Retour'` | Libellé du bouton annuler. |
| `iconCancel` | `string` | `'fa-solid fa-chevron-left'` | Icône du bouton annuler ; chaîne vide pour ne pas en afficher. |
| `cancelVisible` | `boolean` | `true` | Affiche/masque le bouton annuler. |
| `saveVisible` | `boolean` | `true` | Affiche/masque le bouton sauvegarder. |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `save` | `void` | Clic sur le bouton sauvegarder. |
| `cancel` | `void` | Clic sur le bouton annuler/retour. |

### Méthodes publiques

`askSave()` / `askCancel()` : relais d'émission des outputs (destinés au template).

## Slots / projection

`<ng-content>` unique, rendu dans `.left-zone` (flex, gap 10px) : actions secondaires à gauche des boutons (ex. bouton « Envoyer la facture », suppression…). Les boutons annuler/sauvegarder occupent `.right-zone`, poussée à droite par `margin-left: auto`.

## Exemple d'utilisation

Usage réel dans `src/app/auth/pages/achat/achat-form/achat-form.component.html` :

```html
<billy-save-bar
  [disabled]="!formGroup.valid"
  [loading]="achatState.loading()"
  (cancel)="askCancel()">
</billy-save-bar>
```

En footer de dialogue, sans chrome de carte, dans `src/app/auth/pages/vente/vente-paiements/vente-paiements.component.html` :

```html
<billy-dialog-form-footer>
  <billy-save-bar class="no-theme" [loading]="loading()" (save)="askSave()" (cancel)="askCancel()" />
</billy-dialog-form-footer>
```

## Styles & theming

- Hôte sticky `bottom: 0`, `z-index: 1001`, habillé comme les cartes du DS (mixin `billy-card` en langage) : `--billy-surface`, bord `--billy-surface-border`, coins 16px, `--billy-card-shadow` + halo vers le haut pour « flotter » au-dessus du contenu qui défile — dark mode automatique via les tokens.
- Boutons : rayon `--billy-input-radius`, focus `--billy-focus-ring` (reprend le halo du `.btn` Bootstrap disparu) ; annuler fantôme sur `--billy-input-border` / `--billy-text-muted`, survol `--billy-addon-hover-bg` ; variantes `sb-btn--info` (#23b7e5) et `sb-btn--warning` (#ff902b), teintes des ex-`.btn-info`/`.btn-warning` du thème, codées en dur.
- `min-width: 128px` posé sur le sélecteur d'élément `button` (spécificité faible, volontaire) pour que les overrides consommateurs puissent élargir un bouton.
- **Classe `no-theme` sur l'hôte** : retire bord, fond, ombre, padding et rayon — la barre devient un simple rang de boutons pour vivre dans un footer de dialogue.
- Mobile (≤767px) : barre givrée pleine largeur (fond `color-mix` translucide + `backdrop-filter: blur`), `safe-area-inset-bottom`, boutons en `flex: 1`.

## Pièges & notes

- Le bouton sauvegarder est `type="submit"` : placé dans un `<form>`, un clic déclenche **à la fois** l'output `save` et le `(ngSubmit)` du formulaire — brancher l'un ou l'autre, pas les deux.
- `loading` ne désactive pas le bouton : passer aussi `[disabled]` pendant la sauvegarde pour éviter le double envoi.
- `z-index: 1001` : sous les side-panels (1050/1051) et les dialogues — c'est voulu, l'overlay de `billy-form-side-panel` couvre la barre.
- Pour un footer de panneau latéral étroit, la save-bar ne rentre pas (chrome de carte + `min-width` 128px/bouton) : utiliser les mixins « boutons de footer de panneau » de `_billy-forms.scss` (cf. agenda, prestations).
- `iconSave`/`iconCancel` sont injectés via `[class]` : toute liste de classes Font Awesome est acceptée.
