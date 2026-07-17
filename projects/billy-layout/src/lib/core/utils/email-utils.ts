import { CodeInfo } from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Adresses email.
//
// Pas de masque ici — une adresse ne se découpe pas en groupes — mais le même
// contrat que TvaUtils / IbanUtils : une valeur canonique (sans espace ni
// caractère interdit), un diagnostic, et de quoi l'afficher sous le champ.
//
// La casse n'est PAS touchée : le domaine est insensible à la casse, mais la
// partie locale ne l'est pas formellement (RFC 5321), et réécrire l'adresse
// d'un client déjà enregistré n'apporterait rien.
//
// La vraie valeur ajoutée est la détection de faute de frappe sur le domaine :
// « gmial.com » est une adresse structurellement valide — aucun validateur ne
// la refusera — mais c'est presque sûrement une erreur, et c'est le genre de
// détail qui envoie une facture dans le vide.
// ═══════════════════════════════════════════════════════════════════════════

/** Limite de la norme (RFC 5321) : 254 caractères pour l'adresse complète. */
const MAX_LENGTH = 254;

/** Caractères autorisés : `atext` de la RFC 5322, plus « @ » et le point. */
const ALLOWED = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~.@-]/;

/** Structure acceptée : une partie locale, un domaine, au moins un point. */
const STRUCTURE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/** Domaines courants chez les clients belges — la cible des corrections. */
const COMMON_DOMAINS = [
  'gmail.com', 'hotmail.com', 'hotmail.be', 'hotmail.fr', 'outlook.com',
  'outlook.be', 'live.be', 'live.com', 'yahoo.com', 'yahoo.fr', 'icloud.com',
  'me.com', 'proton.me', 'protonmail.com', 'skynet.be', 'telenet.be',
  'voo.be', 'scarlet.be', 'proximus.be', 'belgacom.net', 'free.fr',
  'orange.fr', 'wanadoo.fr', 'laposte.net', 'sfr.fr',
];

export abstract class EmailUtils {

  static isAllowed(char: string): boolean {
    return !!char && ALLOWED.test(char);
  }

  /** Forme canonique : espaces et caractères interdits retirés, longueur bornée. */
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

  /** Domaine saisi (ce qui suit le dernier « @ »), ou null. */
  static domain(raw: string | null | undefined): string | null {
    const value = EmailUtils.sanitize(raw);
    const at = value.lastIndexOf('@');
    return at > 0 && at < value.length - 1 ? value.slice(at + 1) : null;
  }

  /**
   * Adresse corrigée si le domaine ressemble de très près à un domaine courant
   * sans en être un — « jean@gmial.com » → « jean@gmail.com ». Null s'il n'y a
   * rien à redire, ou si le doute est trop grand pour proposer quoi que ce soit.
   */
  static suggest(raw: string | null | undefined): string | null {
    const value = EmailUtils.sanitize(raw);
    if (!EmailUtils.isValid(value)) { return null; }

    const domain = EmailUtils.domain(value);
    if (!domain) { return null; }

    const known = domain.toLowerCase();
    if (COMMON_DOMAINS.includes(known)) { return null; }

    // Une faute de frappe, c'est une lettre — deux au plus sur un domaine long.
    const budget = known.length > 10 ? 2 : 1;
    const closest = COMMON_DOMAINS.find(
      candidate => EmailUtils.distance(known, candidate) <= budget,
    );
    if (!closest) { return null; }

    const local = value.slice(0, value.lastIndexOf('@'));
    return `${local}@${closest}`;
  }

  /** Diagnostic affiché sous le champ (état, domaine, message, progression). */
  static describe(raw: string | null | undefined): CodeInfo {
    const value = EmailUtils.sanitize(raw);
    const domain = EmailUtils.domain(value);
    const base: CodeInfo = {
      status: 'empty', country: null, countryLabel: null, message: '', progress: 0,
    };

    if (!value) { return base; }

    const at = value.indexOf('@');

    // Avancement : la partie locale, puis l'arobase, puis un domaine pointé.
    let progress = 0.35;
    if (at >= 0) { progress = domain?.includes('.') ? 1 : 0.7; }
    const info = { ...base, progress };

    if (at < 0) {
      return { ...info, status: 'partial', message: 'Ajoutez « @ » puis le domaine' };
    }
    if (at === 0) {
      return { ...info, status: 'invalid', message: 'Il manque le nom avant « @ »' };
    }
    if (value.indexOf('@', at + 1) >= 0) {
      return { ...info, status: 'invalid', message: "Une adresse ne contient qu'un seul « @ »" };
    }
    if (!domain || !domain.includes('.')) {
      return { ...info, status: 'partial', message: 'Complétez le domaine (exemple.be)' };
    }
    if (!EmailUtils.isValid(value)) {
      return { ...info, status: 'invalid', message: "Cette adresse n'est pas valide" };
    }

    const suggestion = EmailUtils.suggest(value);
    if (suggestion) {
      return { ...info, status: 'unverified', message: `Vouliez-vous dire ${suggestion} ?` };
    }

    return { ...info, status: 'valid', message: 'Adresse valide' };
  }

  /**
   * Distance de Damerau-Levenshtein : insertion, suppression, substitution et
   * **transposition** — « gmial » pour « gmail », deux lettres interverties, est
   * la faute de frappe la plus courante de toutes. Levenshtein seul la compte
   * pour deux erreurs et la laisserait passer.
   *
   * On ne compare que des domaines : quelques dizaines de caractères au plus.
   */
  private static distance(a: string, b: string): number {
    if (a === b) { return 0; }
    if (Math.abs(a.length - b.length) > 2) { return 99; }

    // rows[i][j] : distance entre les i premières lettres de a et les j de b.
    const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)];

    for (let i = 1; i <= a.length; i++) {
      rows[i] = [i];

      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;

        let best = Math.min(
          rows[i][j - 1] + 1,        // insertion
          rows[i - 1][j] + 1,        // suppression
          rows[i - 1][j - 1] + cost, // substitution
        );

        // Transposition : les deux dernières lettres sont interverties.
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          best = Math.min(best, rows[i - 2][j - 2] + 1);
        }

        rows[i][j] = best;
      }
    }

    return rows[a.length][b.length];
  }

}
