import { CodeInfo } from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Email addresses.
//
// No mask here — an address does not split into groups — but the same
// contract as VatUtils / IbanUtils: a canonical value (no spaces or
// forbidden characters), a diagnostic, and what it takes to display it
// under the field.
//
// Case is NOT touched: the domain is case-insensitive, but the local part
// formally is not (RFC 5321), and rewriting the address of an already
// registered client would gain nothing.
//
// The real added value is typo detection on the domain: "gmial.com" is a
// structurally valid address — no validator will reject it — but it is
// almost certainly a mistake, and it is the kind of detail that sends an
// invoice into the void.
// ═══════════════════════════════════════════════════════════════════════════

/** Standard limit (RFC 5321): 254 characters for the full address. */
const MAX_LENGTH = 254;

/** Allowed characters: `atext` from RFC 5322, plus "@" and the dot. */
const ALLOWED = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~.@-]/;

/** Accepted structure: a local part, a domain, at least one dot. */
const STRUCTURE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/** Domains common among Belgian clients — the target of the corrections. */
const COMMON_DOMAINS = [
  'gmail.com', 'hotmail.com', 'hotmail.be', 'hotmail.fr', 'outlook.com',
  'outlook.be', 'live.be', 'live.com', 'yahoo.com', 'yahoo.fr', 'icloud.com',
  'me.com', 'proton.me', 'protonmail.com', 'skynet.be', 'telenet.be',
  'voo.be', 'scarlet.be', 'proximus.be', 'belgacom.net', 'free.fr',
  'orange.fr', 'wanadoo.fr', 'laposte.net', 'sfr.fr',
];

/** User-visible diagnostics of `describe`, per locale. */
const MESSAGES: Record<'en' | 'fr', {
  addAtAndDomain: string;
  missingLocalPart: string;
  singleAtOnly: string;
  completeDomain: string;
  invalid: string;
  didYouMean: (suggestion: string) => string;
  valid: string;
}> = {
  en: {
    addAtAndDomain: 'Add "@" then the domain',
    missingLocalPart: 'The name before "@" is missing',
    singleAtOnly: 'An address contains only one "@"',
    completeDomain: 'Complete the domain (example.be)',
    invalid: 'This address is not valid',
    didYouMean: suggestion => `Did you mean ${suggestion}?`,
    valid: 'Valid address',
  },
  fr: {
    addAtAndDomain: 'Ajoutez « @ » puis le domaine',
    missingLocalPart: 'Il manque le nom avant « @ »',
    singleAtOnly: "Une adresse ne contient qu'un seul « @ »",
    completeDomain: 'Complétez le domaine (exemple.be)',
    invalid: "Cette adresse n'est pas valide",
    didYouMean: suggestion => `Vouliez-vous dire ${suggestion} ?`,
    valid: 'Adresse valide',
  },
};

export abstract class EmailUtils {

  static isAllowed(char: string): boolean {
    return !!char && ALLOWED.test(char);
  }

  /** Canonical form: spaces and forbidden characters removed, length capped. */
  static sanitize(raw: string | null | undefined): string {
    return (raw ?? '')
      .split('')
      .filter(char => EmailUtils.isAllowed(char))
      .join('')
      .slice(0, MAX_LENGTH);
  }

  static isValid(raw: string | null | undefined): boolean {
    return STRUCTURE.test(EmailUtils.sanitize(raw));
  }

  /** Domain typed so far (what follows the last "@"), or null. */
  static domain(raw: string | null | undefined): string | null {
    const value = EmailUtils.sanitize(raw);
    const at = value.lastIndexOf('@');
    return at > 0 && at < value.length - 1 ? value.slice(at + 1) : null;
  }

  /**
   * Corrected address when the domain very closely resembles a common one
   * without being one — "jean@gmial.com" → "jean@gmail.com". Null when there
   * is nothing to flag, or when the doubt is too great to suggest anything.
   */
  static suggest(raw: string | null | undefined): string | null {
    const value = EmailUtils.sanitize(raw);
    if (!EmailUtils.isValid(value)) { return null; }

    const domain = EmailUtils.domain(value);
    if (!domain) { return null; }

    const known = domain.toLowerCase();
    if (COMMON_DOMAINS.includes(known)) { return null; }

    // A typo is one letter — two at most on a long domain.
    const budget = known.length > 10 ? 2 : 1;
    const closest = COMMON_DOMAINS.find(
      candidate => EmailUtils.distance(known, candidate) <= budget,
    );
    if (!closest) { return null; }

    const local = value.slice(0, value.lastIndexOf('@'));
    return `${local}@${closest}`;
  }

  /** Diagnostic shown under the field (status, domain, message, progress). */
  static describe(raw: string | null | undefined, locale: 'en' | 'fr' = 'en'): CodeInfo {
    const messages = MESSAGES[locale];
    const value = EmailUtils.sanitize(raw);
    const domain = EmailUtils.domain(value);
    const base: CodeInfo = {
      status: 'empty', country: null, countryLabel: null, message: '', progress: 0,
    };

    if (!value) { return base; }

    const at = value.indexOf('@');

    // Progress: the local part, then the "@", then a dotted domain.
    let progress = 0.35;
    if (at >= 0) { progress = domain?.includes('.') ? 1 : 0.7; }
    const info = { ...base, progress };

    if (at < 0) {
      return { ...info, status: 'partial', message: messages.addAtAndDomain };
    }
    if (at === 0) {
      return { ...info, status: 'invalid', message: messages.missingLocalPart };
    }
    if (value.indexOf('@', at + 1) >= 0) {
      return { ...info, status: 'invalid', message: messages.singleAtOnly };
    }
    if (!domain || !domain.includes('.')) {
      return { ...info, status: 'partial', message: messages.completeDomain };
    }
    if (!EmailUtils.isValid(value)) {
      return { ...info, status: 'invalid', message: messages.invalid };
    }

    const suggestion = EmailUtils.suggest(value);
    if (suggestion) {
      return { ...info, status: 'unverified', message: messages.didYouMean(suggestion) };
    }

    return { ...info, status: 'valid', message: messages.valid };
  }

  /**
   * Damerau-Levenshtein distance: insertion, deletion, substitution and
   * **transposition** — "gmial" for "gmail", two letters swapped, is the most
   * common typo of all. Plain Levenshtein counts it as two errors and would
   * let it through.
   *
   * We only compare domains: a few dozen characters at most.
   */
  private static distance(a: string, b: string): number {
    if (a === b) { return 0; }
    if (Math.abs(a.length - b.length) > 2) { return 99; }

    // rows[i][j]: distance between the first i letters of a and the first j of b.
    const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)];

    for (let i = 1; i <= a.length; i++) {
      rows[i] = [i];

      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;

        let best = Math.min(
          rows[i][j - 1] + 1,        // insertion
          rows[i - 1][j] + 1,        // deletion
          rows[i - 1][j - 1] + cost, // substitution
        );

        // Transposition: the last two letters are swapped.
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          best = Math.min(best, rows[i - 2][j - 2] + 1);
        }

        rows[i][j] = best;
      }
    }

    return rows[a.length][b.length];
  }

}
