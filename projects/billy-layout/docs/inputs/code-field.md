# Famille « code-field » — CodeFieldBase, InputTvaComponent, InputIbanComponent, InputEmailComponent, TvaDisplayComponent, IbanDisplayComponent, CodeGlyphComponent, CodeStatusComponent, CodeValueComponent

> Catégorie `inputs` · source `projects/billy-layout/src/lib/inputs/code-field/` · standalone components (les champs de saisie sont des ControlValueAccessor)

Famille de composants pour la saisie et la relecture des identifiants normalisés : numéro de TVA intracommunautaire, IBAN, adresse email. Tous partagent le même contrat : **le modèle ne voit que la valeur canonique** (« BE0690614660 »), **le DOM ne montre que la valeur formatée** (« BE 0690.614.660 »). Point d'entrée des exports : `lib/inputs/code-field/index.ts` (ré-exporté par `public-api.ts`).

## Architecture

```
core/utils/                          inputs/code-field/
├── code-format.ts   ← types & découpage   ├── code-field.base.ts   (CodeFieldBase, socle CVA abstrait)
├── tva-utils.ts     ← règles TVA          ├── input-tva/           (billy-input-tva      = base + TvaUtils)
├── iban-utils.ts    ← règles IBAN         ├── input-iban/          (billy-input-iban     = base + IbanUtils)
└── email-utils.ts   ← règles email        ├── input-email/         (billy-input-email    = base + EmailUtils)
                                           ├── tva-display/         (billy-tva-display    = TvaUtils → billy-code-value)
                                           ├── iban-display/        (billy-iban-display   = IbanUtils → billy-code-value)
                                           ├── code-value/          (rendu lecture segments + copie)
                                           ├── code-glyph/          (symbole SVG tva/iban/email)
                                           └── code-status/         (pastille d'état + anneau de progression)
```

- **`code-format.ts`** (voir [../core/code-utils.md](../core/code-utils.md)) définit le vocabulaire commun : `CodeSegment` (`{ text, muted }` — les séparateurs et préfixes pays sont `muted`, donc grisés), `CodeStatus` (`'empty' | 'partial' | 'invalid' | 'unverified' | 'valid'`), `CodeInfo` (status + pays + message + progression 0→1) et les découpeurs `groupBySizes` / `groupByChunks` / `keepAlnum` / `segmentsToText`.
- **`TvaUtils` / `IbanUtils` / `EmailUtils`** portent toute la connaissance métier (règles par pays, clés de contrôle modulo 97, domaines email courants) sous une API identique : `sanitize` (forme canonique), `formatText`/`format` (masque / segments), `normalize` (retouches au blur), `describe` (→ `CodeInfo`).
- **`CodeFieldBase`** (directive abstraite) est le socle CVA : c'est lui qui gère le masquage à la frappe, le repositionnement du curseur, l'effacement au contact d'un séparateur, les états `focused`/`touched` et le nettoyage des valeurs sales venues du backend. Chaque champ concret ne fournit que 3-4 méthodes (`sanitize`, `formatText`, `normalize`, éventuellement `isSignificant`) et un computed `info`.
- Les affichages en lecture (`billy-tva-display`, `billy-iban-display`) ne font que brancher les utils sur la brique de présentation pure `billy-code-value`.

## CodeFieldBase (socle abstrait)

> `@Directive()` abstraite, `implements ControlValueAccessor` — jamais instanciée seule.

### Principe

Un champ masqué : à chaque frappe, la saisie est nettoyée (`sanitize` — les caractères non autorisés n'entrent jamais), reformatée (`formatText`) et le curseur est replacé **en comptant les caractères significatifs** qui le précèdent (pas sa position brute, que les séparateurs décaleraient). La valeur du DOM est pilotée à la main (pas de binding `[value]`) : réécrire l'input à chaque frappe renverrait le curseur à la fin.

### Inputs communs à tous les champs

| Input | Type | Défaut | Description |
|---|---|---|---|
| `inputId` | `string` | `''` | `id` posé sur l'`<input>` interne (pour `<label for>`). À défaut un uid `billy-code-N` est généré. |
| `placeholder` | `string` | `''` | Placeholder (chaque champ a son défaut : « BE 0690.614.660 », etc.). |
| `hint` | `string` | `''` | Texte affiché sous le champ tant que rien n'est saisi (remplace le message d'état `empty`). |
| `forceDisabled` | `boolean` (`booleanAttribute`) | `false` | Désactivation statique, en plus de celle du formulaire. **Volontairement pas nommée `disabled`** : signal-forms réserve ce nom et écrirait par-dessus. |

### Signaux / API dérivée

`value` (canonique), `display` (formaté), `focused`, `touched`, `isDisabled`, `status` (`CodeStatus`), `progress` (0→1), `showError` (erreur **seulement après blur** : pendant la frappe, un numéro incomplet n'est pas une erreur — la pastille, elle, suit la saisie en direct), `message` (le `hint` si vide, sinon le message du diagnostic).

### Contrat des sous-classes

| Méthode abstraite | Rôle |
|---|---|
| `sanitize(raw)` | Forme canonique : tout caractère non autorisé disparaît. |
| `formatText(value)` | Masque : rendu à plat de la valeur canonique. |
| `normalize(value)` | Retouches au blur (préfixe pays, zéro de tête…). |
| `info` (computed) | Diagnostic `CodeInfo` complet. |
| `isSignificant(char)` (surchargable) | Frontière significatif/liant pour le curseur — alphanumérique par défaut. |

### ControlValueAccessor

- **Valeur modèle** : `string` canonique (jamais de séparateurs). Un `null`/`undefined` écrit devient `''`.
- **Valeur sale venue du backend** : nettoyée à l'affichage puis **renvoyée propre au modèle** en différé (`queueMicrotask`) — écrire pendant que le formulaire écrit ferait boucler.
- Au blur : `normalize` puis re-`sanitize` (le préfixe pays ajouté ne doit pas faire déborder la longueur max), reformatage, `onTouched`.
- Pas de `NG_VALIDATORS` : la validité visuelle (pastille, message, bordure) est portée par le composant, la validité du formulaire reste l'affaire des validators du parent.
- Compatible `[ngModel]`, `formControlName` **et** la directive signal-forms `[formField]` (usage dominant dans `src/app`).

## billy-input-tva — InputTvaComponent

Saisie d'un numéro de TVA intracommunautaire. Modèle « BE0690614660 », affichage « BE 0690.614.660 ». Le numéro belge est vérifié (modulo 97) ; les autres pays connus sont vérifiés en longueur (`unverified` si conforme) ; les pays inconnus ne sont jamais déclarés faux.

| Input spécifique | Type | Défaut | Description |
|---|---|---|---|
| `defaultCountry` | `string` | `'BE'` | Pays présumé quand seuls des chiffres sont saisis : au blur, `TvaUtils.normalize` ajoute le préfixe (et restaure le zéro de tête d'un ancien numéro belge à 9 chiffres). |

**Slot de projection** : `<ng-content select="[codeAction]">` — action facultative accolée au champ. Utilisé par `client-form` pour `<app-bce-search codeAction>` (recherche Banque-Carrefour affichée seulement sur un numéro belge valide). Sans projection, le champ reste inchangé.

Usage dans `src/app` : `client-form`, `compte-form`.

## billy-input-iban — InputIbanComponent

Saisie d'un compte bancaire IBAN. Modèle « BE68539007547034 », affichage « BE 68 5390 0754 7034 ». La clé de contrôle (ISO 7064, modulo 97) est universelle : vérifiée dès que l'IBAN est complet, quel que soit le pays. Pas d'input spécifique ; `normalize` se réduit à `sanitize` (rien à compléter sur un IBAN).

Usage dans `src/app` : `client-form`, `compte-form`.

## billy-input-email — InputEmailComponent

Même coque, même pastille et mêmes états que TVA/IBAN, **sans masque** (`formatText` et `normalize` = identité) : une adresse ne se découpe pas en groupes. Les espaces (fréquents au copier-coller) et caractères interdits sont retirés à la frappe comme au chargement ; la casse est laissée intacte (RFC 5321).

Spécificités :

- `domain` (computed) : domaine saisi, affiché en pastille comme le pays d'un numéro de TVA — masqué quand l'adresse est invalide.
- `suggestion` (computed) : correction proposée par `EmailUtils.suggest` pour les fautes de frappe de domaine (« gmial.com » → « gmail.com ») — l'état bleu `unverified` sert à ça. Un bouton « Vouliez-vous dire … ? » remplace le message ; `applySuggestion()` écrit la correction dans le champ.
- `isSignificant` est surchargé (tout caractère autorisé est significatif) : les branches « effacer par-dessus un séparateur » du socle ne se déclenchent jamais.
- L'`<input>` est `type="text" inputmode="email"` et non `type="email"` : le socle place le curseur avec `setSelectionRange()`, que la norme interdit sur un champ email (`InvalidStateError`). `inputmode` ramène quand même le clavier « @ » sur mobile.

Usage dans `src/app` : `client-form`.

## billy-tva-display — TvaDisplayComponent / billy-iban-display — IbanDisplayComponent

Affichage en lecture d'un numéro déjà enregistré : la valeur (même sale) est nettoyée puis découpée par `TvaUtils.format` / `IbanUtils.format`, et rendue par `billy-code-value`. Robustes par construction : un pays sans règle de découpage est affiché tel quel derrière son préfixe.

| Input | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string \| null \| undefined` | `''` | Valeur brute (canonique ou non). |
| `empty` | `string` | `'Non renseigné'` | Texte affiché sans valeur. |
| `glyph` | `boolean` (`booleanAttribute`) | `false` | Affiche le symbole SVG devant la valeur. |
| `copyable` | `boolean` (`booleanAttribute`) | `true` | Affiche le bouton de copie. |

Usage dans `src/app` : `client-fiche` (consultation client), `compte-document`, `peppol-facture-status-info` (TVA).

```html
<billy-tva-display class="cc-value" [value]="c.tva"></billy-tva-display>
<billy-iban-display class="cc-value" [value]="c.compte"></billy-iban-display>
```

## billy-code-glyph — CodeGlyphComponent

Symbole SVG d'un champ « code » : vignette fiscale dentelée (TVA), carte bancaire (IBAN) ou enveloppe (email). Dessinés à la main (à 26 px, deux traits nets valent mieux qu'un glyphe de fonte) et teintés par `currentColor` : le glyphe suit l'état du champ (accent, vert `--cfd-ok`, rouge danger).

| Input | Type | Description |
|---|---|---|
| `kind` | `CodeGlyphKind` = `'tva' \| 'iban' \| 'email'` (**required**) | Choix du dessin. |

## billy-code-status — CodeStatusComponent

Pastille d'état (22 px, `role="img"` + `aria-label` francisé) :

- `partial` → anneau de progression qui se remplit à la frappe (cercle `pathLength="1"`, piloté par `stroke-dashoffset = 1 - progress`) ;
- `valid` → disque vert, coche qui se dessine (animation `stroke-dashoffset`) ;
- `unverified` → disque accent avec « i » (structure conforme, pas de clé de contrôle connue) ;
- `invalid` → disque rouge avec « ! ».

| Input | Type | Défaut | Description |
|---|---|---|---|
| `status` | `CodeStatus` (**required**) | — | État affiché (classe hôte `cs--<status>`). |
| `progress` | `number` | `0` | Avancement 0→1 de l'anneau (état `partial`). |

## billy-code-value — CodeValueComponent

Rendu en lecture d'un code déjà découpé : présentation pure, le découpage est l'affaire des utils. Les segments `muted` passent en gris, les chiffres gardent la couleur du texte. Bouton de copie discret (révélé au survol de la ligne, toujours visible au clavier) qui copie la **valeur canonique** `raw` — pas le rendu avec séparateurs — et n'affiche la coche « copié » (1,8 s) qu'une fois `navigator.clipboard.writeText` réellement résolu.

| Input | Type | Défaut | Description |
|---|---|---|---|
| `segments` | `CodeSegment[]` (**required**) | — | Fragments à afficher. |
| `kind` | `CodeGlyphKind` (**required**) | — | Symbole à afficher si `glyph`. |
| `raw` | `string` | `''` | Valeur canonique copiée. |
| `empty` | `string` | `'Non renseigné'` | Texte sans valeur. |
| `glyph` / `copyable` | `boolean` (`booleanAttribute`) | `true` / `true` | Affichage du symbole / du bouton copie. |

## Exemple d'utilisation

Extrait réel de `src/app/auth/pages/client/client-form/client-form.component.html` (signal-forms `[formField]`) :

```html
<billy-input-email inputId="cf-email"
  hint="Adresse à laquelle partiront les factures"
  [formField]="formClient.email">
</billy-input-email>

<billy-input-tva inputId="cf-tva"
  hint="Numéro d'entreprise ou TVA intracommunautaire"
  [formField]="formClient.tva">
  <!-- N'apparaît que sur un numéro belge valide -->
  <app-bce-search codeAction
    [tva]="formClient.tva().value()"
    (found)="applyBce($event)">
  </app-bce-search>
</billy-input-tva>

<billy-input-iban inputId="cf-compte"
  hint="IBAN du compte à créditer"
  [formField]="formClient.compte">
</billy-input-iban>
```

Les champs s'utilisent aussi avec `formControlName` / `[ngModel]` (CVA standard).

## Styles & theming

- La coque des trois champs vient de la mixin partagée **`billy-code-field`** (`lib/styles/_billy-code-field.scss`, incluse par chaque `.scss` de champ), elle-même bâtie sur les mixins `billy-forms` (`billy-input`, `billy-focus`, `billy-input-invalid`). Un seul jeu de classes `.cfd-*` pour les trois champs.
- Tokens : `--billy-input-*`, `--billy-accent(-soft/-strong)`, `--billy-danger`, `--billy-text-muted`, `--billy-divider`, `--billy-section-*`. Le **vert de validation n'existe pas dans la charte** : il est défini localement (`--cfd-ok`/`--cs-ok` : `#16a34a`, `#4ade80` en dark) et réajusté via `body.dark-mode`.
- Parti pris : un champ **valide garde sa bordure neutre** (la validation se lit à la coche, au glyphe et au message) ; seule l'erreur colore le cadre.
- Chasse fixe (`font-variant-numeric: tabular-nums`, interlettrage élargi) sur TVA/IBAN pour que les groupes restent alignés ; annulée pour l'email (`.cfd-input--text` : « rn » et « m » doivent rester distincts).
- La ligne d'information `.cfd-meta` a une hauteur réservée (`min-height: 17px`) : le message apparaît/disparaît sans pousser le champ suivant. Pastille pays `.cfd-country` animée à l'apparition.
- Dans `billy-code-value`, chaque segment est un élément flex : un IBAN long se coupe **entre** deux groupes, jamais au milieu. `prefers-reduced-motion` respecté partout.

## Pièges & notes

- **Zoneless/signals** : tout l'état est en signals ; la synchronisation DOM ← `display` passe par un `effect` qui ne réécrit l'input **que si** le DOM diverge du modèle (chargement, reset) — pendant la frappe on n'y touche pas, donc le curseur ne bouge pas.
- **`forceDisabled` et non `disabled`** : signal-forms écrit l'état du champ dans l'input `disabled` de l'hôte *après* les bindings du template ; un `disabled` statique serait écrasé.
- **Backspace/Delete au contact d'un séparateur** : le socle efface le caractère significatif visé de l'autre côté du séparateur (sinon le masque remettrait aussitôt le point et rien ne disparaîtrait). Les suppressions de mot (Ctrl/Alt/Cmd) sont laissées au navigateur.
- **Écriture de valeurs sales** : `writeValue('be 0690.614.660')` renverra `BE0690614660` au modèle via `queueMicrotask` — le formulaire verra donc une écriture asynchrone juste après le chargement (un tour, puis stable).
- Détails des utils (règles par pays, checksums, suggestions email) : voir [../core/code-utils.md](../core/code-utils.md).
