import {
  CodeInfo, CodeSegment, groupByChunks, keepAlnum, segmentsToText,
} from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Bank accounts in IBAN format.
//
// Canonical value: "BE68539007547034".
// Display:         "BE 68 5390 0754 7034" — country code and spaces greyed out.
//
// The check digit (ISO 7064, modulo 97) is universal: it holds for every
// country, including those whose length we do not know. So we only declare
// "invalid" a complete IBAN whose check comes out wrong.
// ═══════════════════════════════════════════════════════════════════════════

/** Maximum length of an IBAN (ISO 13616 standard). */
const MAX_LENGTH = 34;

/** Absent a known length for the country, a plausible IBAN is at least this. */
const MIN_LENGTH = 15;

/** Total IBAN length, per country. */
const LENGTHS: Record<string, number> = {
  AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18,
  EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GR: 27, HR: 21, HU: 28,
  IE: 22, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MT: 31,
  NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19, SK: 24,
};

const COUNTRIES: Record<string, string> = {
  AT: 'Austria',    BE: 'Belgium',  BG: 'Bulgaria',      CH: 'Switzerland',
  CY: 'Cyprus',     CZ: 'Czechia',  DE: 'Germany',       DK: 'Denmark',
  EE: 'Estonia',    ES: 'Spain',    FI: 'Finland',       FR: 'France',
  GB: 'United Kingdom', GR: 'Greece', HR: 'Croatia',     HU: 'Hungary',
  IE: 'Ireland',    IT: 'Italy',    LI: 'Liechtenstein', LT: 'Lithuania',
  LU: 'Luxembourg', LV: 'Latvia',   MC: 'Monaco',        MT: 'Malta',
  NL: 'Netherlands', NO: 'Norway',  PL: 'Poland',        PT: 'Portugal',
  RO: 'Romania',    SE: 'Sweden',   SI: 'Slovenia',      SK: 'Slovakia',
};

/** User-visible diagnostics of `describe`, per locale. */
const MESSAGES: Record<'en' | 'fr', {
  startCountry: string;
  charsExpected: (country: string, length: number) => string;
  stillTyping: (country: string) => string;
  valid: string;
  invalidChecksum: string;
}> = {
  en: {
    startCountry: 'An IBAN starts with the country code (BE, LU, FR…)',
    charsExpected: (country, length) => `${country}: ${length} characters expected`,
    stillTyping: country => `${country} — still typing`,
    valid: 'Valid IBAN',
    invalidChecksum: 'The IBAN check digits are incorrect',
  },
  fr: {
    startCountry: 'Un IBAN commence par le code pays (BE, LU, FR…)',
    charsExpected: (country, length) => `${country} : ${length} caractères attendus`,
    stillTyping: country => `${country} — saisie en cours`,
    valid: 'IBAN valide',
    invalidChecksum: 'Clé de contrôle IBAN est incorrecte',
  },
};

export abstract class IbanUtils {

  /** Canonical form: "BE68 5390-0754.7034" → "BE68539007547034". */
  static sanitize(raw: string | null | undefined): string {
    return keepAlnum(raw, MAX_LENGTH);
  }

  /** Nothing to complete on an IBAN: cleaning up is enough. */
  static normalize(raw: string | null | undefined): string {
    return IbanUtils.sanitize(raw);
  }

  static country(raw: string | null | undefined): string | null {
    const value = IbanUtils.sanitize(raw);
    return /^[A-Z]{2}/.test(value) ? value.slice(0, 2) : null;
  }

  /**
   * Country name, or null if the country is not listed. Without a locale the
   * built-in English map is used; with one, `Intl.DisplayNames` translates
   * when it can, and the English map covers the rest.
   */
  static countryLabel(raw: string | null | undefined, locale?: string): string | null {
    const country = IbanUtils.country(raw);
    if (!country) { return null; }

    if (locale) {
      try {
        const label = new Intl.DisplayNames([locale], { type: 'region' }).of(country);
        // `of` may echo the code back: treat that as a miss.
        if (label && label !== country) { return label; }
      } catch {
        // Unknown locale or code Intl cannot handle: fall back to the map.
      }
    }

    return COUNTRIES[country] ?? null;
  }

  /** Display segments: groups of 4, country code and spaces marked `muted`. */
  static format(raw: string | null | undefined): CodeSegment[] {
    const value = IbanUtils.sanitize(raw);
    if (!value) { return []; }

    const mutedHead = IbanUtils.country(value) ? 2 : 0;
    return groupByChunks(value, 4, ' ', mutedHead);
  }

  /** The same rendering, flattened: the mask applied to the input field. */
  static formatText(raw: string | null | undefined): string {
    return segmentsToText(IbanUtils.format(raw));
  }

  /**
   * ISO 7064 check: the first 4 characters move to the end, letters become
   * numbers (A = 10 … Z = 35), and the whole thing modulo 97 must equal 1.
   * The remainder is computed digit by digit — an IBAN exceeds the precision
   * of a `number`.
   */
  static isValid(raw: string | null | undefined): boolean {
    const value = IbanUtils.sanitize(raw);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(value)) { return false; }

    const expected = LENGTHS[value.slice(0, 2)];
    if (expected && value.length !== expected) { return false; }

    return IbanUtils.mod97(value) === 1;
  }

  /** Diagnostic shown under the field (status, country, message, progress). */
  static describe(raw: string | null | undefined, locale: 'en' | 'fr' = 'en'): CodeInfo {
    const messages = MESSAGES[locale];
    const value = IbanUtils.sanitize(raw);
    const country = IbanUtils.country(value);
    const countryLabel = locale === 'fr'
      ? IbanUtils.countryLabel(value, 'fr')
      : country ? COUNTRIES[country] ?? null : null;
    const base: CodeInfo = { status: 'empty', country, countryLabel, message: '', progress: 0 };

    if (!value) { return base; }

    const expected = country ? LENGTHS[country] : undefined;
    const progress = Math.min(1, value.length / (expected ?? MIN_LENGTH + 1));
    const info = { ...base, progress };

    if (!country) {
      return { ...info, status: 'partial', message: messages.startCountry };
    }

    const countryName = countryLabel ?? country;

    if (expected) {
      if (value.length < expected) {
        return { ...info, status: 'partial', message: messages.charsExpected(countryName, expected) };
      }
      if (value.length > expected) {
        return { ...info, status: 'invalid', message: messages.charsExpected(countryName, expected) };
      }
    } else if (value.length < MIN_LENGTH) {
      return { ...info, status: 'partial', message: messages.stillTyping(countryName) };
    }

    return IbanUtils.isValid(value)
      ? { ...info, status: 'valid',   message: messages.valid }
      : { ...info, status: 'invalid', message: messages.invalidChecksum };
  }

  private static mod97(value: string): number {
    const rearranged = value.slice(4) + value.slice(0, 4);
    let remainder = 0;

    for (const char of rearranged) {
      // A → "10", Z → "35": a letter weighs two digits.
      const digits = char >= 'A' ? String(char.charCodeAt(0) - 55) : char;
      for (const digit of digits) {
        remainder = (remainder * 10 + Number(digit)) % 97;
      }
    }

    return remainder;
  }

}
