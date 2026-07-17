// ═══════════════════════════════════════════════════════════════════════════
// Socle commun aux « codes » saisis puis relus (n° TVA, IBAN).
//
// Une valeur canonique : compacte, en majuscules, sans séparateur ni espace
// (« BE0690614660 »). C'est elle — et elle seule — qui va au backend.
//
// Un rendu en segments : la valeur découpée en fragments dont on sait s'ils
// portent l'information (les chiffres) ou seulement la lisibilité (le préfixe
// pays, les points, les espaces). Ces derniers sont marqués `muted`, ce qui
// permet de les griser à l'affichage sans que chaque composant ne rejoue le
// découpage.
// ═══════════════════════════════════════════════════════════════════════════

/** Fragment de rendu. `muted` : préfixe pays ou séparateur → affiché en gris. */
export interface CodeSegment {
  text: string;
  muted: boolean;
}

/**
 * État d'un code.
 * - `partial`    : saisie en cours, trop court pour être jugé
 * - `unverified` : structure conforme, mais aucune clé de contrôle connue
 *                  pour ce pays (on n'invente pas une erreur)
 * - `valid`      : clé de contrôle vérifiée
 */
export type CodeStatus = 'empty' | 'partial' | 'invalid' | 'unverified' | 'valid';

/** Diagnostic complet d'un code, prêt à être affiché sous le champ. */
export interface CodeInfo {
  status: CodeStatus;
  /** Code pays ISO détecté (« BE »), ou null s'il n'est pas encore saisi. */
  country: string | null;
  /** Nom du pays en français, ou null si le pays n'est pas répertorié. */
  countryLabel: string | null;
  /** Message court affiché sous le champ. */
  message: string;
  /** Avancement de la saisie (0 → 1), pour l'anneau de progression. */
  progress: number;
}

const ALNUM = /[A-Z0-9]/;

export function isAlnum(char: string): boolean {
  return !!char && ALNUM.test(char.toUpperCase());
}

/**
 * Réduit une saisie (ou une valeur venue du backend) à sa forme canonique :
 * majuscules, uniquement [A-Z0-9], tronquée à `maxLength`. Tout le reste —
 * points, espaces, tirets, lettres accentuées, symboles — est ignoré.
 */
export function keepAlnum(raw: string | null | undefined, maxLength: number): string {
  return (raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength);
}

export function countAlnum(text: string): number {
  let count = 0;
  for (const char of text) {
    if (isAlnum(char)) { count++; }
  }
  return count;
}

/**
 * Ajoute un segment en le fusionnant avec le précédent s'il a la même teinte :
 * « BE » + « 68 » restent deux segments (pays grisé, clé normale), mais deux
 * chiffres consécutifs n'en forment qu'un. Rend le DOM minimal.
 */
function push(segments: CodeSegment[], text: string, muted: boolean): void {
  const last = segments[segments.length - 1];
  if (last && last.muted === muted) {
    last.text += text;
  } else {
    segments.push({ text, muted });
  }
}

/**
 * Découpe selon des tailles de groupes variables (TVA : 4.3.3 en Belgique).
 * Tolérant par construction : une valeur trop courte est découpée jusqu'où
 * elle va (la saisie se formate donc au fil de la frappe), une valeur trop
 * longue voit son surplus collé à la fin plutôt que tronqué.
 */
export function groupBySizes(body: string, sizes: number[], separator: string): CodeSegment[] {
  const segments: CodeSegment[] = [];
  let offset = 0;

  for (const size of sizes) {
    if (offset >= body.length) { break; }
    if (offset > 0) { push(segments, separator, true); }
    push(segments, body.slice(offset, offset + size), false);
    offset += size;
  }

  if (offset < body.length) {
    push(segments, body.slice(offset), false);
  }

  return segments;
}

/**
 * Découpe en groupes de taille fixe (IBAN : par 4), en grisant les `mutedHead`
 * premiers caractères (le code pays). Les séparateurs tombent sur la grille du
 * code complet, pas sur celle du reste : « BE68 5390 0754 7034 ».
 */
export function groupByChunks(
  value: string, size: number, separator: string, mutedHead = 0,
): CodeSegment[] {
  const segments: CodeSegment[] = [];

  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % size === 0) { push(segments, separator, true); }
    push(segments, value[i], i < mutedHead);
  }

  return segments;
}

/** Le texte que ces segments affichent — c'est le masque du champ de saisie. */
export function segmentsToText(segments: CodeSegment[]): string {
  return segments.map(segment => segment.text).join('');
}
