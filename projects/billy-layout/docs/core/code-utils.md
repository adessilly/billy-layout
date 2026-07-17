# Utils de codes — code-format, TvaUtils, IbanUtils, EmailUtils

> Catégorie `core` · source `projects/billy-layout/src/lib/core/utils/{code-format,tva-utils,iban-utils,email-utils}.ts` · classes & fonctions utilitaires (sans dépendance Angular)

## Rôle

Socle de validation et de formatage des « codes » saisis puis relus dans Billy : numéros de TVA, IBAN et adresses email. Le contrat est le même partout : une **valeur canonique** (compacte, majuscules, sans séparateur — c'est elle seule qui va au backend), un **rendu en segments** (fragments marqués `muted` pour griser préfixe pays et séparateurs sans que chaque composant rejoue le découpage), et un **diagnostic** (`describe()` → `CodeInfo`) prêt à afficher sous le champ. Consommateurs : les champs `code-field` de la librairie (`billy-input-tva`, `billy-input-iban`, `billy-input-email`, `billy-tva-display`, `billy-iban-display`, `billy-code-value`) et, côté app, `bce-search`, `client-form`, `client-fiche`, `compte-document`.

```ts
import {
  CodeInfo, CodeSegment, CodeStatus,
  TvaUtils, IbanUtils, EmailUtils,
  keepAlnum, groupBySizes, groupByChunks, segmentsToText, isAlnum, countAlnum,
} from 'billy-layout';
```

---

## code-format — socle commun

### Types exportés

```ts
/** Fragment de rendu. `muted` : préfixe pays ou séparateur → affiché en gris. */
interface CodeSegment { text: string; muted: boolean; }

type CodeStatus = 'empty' | 'partial' | 'invalid' | 'unverified' | 'valid';

/** Diagnostic complet d'un code, prêt à être affiché sous le champ. */
interface CodeInfo {
  status: CodeStatus;
  country: string | null;       // code ISO détecté (« BE »), ou null
  countryLabel: string | null;  // nom du pays en français, ou null
  message: string;              // message court sous le champ
  progress: number;             // avancement de la saisie 0 → 1 (anneau de progression)
}
```

Sémantique de `CodeStatus` :

| Statut | Sens |
|---|---|
| `empty` | rien de saisi |
| `partial` | saisie en cours, trop courte pour être jugée |
| `invalid` | structure ou clé de contrôle en défaut |
| `unverified` | structure conforme mais aucune clé de contrôle connue pour ce pays — on n'invente pas une erreur |
| `valid` | clé de contrôle vérifiée |

### Fonctions

| Fonction | Signature | Sémantique |
|---|---|---|
| `isAlnum` | `(char: string) => boolean` | Vrai si le caractère est `[A-Z0-9]` (insensible à la casse). |
| `keepAlnum` | `(raw, maxLength) => string` | Forme canonique : majuscules, seulement `[A-Z0-9]`, tronquée à `maxLength`. Points, espaces, tirets, accents, symboles : ignorés. |
| `countAlnum` | `(text: string) => number` | Nombre de caractères alphanumériques d'un texte (utile pour mapper une position de curseur entre valeur brute et masque). |
| `groupBySizes` | `(body, sizes: number[], separator) => CodeSegment[]` | Découpe selon des tailles de groupes variables (TVA belge : `[4, 3, 3]`). Tolérant : une valeur trop courte est découpée jusqu'où elle va (formatage au fil de la frappe), un surplus est collé à la fin plutôt que tronqué. Séparateurs `muted`. |
| `groupByChunks` | `(value, size, separator, mutedHead = 0) => CodeSegment[]` | Découpe en groupes de taille fixe (IBAN : par 4) en grisant les `mutedHead` premiers caractères (code pays). La grille des séparateurs suit le code complet : « BE68 5390 0754 7034 ». |
| `segmentsToText` | `(segments) => string` | Aplatit les segments en texte — c'est le masque du champ de saisie. |

Les segments adjacents de même teinte sont fusionnés (via le `push` interne) : le DOM produit est minimal.

---

## TvaUtils — numéros de TVA intracommunautaires

Canonique `BE0690614660` · affichage `BE 0690.614.660` (préfixe et points grisés). Classe abstraite, méthodes statiques uniquement. **Seule la Belgique a une clé de contrôle implémentée** (modulo 97) ; pour 8 pays (`BE FR LU NL DE ES IT PT`) la longueur du corps est connue et vérifiée, et ~30 pays ont un libellé français. Un numéro étranger conforme est `unverified`, jamais « valide » par excès.

| Méthode statique | Retour | Sémantique |
|---|---|---|
| `sanitize(raw)` | `string` | Canonique : `keepAlnum` borné à 14 caractères (2 lettres + 12, max UE). |
| `country(raw)` | `string \| null` | Code pays, ou `null` tant que les 2 lettres ne sont pas là. |
| `countryLabel(raw)` | `string \| null` | Nom français du pays, ou `null` si non répertorié. |
| `normalize(raw, defaultCountry = 'BE')` | `string` | Complétion en fin de saisie : chiffres seuls → préfixe `BE` ajouté (et zéro de tête restauré : 9-10 chiffres → `BE` + pad à 10) ; ancien format `BE` + 9 chiffres → `BE0…`. |
| `format(raw)` | `CodeSegment[]` | Segments d'affichage : préfixe pays + espace `muted`, corps groupé selon la règle du pays (BE `4.3.3` points, FR `2 3 3 3` espaces, …). Sans pays, des chiffres sont traités comme un futur numéro belge. |
| `formatText(raw)` | `string` | `format` à plat — le masque du champ. |
| `checksum(raw)` | `boolean \| null` | Clé de contrôle. `null` = pays sans contrôle connu (non-BE) → on ne se prononce pas. Belgique : `97 − (8 premiers chiffres % 97) === 2 derniers`. |
| `isStructureValid(raw)` | `boolean` | Structure internationale plausible : `^[A-Z]{2}[A-Z0-9]{8,12}$` (sans juger la clé). |
| `digits(raw)` | `string` | Chiffres seuls — le format attendu par la recherche BCE/KBO (utilisé par `bce-search`, `client-fiche`, `compte-document`). |
| `describe(raw)` | `CodeInfo` | Diagnostic complet : pays, message contextuel (« Numéro belge : 10 chiffres attendus », « France — format conforme »…), progression vers la longueur attendue (12 par défaut si pays sans règle). |

Grille de `describe` : BE complet → `valid`/`invalid` selon la clé ; pays à règle → longueur exacte exigée (`partial` en dessous, `invalid` au-delà, `unverified` pile) ; pays sans règle → `unverified` dès que la structure internationale passe.

Usage réel (`src/app/shared/components/bce-search/bce-search.component.ts`) :

```ts
import { TvaUtils } from 'billy-layout';
readonly canSearch = computed(() =>
  !!this.bce() && TvaUtils.checksum(this.tva()) === true);
```

---

## IbanUtils — comptes bancaires IBAN

Canonique `BE68539007547034` · affichage `BE 68 5390 0754 7034` (code pays et espaces grisés). Contrairement à la TVA, la **clé de contrôle ISO 7064 (modulo 97) est universelle** : elle se vérifie pour tous les pays, y compris ceux dont la longueur est inconnue. 32 pays ont leur longueur totale répertoriée (BE : 16, FR : 27, LU : 20, …).

| Méthode statique | Retour | Sémantique |
|---|---|---|
| `sanitize(raw)` | `string` | Canonique : `keepAlnum` borné à 34 (max ISO 13616). |
| `normalize(raw)` | `string` | Alias de `sanitize` — rien à compléter sur un IBAN. |
| `country(raw)` / `countryLabel(raw)` | `string \| null` | Comme TvaUtils. |
| `format(raw)` | `CodeSegment[]` | `groupByChunks(value, 4, ' ', 2)` — groupes de 4, les 2 lettres pays grisées. |
| `formatText(raw)` | `string` | Le masque du champ. |
| `isValid(raw)` | `boolean` | Structure `^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$` + longueur du pays si connue + `mod97 === 1`. Le modulo se calcule chiffre par chiffre (lettres → 10..35, les 4 premiers caractères passés à la fin) : un IBAN dépasse la précision d'un `number`. |
| `describe(raw)` | `CodeInfo` | `partial` tant que la longueur pays (ou le minimum plausible de 15) n'est pas atteinte, `invalid` si trop long ou clé fausse (« Clé de contrôle IBAN est incorrecte »), `valid` sinon. La progression vise la longueur du pays. |

Il n'existe pas de statut `unverified` en pratique pour l'IBAN : la clé étant universelle, un IBAN complet est `valid` ou `invalid`.

---

## EmailUtils — adresses email

Pas de masque (une adresse ne se découpe pas en groupes), mais le même contrat : valeur canonique, `describe()`, et une valeur ajoutée spécifique — la **détection de faute de frappe sur le domaine** (« gmial.com » est structurellement valide, mais c'est presque sûrement une erreur qui enverrait une facture dans le vide). **La casse n'est jamais touchée** : la partie locale n'est pas formellement insensible à la casse (RFC 5321).

| Méthode statique | Retour | Sémantique |
|---|---|---|
| `isAllowed(char)` | `boolean` | Caractère autorisé : `atext` RFC 5322 + `@` + point. |
| `sanitize(raw)` | `string` | Canonique : caractères interdits (dont espaces) retirés, bornée à 254 (RFC 5321). |
| `isValid(raw)` | `boolean` | Structure : partie locale à segments pointés + domaine à labels + TLD alphabétique ≥ 2. |
| `domain(raw)` | `string \| null` | Ce qui suit le **dernier** `@`, ou `null`. |
| `suggest(raw)` | `string \| null` | Adresse corrigée si le domaine est à une distance de Damerau-Levenshtein ≤ 1 (≤ 2 si domaine > 10 caractères) d'un des ~25 domaines courants belges/français (`gmail.com`, `skynet.be`, `telenet.be`, `proximus.be`, …) sans en être un. `null` si rien à redire ou doute trop grand. |
| `describe(raw)` | `CodeInfo` | `country`/`countryLabel` toujours `null`. Progression par jalons : partie locale 0.35 → `@` 0.7 → domaine pointé 1. Messages ciblés : `@` manquant, nom manquant avant `@`, double `@`, domaine incomplet ; une suggestion produit `unverified` avec « Vouliez-vous dire jean@gmail.com ? » ; sinon `valid`. |

La distance interne est **Damerau-Levenshtein** (insertion, suppression, substitution **et transposition**) : « gmial » pour « gmail » — deux lettres interverties, la faute la plus courante — compte pour 1, là où Levenshtein seul la compterait 2 et la laisserait passer. Court-circuit si l'écart de longueur dépasse 2.

## Exemple d'utilisation

```ts
import { TvaUtils } from 'billy-layout';

// Pipeline type d'un champ TVA (cf. billy-input-tva) :
const canon = TvaUtils.sanitize(userInput);        // « be 0690.614.660 » → « BE0690614660 »
const masque = TvaUtils.formatText(canon);          // « BE 0690.614.660 » (affiché dans l'input)
const info = TvaUtils.describe(canon);              // { status: 'valid', message: 'Numéro valide', … }
const final = TvaUtils.normalize('0690614660');     // « BE0690614660 » au blur
```

## Styles & theming

Modules TypeScript purs, sans style. Le rendu visuel des segments `muted` et des statuts `CodeInfo` est porté par la coque SCSS `billy-code-field` (voir `docs/styles/styles.md`) et les composants `code-field`.

## Pièges & notes

- Aucune dépendance Angular : utilisables dans un `computed()`, un validateur de formulaire ou du code serveur.
- `TvaUtils` et consorts sont des **classes abstraites à méthodes statiques** — ne pas instancier.
- Toutes les entrées acceptent `string | null | undefined` : jamais besoin de garde en amont.
- `normalize` (TVA) est pensé pour le **blur / fin de saisie**, pas pour la frappe : appliqué à chaque frappe, il préfixerait `BE` trop tôt.
- La philosophie « on n'invente pas une erreur » est structurante : un pays inconnu ne fait jamais échouer le rendu ni passer le statut à `invalid` — il plafonne à `unverified`.
- `EmailUtils.suggest` ne corrige rien tout seul : il **propose** ; c'est au composant d'afficher la suggestion et de laisser l'utilisateur l'accepter.
- Les validations « structure connue » ont leurs limites assumées : la TVA non belge n'est vérifiée qu'en longueur ; l'email n'est pas validé au sens complet de la RFC (pas de quoted-string, pas d'IDN).
