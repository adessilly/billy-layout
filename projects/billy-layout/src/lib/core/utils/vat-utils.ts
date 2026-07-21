import {
  CodeInfo, CodeSegment, groupBySizes, keepAlnum, segmentsToText,
} from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Intra-community VAT numbers.
//
// Canonical value: "BE0690614660" — country code + body, no separator.
// Display:         "BE 0690.614.660" — prefix and dots greyed out.
//
// Only Belgium has an implemented check digit (modulo 97). For other
// countries we check the length when we know it, and stop there: a
// well-formed Luxembourgish or French number is reported as `unverified`,
// not invalid. A country we have never heard of never breaks rendering.
// ═══════════════════════════════════════════════════════════════════════════

/** 2 letters + 12 characters: the maximum for an EU VAT number. */
const MAX_LENGTH = 14;

/** Minimal structure of an international number, across all countries. */
const STRUCTURE = /^[A-Z]{2}[A-Z0-9]{8,12}$/;

/** Display grouping + expected body length, per country. */
interface VatRule {
  sizes: number[];
  separator: string;
  length: number;
}

const RULES: Record<string, VatRule> = {
  BE: { sizes: [4, 3, 3],    separator: '.', length: 10 },
  FR: { sizes: [2, 3, 3, 3], separator: ' ', length: 11 },
  LU: { sizes: [8],          separator: ' ', length: 8  },
  NL: { sizes: [9, 3],       separator: ' ', length: 12 },
  DE: { sizes: [9],          separator: ' ', length: 9  },
  ES: { sizes: [9],          separator: ' ', length: 9  },
  IT: { sizes: [11],         separator: ' ', length: 11 },
  PT: { sizes: [9],          separator: ' ', length: 9  },
};

const COUNTRIES: Record<string, string> = {
  AT: 'Austria',    BE: 'Belgium',  BG: 'Bulgaria',   CH: 'Switzerland',
  CY: 'Cyprus',     CZ: 'Czechia',  DE: 'Germany',    DK: 'Denmark',
  EE: 'Estonia',    EL: 'Greece',   ES: 'Spain',      FI: 'Finland',
  FR: 'France',     GB: 'United Kingdom', GR: 'Greece', HR: 'Croatia',
  HU: 'Hungary',    IE: 'Ireland',  IT: 'Italy',      LT: 'Lithuania',
  LU: 'Luxembourg', LV: 'Latvia',   MT: 'Malta',      NL: 'Netherlands',
  NO: 'Norway',     PL: 'Poland',   PT: 'Portugal',   RO: 'Romania',
  SE: 'Sweden',     SI: 'Slovenia', SK: 'Slovakia',   XI: 'Northern Ireland',
};

/** User-visible diagnostics of `describe`, per locale. */
const MESSAGES: Record<'en' | 'fr', {
  belgianPrefix: string;
  startCountry: string;
  belgianDigits: string;
  valid: string;
  belgianInvalid: string;
  charsExpected: (country: string, length: number) => string;
  wellFormed: (country: string) => string;
  stillTyping: (country: string) => string;
}> = {
  en: {
    belgianPrefix: 'Belgian number — the BE prefix will be added',
    startCountry: 'Start with the country code (BE, LU, FR…)',
    belgianDigits: 'Belgian number: 10 digits expected',
    valid: 'Valid number',
    belgianInvalid: 'This Belgian number does not look valid',
    charsExpected: (country, length) => `${country}: ${length} characters expected`,
    wellFormed: country => `${country} — well-formed`,
    stillTyping: country => `${country} — still typing`,
  },
  fr: {
    belgianPrefix: 'Numéro belge — le préfixe BE sera ajouté',
    startCountry: 'Commencez par le code pays (BE, LU, FR…)',
    belgianDigits: 'Numéro belge : 10 chiffres attendus',
    valid: 'Numéro valide',
    belgianInvalid: 'Ce numéro belge ne semble pas valide',
    charsExpected: (country, length) => `${country} : ${length} caractères attendus`,
    wellFormed: country => `${country} — format conforme`,
    stillTyping: country => `${country} — saisie en cours`,
  },
};

export abstract class VatUtils {

  /** Canonical form: "BE 0690.614.660" → "BE0690614660". */
  static sanitize(raw: string | null | undefined): string {
    return keepAlnum(raw, MAX_LENGTH);
  }

  /** Country code typed so far, or null until both letters are in. */
  static country(raw: string | null | undefined): string | null {
    const value = VatUtils.sanitize(raw);
    return /^[A-Z]{2}/.test(value) ? value.slice(0, 2) : null;
  }

  /**
   * Country name, or null if the country is not listed. Without a locale the
   * built-in English map is used; with one, `Intl.DisplayNames` translates
   * when it can, and the English map covers the rest (`XI`, `EL`, unknown
   * locales).
   */
  static countryLabel(raw: string | null | undefined, locale?: string): string | null {
    const country = VatUtils.country(raw);
    if (!country) { return null; }

    if (locale) {
      try {
        const label = new Intl.DisplayNames([locale], { type: 'region' }).of(country);
        // `of` may echo the code back (e.g. "XI"): treat that as a miss.
        if (label && label !== country) { return label; }
      } catch {
        // Unknown locale or code Intl cannot handle: fall back to the map.
      }
    }

    return COUNTRIES[country] ?? null;
  }

  /**
   * Completes what can be completed once typing is done: a number typed as
   * digits only is Belgian (prefix added), and the old 9-digit format gets
   * its leading zero back.
   */
  static normalize(raw: string | null | undefined, defaultCountry = 'BE'): string {
    const value = VatUtils.sanitize(raw);
    if (!value) { return ''; }

    // The prefix adds two characters: run through `sanitize` again so the
    // result stays capped at MAX_LENGTH, otherwise the model would hold a
    // number longer than what the field can display.
    if (/^\d+$/.test(value)) {
      return defaultCountry === 'BE' && value.length >= 9 && value.length <= 10
        ? 'BE' + value.padStart(10, '0')
        : VatUtils.sanitize(defaultCountry + value);
    }

    if (/^BE\d{9}$/.test(value)) {
      return 'BE0' + value.slice(2);
    }

    return value;
  }

  /** Display segments: country prefix and separators marked `muted`. */
  static format(raw: string | null | undefined): CodeSegment[] {
    const value = VatUtils.sanitize(raw);
    if (!value) { return []; }

    const country = VatUtils.country(value);
    const body = country ? value.slice(2) : value;
    const segments: CodeSegment[] = [];

    if (country) {
      segments.push({ text: country, muted: true }, { text: ' ', muted: true });
    }

    const rule = VatUtils.rule(country, body);
    if (rule) {
      segments.push(...groupBySizes(body, rule.sizes, rule.separator));
    } else if (body) {
      segments.push({ text: body, muted: false });
    }

    return segments;
  }

  /** The same rendering, flattened: the mask applied to the input field. */
  static formatText(raw: string | null | undefined): string {
    return segmentsToText(VatUtils.format(raw));
  }

  /**
   * Check digit. `null` = country without a known check → we stay silent.
   * Belgium: 97 − (first 8 digits modulo 97) = the last 2.
   */
  static checksum(raw: string | null | undefined): boolean | null {
    const value = VatUtils.sanitize(raw);
    if (!value.startsWith('BE')) { return null; }

    const body = value.slice(2);
    if (!/^\d{10}$/.test(body)) { return false; }

    return 97 - (Number(body.slice(0, 8)) % 97) === Number(body.slice(8));
  }

  /** Plausible international structure (without judging the check digit). */
  static isStructureValid(raw: string | null | undefined): boolean {
    return STRUCTURE.test(VatUtils.sanitize(raw));
  }

  /** Digits only — what the BCE/KBO lookup form expects. */
  static digits(raw: string | null | undefined): string {
    return (raw ?? '').replace(/\D/g, '');
  }

  /** Diagnostic shown under the field (status, country, message, progress). */
  static describe(raw: string | null | undefined, locale: 'en' | 'fr' = 'en'): CodeInfo {
    const messages = MESSAGES[locale];
    const value = VatUtils.sanitize(raw);
    const country = VatUtils.country(value);
    const countryLabel = locale === 'fr'
      ? VatUtils.countryLabel(value, 'fr')
      : country ? COUNTRIES[country] ?? null : null;
    const base: CodeInfo = { status: 'empty', country, countryLabel, message: '', progress: 0 };

    if (!value) { return base; }

    const rule = country ? RULES[country] : undefined;
    const expected = rule ? rule.length + 2 : 12;
    const progress = Math.min(1, value.length / expected);
    const info = { ...base, progress };

    // No country code yet: digits only → a Belgian number in the making.
    if (!country) {
      return /^\d+$/.test(value)
        ? { ...info, status: 'partial', message: messages.belgianPrefix }
        : { ...info, status: 'partial', message: messages.startCountry };
    }

    const body = value.slice(2);
    const checksum = VatUtils.checksum(value);

    if (checksum !== null) {
      if (body.length < 10) {
        return { ...info, status: 'partial', message: messages.belgianDigits };
      }
      return checksum
        ? { ...info, status: 'valid',   message: messages.valid }
        : { ...info, status: 'invalid', message: messages.belgianInvalid };
    }

    const countryName = countryLabel ?? country;

    if (rule) {
      if (body.length < rule.length) {
        return { ...info, status: 'partial', message: messages.charsExpected(countryName, rule.length) };
      }
      if (body.length > rule.length) {
        return { ...info, status: 'invalid', message: messages.charsExpected(countryName, rule.length) };
      }
      return { ...info, status: 'unverified', message: messages.wellFormed(countryName) };
    }

    // Country without a known rule: settle for the international structure.
    if (VatUtils.isStructureValid(value)) {
      return { ...info, status: 'unverified', message: messages.wellFormed(countryName), progress: 1 };
    }
    return { ...info, status: 'partial', message: messages.stillTyping(countryName) };
  }

  /** Grouping rule: the country's, or Belgium's when all we have is digits. */
  private static rule(country: string | null, body: string): VatRule | undefined {
    if (country) { return RULES[country]; }
    return /^\d{1,10}$/.test(body) ? RULES['BE'] : undefined;
  }

}
