# billy-label-clipboard — LabelClipboardComponent

> Catégorie `forms` · source `projects/billy-layout/src/lib/forms/form-creation/label-clipboard/` · standalone component

## Rôle

Libellé « copiable » : affiche un texte précédé d'une icône presse-papier ; au clic, copie une valeur dans le presse-papier (`navigator.clipboard`) et affiche pendant 2 secondes une confirmation (icône cochée + mention « (copié dans le presse papier) »). Par défaut c'est le libellé lui-même qui est copié, mais `value` permet de copier une valeur différente de ce qui est affiché. À ce jour, **aucun usage direct dans `src/app`** (vérifié par grep sur `billy-label-clipboard`) : le composant est exporté par la librairie et fait partie du bundle `FormCreationModule` importé par `src/app/shared/components/tache-list-signalform/` (import vestigial, sélecteur absent du template).

## API

### Sélecteur & import

```ts
import { LabelClipboardComponent } from 'billy-layout';
```

Sélecteur : `<billy-label-clipboard>`. Également exporté via le tableau legacy `FormCreationModule` (barrel `lib/forms/form-creation/index.ts`).

### Inputs (API signals)

| Input | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — (`input.required`) | Texte affiché ; c'est aussi la valeur copiée si `value` est absent. |
| `value` | `string \| null` | `null` | Valeur copiée dans le presse-papier à la place du libellé (ex. afficher « IBAN » et copier le numéro). |

Pas d'output.

### Méthodes publiques

| Méthode | Description |
|---|---|
| `askCopy(event: MouseEvent)` | Handler de clic : `stopPropagation()`, copie `value ?? label` via `navigator.clipboard.writeText`, passe le signal interne `copied` à `true` puis le réarme après 2 s. Public mais destiné au template. |

## Slots / projection

Aucun — tout passe par les inputs.

## Exemple d'utilisation

Pas d'usage actuel dans `src/app` ; usage type :

```html
<!-- copie le libellé lui-même -->
<billy-label-clipboard [label]="client.email" />

<!-- affiche un texte court, copie la valeur complète -->
<billy-label-clipboard label="IBAN" [value]="compte.iban" />
```

## Styles & theming

- `:host { cursor: pointer }` ; icône `fa-clipboard` estompée (`opacity: 0.3`) au repos, `fa-clipboard-check` après copie.
- Survol : le texte passe à `#5d9cec` (bleu codé en dur, pas de token `--billy-*` — pas d'adaptation dark mode spécifique, mais le bleu reste lisible sur fond sombre).
- La mention « (copié…) » est en `position: absolute` (largeur 200px, italique) à droite du libellé : elle ne pousse pas la mise en page mais peut déborder d'un conteneur étroit ou `overflow: hidden`.

## Pièges & notes

- `event.stopPropagation()` dans `askCopy` : le clic ne remonte pas — attendu quand le libellé vit dans une ligne cliquable (row de tableau), à connaître si on veut aussi réagir au clic parent.
- `navigator.clipboard.writeText` exige un contexte sécurisé (HTTPS ou localhost) ; la promesse n'est pas attendue ni son échec géré — la confirmation s'affiche même si la copie a échoué.
- Le `setTimeout` de 2 s n'est pas annulé si le composant est détruit entre-temps (écriture d'un signal sur composant détruit : sans effet, mais timer orphelin).
- Le survol cible `i.copy-label` alors que l'icône porte la classe `copy-icon` : l'effet d'opacité au survol de l'icône est inopérant (seule la couleur du texte change).
- Composant orphelin côté app au 2026-07-17 (exporté, mais aucun sélecteur dans `src/app`).
