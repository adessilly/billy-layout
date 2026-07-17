import {
  CodeInfo, CodeSegment, groupByChunks, keepAlnum, segmentsToText,
} from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Comptes bancaires au format IBAN.
//
// Valeur canonique : « BE68539007547034 ».
// Affichage        : « BE 68 5390 0754 7034 » — code pays et espaces grisés.
//
// La clé de contrôle (ISO 7064, modulo 97) est universelle : elle vaut pour
// tous les pays, y compris ceux dont on ignore la longueur. On ne déclare donc
// « invalide » qu'un IBAN complet dont la clé tombe à côté.
// ═══════════════════════════════════════════════════════════════════════════

/** Longueur maximale d'un IBAN (norme ISO 13616). */
const MAX_LENGTH = 34;

/** À défaut de longueur connue pour le pays, un IBAN plausible fait au moins ça. */
const MIN_LENGTH = 15;

/** Longueur totale de l'IBAN, par pays. */
const LENGTHS: Record<string, number> = {
  AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18,
  EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GR: 27, HR: 21, HU: 28,
  IE: 22, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MT: 31,
  NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19, SK: 24,
};

const COUNTRIES: Record<string, string> = {
  AT: 'Autriche',   BE: 'Belgique',  BG: 'Bulgarie',    CH: 'Suisse',
  CY: 'Chypre',     CZ: 'Tchéquie',  DE: 'Allemagne',   DK: 'Danemark',
  EE: 'Estonie',    ES: 'Espagne',   FI: 'Finlande',    FR: 'France',
  GB: 'Royaume-Uni', GR: 'Grèce',    HR: 'Croatie',     HU: 'Hongrie',
  IE: 'Irlande',    IT: 'Italie',    LI: 'Liechtenstein', LT: 'Lituanie',
  LU: 'Luxembourg', LV: 'Lettonie',  MC: 'Monaco',      MT: 'Malte',
  NL: 'Pays-Bas',   NO: 'Norvège',   PL: 'Pologne',     PT: 'Portugal',
  RO: 'Roumanie',   SE: 'Suède',     SI: 'Slovénie',    SK: 'Slovaquie',
};

export abstract class IbanUtils {

  /** Forme canonique : « BE68 5390-0754.7034 » → « BE68539007547034 ». */
  static sanitize(raw: string | null | undefined): string {
    return keepAlnum(raw, MAX_LENGTH);
  }

  /** Rien à compléter sur un IBAN : le nettoyage suffit. */
  static normalize(raw: string | null | undefined): string {
    return IbanUtils.sanitize(raw);
  }

  static country(raw: string | null | undefined): string | null {
    const value = IbanUtils.sanitize(raw);
    return /^[A-Z]{2}/.test(value) ? value.slice(0, 2) : null;
  }

  static countryLabel(raw: string | null | undefined): string | null {
    const country = IbanUtils.country(raw);
    return country ? COUNTRIES[country] ?? null : null;
  }

  /** Segments d'affichage : groupes de 4, code pays et espaces marqués `muted`. */
  static format(raw: string | null | undefined): CodeSegment[] {
    const value = IbanUtils.sanitize(raw);
    if (!value) { return []; }

    const mutedHead = IbanUtils.country(value) ? 2 : 0;
    return groupByChunks(value, 4, ' ', mutedHead);
  }

  /** Le même rendu, à plat : c'est le masque appliqué au champ de saisie. */
  static formatText(raw: string | null | undefined): string {
    return segmentsToText(IbanUtils.format(raw));
  }

  /**
   * Clé de contrôle ISO 7064 : les 4 premiers caractères passent à la fin, les
   * lettres deviennent des nombres (A = 10 … Z = 35), et le tout modulo 97 doit
   * valoir 1. Le reste se calcule chiffre par chiffre — un IBAN dépasse la
   * précision d'un `number`.
   */
  static isValid(raw: string | null | undefined): boolean {
    const value = IbanUtils.sanitize(raw);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(value)) { return false; }

    const expected = LENGTHS[value.slice(0, 2)];
    if (expected && value.length !== expected) { return false; }

    return IbanUtils.mod97(value) === 1;
  }

  /** Diagnostic affiché sous le champ (état, pays, message, progression). */
  static describe(raw: string | null | undefined): CodeInfo {
    const value = IbanUtils.sanitize(raw);
    const country = IbanUtils.country(value);
    const countryLabel = country ? COUNTRIES[country] ?? null : null;
    const base: CodeInfo = { status: 'empty', country, countryLabel, message: '', progress: 0 };

    if (!value) { return base; }

    const expected = country ? LENGTHS[country] : undefined;
    const progress = Math.min(1, value.length / (expected ?? MIN_LENGTH + 1));
    const info = { ...base, progress };

    if (!country) {
      return { ...info, status: 'partial', message: 'Un IBAN commence par le code pays (BE, LU, FR…)' };
    }

    const pays = countryLabel ?? country;

    if (expected) {
      if (value.length < expected) {
        return { ...info, status: 'partial', message: `${pays} : ${expected} caractères attendus` };
      }
      if (value.length > expected) {
        return { ...info, status: 'invalid', message: `${pays} : ${expected} caractères attendus` };
      }
    } else if (value.length < MIN_LENGTH) {
      return { ...info, status: 'partial', message: `${pays} — saisie en cours` };
    }

    return IbanUtils.isValid(value)
      ? { ...info, status: 'valid',   message: 'IBAN valide' }
      : { ...info, status: 'invalid', message: 'Clé de contrôle IBAN est incorrecte' };
  }

  private static mod97(value: string): number {
    const rearranged = value.slice(4) + value.slice(0, 4);
    let remainder = 0;

    for (const char of rearranged) {
      // A → « 10 », Z → « 35 » : une lettre pèse deux chiffres.
      const digits = char >= 'A' ? String(char.charCodeAt(0) - 55) : char;
      for (const digit of digits) {
        remainder = (remainder * 10 + Number(digit)) % 97;
      }
    }

    return remainder;
  }

}
