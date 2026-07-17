# Feuilles SCSS partagées — tokens, reboot, mixins, coques

> Catégorie `styles` · source `projects/billy-layout/src/lib/styles/` · mixins SCSS + feuilles globales

## Rôle

Le design system BILLy côté CSS : six feuilles qui portent les tokens `--billy-*` (source de vérité des couleurs/formes, dark mode compris), la normalisation globale, les mixins de formulaires et de cartes, et deux « coques » partagées (champs code, dialogues modaux). Tout composant de la librairie comme de l'app s'habille avec ces briques ; le dark mode est automatique partout puisque seuls les tokens changent sous `body.dark-mode`.

## Consommation

Les feuilles se résolvent **par nom nu**, sans chemin relatif, grâce aux include paths configurés des deux côtés :

- **Application** — `angular.json` → `projects.billy-client.architect.build.options.stylePreprocessorOptions.includePaths: ["projects/billy-layout/src/lib/styles"]`.
- **Librairie packagée** — `projects/billy-layout/ng-package.json` → `lib.styleIncludePaths: ["src/lib/styles"]` pour la compilation des composants, et un bloc `assets` qui copie `src/lib/styles/**/*.scss` vers `dist/billy-layout/styles` (les `.scss` sont livrés en source pour les consommateurs).

Deux modes d'usage :

```scss
// 1. Mixins, dans un SCSS de composant :
@use 'billy-forms' as forms;
@use 'billy-cards' as cards;

.mon-input { @include forms.billy-field; }
.mon-panneau { @include cards.billy-card; }

// 2. Feuilles globales, chargées une fois :
// src/styles.scss
@use 'billy-tokens';
@use 'billy-dialog';
// src/app/layout/layout-ui-loader/billy-legacy.scss
@use 'billy-reboot';
```

| Feuille | Nature | Chargement |
|---|---|---|
| `_billy-tokens.scss` | globale (émet du CSS) | une fois, dans `src/styles.scss` |
| `_billy-reboot.scss` | globale (émet du CSS) | une fois, aujourd'hui via `billy-legacy.scss` |
| `_billy-dialog.scss` | globale (émet du CSS) | une fois, dans `src/styles.scss` |
| `_billy-forms.scss` | mixins + `$field-height` | `@use` dans chaque composant consommateur |
| `_billy-cards.scss` | mixins | `@use` dans chaque composant consommateur |
| `_billy-code-field.scss` | une mixin de coque | `@use` dans les composants `code-field` |

---

## `_billy-tokens` — design tokens globaux

Source de vérité des couleurs et formes. Les valeurs light sont posées sur `:root`, les valeurs dark sur **`body.dark-mode`** : tout consommateur — y compris les overlays déplacés sous `<body>` (dialogues, dropdowns) — hérite du bon thème sans bloc dark local.

Principaux tokens par famille (light → dark quand la valeur change) :

| Famille | Tokens | Light | Dark |
|---|---|---|---|
| **Accent** | `--billy-accent` | `#12b4dd` | idem |
| | `--billy-accent-strong` (liens, totaux, sélection) | `#0e97bb` | `#7dd3ec` |
| | `--billy-accent-soft` (fonds teintés) | `#e6f7fc` | `rgba(18,180,221,.15)` |
| | `--billy-accent-border` | `#a5dff2` | `#0e97bb` |
| **Sémantique** (statuts) | `--billy-neutral` / `-strong` | `#6b7280` / `#374151` | `#4b5563` / `#cbd5e1` |
| `neutral · info · success · warning · error` | `--billy-info` / `-strong` | `#3b82f6` / `#1d4ed8` | `#2563eb` / `#60a5fa` |
| chacune : `base` (rempli vif), | `--billy-success` / `-strong` | `#16a34a` / `#15803d` | `#22c55e` / `#4ade80` |
| `-strong` (texte/icône, ≥ AA), | `--billy-warning` / `-strong` | `#ff902b` / `#b45309` | `#d97706` / `#fbbf24` |
| `-soft` / `-soft-strong`, `-ring` | `--billy-error` / `-strong` | `#ef4444` / `#b91c1c` | `#dc2626` / `#f87171` |
| **Focus** | `--billy-focus-border` | `#66afe9` | idem |
| | `--billy-focus-ring` | `rgba(102,175,233,.15)` | `.25` |
| **Champs** | `--billy-input-bg` / `-border` / `-border-hover` / `-color` / `-placeholder` | `#fff` / `#e5e7eb` / `#9ca3af` / `#374151` / `#c2c8d0` | `#121d1f` / `#49545a` / `#6b7a80` / `#ced0d2` / `#4b5563` |
| | `--billy-input-radius` | `8px` | idem |
| | `--billy-input-disabled-bg` / `-color` | `#f3f4f6` / `#9ca3af` | `#172224` / `#5a6a70` |
| **Addons** | `--billy-addon-bg` / `-color` / `-hover-bg` / `-hover-color` | `#f9fafb` / `#6b7280` / `#f3f4f6` / `#374151` | `#212e31` / `#7a8a90` / `#2d3d42` / `#ced0d2` |
| **Surfaces** | `--billy-surface` / `-border` / `-shadow` | `#fff` / `#e5e7eb` / ombre douce | `#1c282b` / `#49545a` / ombre noire |
| | `--billy-divider`, `--billy-text-muted`, `--billy-text-soft` | `#f3f4f6`, `#9ca3af`, `#6b7280` | `#2a3a3e`, `#5a6a70`, `#7a8a90` |
| **Danger** | `--billy-danger` / `--billy-danger-ring` | `#dc2626` / `rgba(220,38,38,.08)` | idem / `.15` |
| **Cartes & sections** | `--billy-card-shadow`, `--billy-section-bg` / `-border` / `-title` | ombre 4% / `#fafbfc` / `#eceff3` / `#374151` | ombre 25% / `#1a2629` / `#2e3d41` / `#9aadb3` |

### Familles sémantiques (statuts)

Cinq familles de statut — `neutral`, `info`, `success`, `warning`, `error` — bâties sur le même modèle qu'`Accent`, **source de vérité unique** des teintes de statut du DS. Chacune expose cinq variables :

| Variante | Rôle |
|---|---|
| `--billy-<hue>` (`base`) | Rempli **vif** : fond d'un bouton plein, disque d'un checkmark. S'assombrit d'un cran en dark. |
| `--billy-<hue>-strong` | Teinte **texte/icône** (contour, libellé, glyphe) : ≥ AA 4.5:1 sur surface claire, **s'éclaircit en dark** pour rester lisible. |
| `--billy-<hue>-soft` / `-soft-strong` | Voiles teintés (survol / actif des variantes contour & texte, pastille d'icône de toast). |
| `--billy-<hue>-ring` | Halo de focus (`box-shadow`). |

`primary` n'a **pas** de famille propre : c'est l'`Accent` de marque (`--billy-accent*`). Consommateurs : [`billy-button`](../buttons/button.md) (map `base`/`-strong`/`-soft`/`-ring` sur ses `--btn-*`), [`toastr`](../feedback/toastr.md) (accent = `-strong`, pastille = `-soft`), [`checkmark`](../feedback/checkmark.md) & `checkmark-failed` (disque = `base`), [`save-bar`](../forms/save-bar.md) (via `billy-button`). Un seul point à changer pour reteinter un statut partout.

---

## `_billy-reboot` — normalisation globale

Reset/normalize du DS, extrait de la couche de compat Bootstrap. **Tout le DS en dépend**, en particulier `* { box-sizing: border-box }` — aucun autre fichier ne le pose. Fixe : racine à `16px`, body en « Source Sans Pro » `0.875rem` / `line-height 1.52857` / fond `#f5f7fa`, échelle de titres, liens `#5d9cec`, `small { font-size: 80% }`, `*:focus { outline: 0 !important }`, resets `button/input/textarea/fieldset/table`.

Points d'attention :

- Les valeurs **reproduisent le rendu calculé du stack Bootstrap + Angle d'origine** — ne pas les « moderniser » sans re-vérifier la parité visuelle des pages métier.
- Chargé aujourd'hui par `src/app/layout/layout-ui-loader/billy-legacy.scss` (même position de cascade qu'avant l'extraction) ; quand la couche de compat disparaîtra, le charger depuis `styles.scss`.
- Prérequis fonts chargées par l'application (`index.html`) : « Source Sans Pro » (pages métier) ; le shell et le DS utilisent « Plus Jakarta Sans ».

---

## `_billy-forms` — mixins de formulaire

Consommation : `@use 'billy-forms' as forms;`. Dark mode automatique via les tokens. Deux générations de mixins :

**Peau seule** (historiquement combinées avec `.form-control` de Bootstrap) :

| Mixin | Usage |
|---|---|
| `billy-input` | Peau d'un champ : fond, bordure, rayon, placeholder, état focus (bordure + ring). |
| `billy-input-invalid` | État invalide, à combiner avec `billy-input` (classe Angular `.is-invalid`). |
| `billy-focus` | Uniquement l'état focus — pour un élément non-input (ex. trigger de dropdown ouvert). |
| `billy-addon-button` | Peau d'un addon accolé à un champ (fond gris, hover). |

**Boîte complète, sans Bootstrap** — la géométrie reprend celle du thème Angle (hauteur `2.1875rem`, padding `.375rem 1rem`, interligne `1.52857`, police `.875rem` pour les champs et `13px` pour les boutons — c'est le thème qui fait foi, pas le `1rem` de Bootstrap) :

| Mixin / variable | Usage |
|---|---|
| `$field-height` (`2.1875rem`) | Exposée pour aligner un bouton accolé à un champ. |
| `billy-field` | Champ complet (remplace `.form-control`) : boîte + peau + états disabled/readonly + `.is-invalid`. |
| `billy-textarea` | Même champ, hauteur auto (grandit avec le contenu). |
| `billy-button` | Socle d'un bouton (remplace `.btn`), sans couleur — à combiner avec une variante. |
| `billy-input-group` | Groupe « champ + addon accolé » (remplace `.input-group`) : coins joints, bordures superposées, champ focalisé passé en `z-index: 2`. |
| `billy-input-group-addon` | Texte/bouton accolé au champ ; hauteur **fixée** à `$field-height` (pas déduite du contenu), contenu centré verticalement. |

**Boutons de footer de panneau latéral** — même langage que `<billy-save-bar>` mais à échelle réduite (à utiliser quand une save-bar ne rentre pas : agenda, prestations) :

| Mixin | Usage |
|---|---|
| `billy-panel-button` | Socle commun (13px, 600, enfoncement à l'`:active`, disabled). |
| `billy-panel-button-ghost` | Annuler / Non : fantôme discret. |
| `billy-panel-button-submit` | Enregistrer : plein accent + relief au survol. |
| `billy-panel-button-destructive` | Confirmation de suppression : rouge plein, prend la place du bouton principal. |
| `billy-panel-button-delete-icon` | Supprimer en icône seule (~36px), `margin-right: auto` pour l'éloigner du bouton de validation. |

---

## `_billy-cards` — cartes & sections de panneaux

Consommation : `@use 'billy-cards' as cards;`. Visuel « carte blanche + sections grises à pastille » introduit sur la page Compte (`compte-form`) et généralisé aux écrans de consultation (`billy-consult-card`, `achat-document`, …).

| Mixin | Usage |
|---|---|
| `billy-card` | Carte englobante : surface, bord fin, rayon 16px, ombre discrète (`--billy-card-shadow`). |
| `billy-section` | Section interne : fond gris doux (`--billy-section-bg`), rayon 12px. |
| `billy-section-title` | Titre de section : 12px, capitales, gras, flex avec gap pour la pastille. |
| `billy-section-icon` | Pastille-icône 26×26 du titre (fond `--billy-accent-soft`, texte `--billy-accent-strong`). |
| `billy-intro` | Paragraphe d'introduction sous le titre (12.5px, `--billy-text-soft`). |

---

## `_billy-code-field` — coque des champs « code »

Consommation : `@use 'billy-code-field' as code;` puis `@include code.billy-code-field;` **au niveau racine du SCSS d'un composant** (la mixin contient des règles `:host`). Un seul jeu de classes `.cfd-*` partagé par `billy-input-tva`, `billy-input-iban` et `billy-input-email` : ils ne diffèrent que par leur symbole et leurs messages, pas par leur boîte.

- `.cfd-shell` : boîte du champ (flex, `billy-input`), modificateurs `--focus`, `--valid`, `--invalid`, `--disabled`. Choix assumé : **le champ valide garde sa bordure neutre** (la validation se lit à la coche/symbole/message) ; seule l'erreur garde son cadre.
- `.cfd-input` : saisie nue dans la shell — 13px semi-gras, `font-variant-numeric: tabular-nums` (chasse fixe : les groupes restent alignés et la valeur ne « respire » pas pendant la frappe).
- `.cfd-glyph` : symbole du champ (couleur d'état, léger scale au focus).
- `.cfd-meta` : ligne d'information sous le champ, **hauteur réservée** (`min-height: 17px`) — le message apparaît/disparaît sans pousser le champ suivant.
- `.cfd-country` : puce pays (fond accent doux, animation d'entrée `cfd-chip-in`).
- `.cfd-msg` + `--ok` / `--info` / `--error` : message d'état.
- Le vert de validation garde une valeur locale (`--cfd-ok: #16a34a`, `#4ade80` en dark via `:host-context(body.dark-mode)`) : il lui faut du vert **vif en clair** _et_ **clair en dark**, un couple que la famille `--billy-success` (base sombre en dark) ne restitue pas d'un seul token. Les valeurs restent alignées sur `--billy-success` (`base` light) / `--billy-success-strong` (dark). Animations neutralisées sous `prefers-reduced-motion`.

---

## `_billy-dialog` — coque des dialogues modaux `.billy-modal*`

Feuille **globale** (chargée dans `src/styles.scss`), remplaçante des `.modal*` de Bootstrap. Moteur associé : la classe `Dialog` (`dialogs/dialog/dialog-utils.ts`). Globale et non scopée pour deux raisons : les dialogues sont déplacés sous `<body>` à l'ouverture, et trois composants partagent la coque (dialog-form, delete, ai-extract).

| Classe | Rôle |
|---|---|
| `.billy-modal` | Racine plein écran : fond assombri, zone de clic-pour-fermer, conteneur de défilement. `display` piloté en JS (`none ↔ block`) — c'est ce passage qui rejoue les animations d'illustration. `z-index: 1055`. |
| `.billy-modal.is-open` | État ouvert : fondu d'opacité + glissement du dialogue (`translateY(-30px) → none`). |
| `.billy-modal-dialog` | Enveloppe centrée, `max-width: 500px` (géométrie Bootstrap conservée pour ne déplacer aucun dialogue). `pointer-events: none` pour laisser les clics de la gouttière atteindre la racine ; le contenu les reprend. |
| `.billy-modal-dialog--centered` | Centrage vertical (`min-height: calc(100% - 3.5rem)`). |
| `.billy-modal-dialog--large` | Équivalent `.modal-xl` : `800px` dès 992px, `1140px` dès 1200px. |
| `.billy-modal-content` | Carte du dialogue — même langage que `billy-card` (surface, bord fin, rayon 16px, `--billy-surface-shadow`), `pointer-events: auto`. |
| `.billy-modal-header` / `-body` / `-footer` / `-title` | Structure interne (paddings 1rem / footer 0.75rem aligné à droite). |
| `body.billy-dialog-open` | Verrou de défilement (`overflow: hidden`), posé par `Dialog` tant qu'un dialogue est ouvert. |

Responsive : marges réduites sous 576px. Transitions neutralisées sous `prefers-reduced-motion`.

## Pièges & notes

- **Ordre de cascade** : `billy-reboot` doit rester à sa position actuelle (chargé par `billy-legacy.scss`) tant que la couche de compat existe ; `billy-tokens` et `billy-dialog` se chargent dans `src/styles.scss`.
- Les mixins n'émettent **rien** tant qu'on ne les `@include` pas — les `@use` multiples dans les composants ne dupliquent pas de CSS. À l'inverse, `billy-tokens`/`billy-reboot`/`billy-dialog` émettent du CSS au `@use` : ne les charger qu'une fois, globalement.
- Toutes les couleurs des mixins ont un fallback en dur (`var(--billy-x, #hex)`) : un composant fonctionne même si les tokens ne sont pas chargés, mais sans dark mode — charger `billy-tokens` reste requis.
- Le dark mode repose sur la classe **`body.dark-mode`** (posée par `BillyDarkModeService`) : pas de `@media (prefers-color-scheme)` ici.
- `billy-code-field` référence `:host` / `:host-context` : réservée aux styles de composant (ViewEncapsulation par défaut), pas à une feuille globale.
- Dans le paquet distribué, les `.scss` sont copiés dans `dist/billy-layout/styles` : un consommateur externe doit ajouter ce dossier à ses propres `includePaths`.
