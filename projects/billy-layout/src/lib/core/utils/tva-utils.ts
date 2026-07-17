import {
  CodeInfo, CodeSegment, groupBySizes, keepAlnum, segmentsToText,
} from './code-format';

// ═══════════════════════════════════════════════════════════════════════════
// Numéros de TVA intracommunautaires.
//
// Valeur canonique : « BE0690614660 » — code pays + corps, sans séparateur.
// Affichage        : « BE 0690.614.660 » — préfixe et points grisés.
//
// Seule la Belgique a une clé de contrôle implémentée (modulo 97). Pour les
// autres pays, on vérifie la longueur quand on la connaît, et on s'arrête là :
// un numéro luxembourgeois ou français conforme est déclaré `unverified`, pas
// invalide. Un pays inconnu au bataillon ne fait jamais échouer le rendu.
// ═══════════════════════════════════════════════════════════════════════════

/** 2 lettres + 12 caractères : le maximum d'un numéro de TVA de l'UE. */
const MAX_LENGTH = 14;

/** Structure minimale d'un numéro international, tous pays confondus. */
const STRUCTURE = /^[A-Z]{2}[A-Z0-9]{8,12}$/;

/** Découpage d'affichage + longueur attendue du corps, par pays. */
interface TvaRule {
  sizes: number[];
  separator: string;
  length: number;
}

const RULES: Record<string, TvaRule> = {
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
  AT: 'Autriche',   BE: 'Belgique',  BG: 'Bulgarie',   CH: 'Suisse',
  CY: 'Chypre',     CZ: 'Tchéquie',  DE: 'Allemagne',  DK: 'Danemark',
  EE: 'Estonie',    EL: 'Grèce',     ES: 'Espagne',    FI: 'Finlande',
  FR: 'France',     GB: 'Royaume-Uni', GR: 'Grèce',    HR: 'Croatie',
  HU: 'Hongrie',    IE: 'Irlande',   IT: 'Italie',     LT: 'Lituanie',
  LU: 'Luxembourg', LV: 'Lettonie',  MT: 'Malte',      NL: 'Pays-Bas',
  NO: 'Norvège',    PL: 'Pologne',   PT: 'Portugal',   RO: 'Roumanie',
  SE: 'Suède',      SI: 'Slovénie',  SK: 'Slovaquie',  XI: 'Irlande du Nord',
};

export abstract class TvaUtils {

  /** Forme canonique : « BE 0690.614.660 » → « BE0690614660 ». */
  static sanitize(raw: string | null | undefined): string {
    return keepAlnum(raw, MAX_LENGTH);
  }

  /** Code pays saisi, ou null tant que les deux lettres ne sont pas là. */
  static country(raw: string | null | undefined): string | null {
    const value = TvaUtils.sanitize(raw);
    return /^[A-Z]{2}/.test(value) ? value.slice(0, 2) : null;
  }

  /** Nom du pays en français, ou null s'il n'est pas répertorié. */
  static countryLabel(raw: string | null | undefined): string | null {
    const country = TvaUtils.country(raw);
    return country ? COUNTRIES[country] ?? null : null;
  }

  /**
   * Complète ce qui peut l'être une fois la saisie terminée : un numéro tapé
   * en chiffres seuls est belge (préfixe ajouté), et l'ancien format à 9
   * chiffres retrouve son zéro de tête.
   */
  static normalize(raw: string | null | undefined, defaultCountry = 'BE'): string {
    const value = TvaUtils.sanitize(raw);
    if (!value) { return ''; }

    // Le préfixe ajoute deux caractères : on repasse par `sanitize` pour que le
    // résultat reste borné à MAX_LENGTH, sinon le modèle contiendrait un numéro
    // plus long que ce que le champ sait afficher.
    if (/^\d+$/.test(value)) {
      return defaultCountry === 'BE' && value.length >= 9 && value.length <= 10
        ? 'BE' + value.padStart(10, '0')
        : TvaUtils.sanitize(defaultCountry + value);
    }

    if (/^BE\d{9}$/.test(value)) {
      return 'BE0' + value.slice(2);
    }

    return value;
  }

  /** Segments d'affichage : préfixe pays et séparateurs marqués `muted`. */
  static format(raw: string | null | undefined): CodeSegment[] {
    const value = TvaUtils.sanitize(raw);
    if (!value) { return []; }

    const country = TvaUtils.country(value);
    const body = country ? value.slice(2) : value;
    const segments: CodeSegment[] = [];

    if (country) {
      segments.push({ text: country, muted: true }, { text: ' ', muted: true });
    }

    const rule = TvaUtils.rule(country, body);
    if (rule) {
      segments.push(...groupBySizes(body, rule.sizes, rule.separator));
    } else if (body) {
      segments.push({ text: body, muted: false });
    }

    return segments;
  }

  /** Le même rendu, à plat : c'est le masque appliqué au champ de saisie. */
  static formatText(raw: string | null | undefined): string {
    return segmentsToText(TvaUtils.format(raw));
  }

  /**
   * Clé de contrôle. `null` = pays sans contrôle connu → on ne se prononce pas.
   * Belgique : 97 − (8 premiers chiffres modulo 97) = les 2 derniers.
   */
  static checksum(raw: string | null | undefined): boolean | null {
    const value = TvaUtils.sanitize(raw);
    if (!value.startsWith('BE')) { return null; }

    const body = value.slice(2);
    if (!/^\d{10}$/.test(body)) { return false; }

    return 97 - (Number(body.slice(0, 8)) % 97) === Number(body.slice(8));
  }

  /** Structure internationale plausible (sans juger la clé de contrôle). */
  static isStructureValid(raw: string | null | undefined): boolean {
    return STRUCTURE.test(TvaUtils.sanitize(raw));
  }

  /** Chiffres seuls — ce qu'attend le formulaire de recherche de la BCE/KBO. */
  static digits(raw: string | null | undefined): string {
    return (raw ?? '').replace(/\D/g, '');
  }

  /** Diagnostic affiché sous le champ (état, pays, message, progression). */
  static describe(raw: string | null | undefined): CodeInfo {
    const value = TvaUtils.sanitize(raw);
    const country = TvaUtils.country(value);
    const countryLabel = country ? COUNTRIES[country] ?? null : null;
    const base: CodeInfo = { status: 'empty', country, countryLabel, message: '', progress: 0 };

    if (!value) { return base; }

    const rule = country ? RULES[country] : undefined;
    const expected = rule ? rule.length + 2 : 12;
    const progress = Math.min(1, value.length / expected);
    const info = { ...base, progress };

    // Pas encore de code pays : chiffres seuls → numéro belge en devenir.
    if (!country) {
      return /^\d+$/.test(value)
        ? { ...info, status: 'partial', message: 'Numéro belge — le préfixe BE sera ajouté' }
        : { ...info, status: 'partial', message: 'Commencez par le code pays (BE, LU, FR…)' };
    }

    const body = value.slice(2);
    const checksum = TvaUtils.checksum(value);

    if (checksum !== null) {
      if (body.length < 10) {
        return { ...info, status: 'partial', message: 'Numéro belge : 10 chiffres attendus' };
      }
      return checksum
        ? { ...info, status: 'valid',   message: 'Numéro valide' }
        : { ...info, status: 'invalid', message: 'Ce numéro belge ne semble pas valide' };
    }

    const pays = countryLabel ?? country;

    if (rule) {
      if (body.length < rule.length) {
        return { ...info, status: 'partial', message: `${pays} : ${rule.length} caractères attendus` };
      }
      if (body.length > rule.length) {
        return { ...info, status: 'invalid', message: `${pays} : ${rule.length} caractères attendus` };
      }
      return { ...info, status: 'unverified', message: `${pays} — format conforme` };
    }

    // Pays sans règle connue : on se contente de la structure internationale.
    if (TvaUtils.isStructureValid(value)) {
      return { ...info, status: 'unverified', message: `${pays} — format conforme`, progress: 1 };
    }
    return { ...info, status: 'partial', message: `${pays} — saisie en cours` };
  }

  /** Règle de découpage : celle du pays, ou celle de la Belgique si on n'a que des chiffres. */
  private static rule(country: string | null, body: string): TvaRule | undefined {
    if (country) { return RULES[country]; }
    return /^\d{1,10}$/.test(body) ? RULES['BE'] : undefined;
  }

}
