import { VatUtils } from './vat-utils';

describe('VatUtils', () => {

  describe('sanitize', () => {
    it('strips separators and uppercases', () => {
      expect(VatUtils.sanitize('be 0123.456.749')).toBe('BE0123456749');
    });

    it('returns an empty string for null/undefined', () => {
      expect(VatUtils.sanitize(null)).toBe('');
      expect(VatUtils.sanitize(undefined)).toBe('');
    });

    it('caps the value at 14 characters', () => {
      expect(VatUtils.sanitize('BE12345678901234567')).toHaveLength(14);
    });
  });

  describe('country', () => {
    it('returns the country code once both letters are typed', () => {
      expect(VatUtils.country('BE0123456749')).toBe('BE');
      expect(VatUtils.country('fr 12 345')).toBe('FR');
    });

    it('returns null while the prefix is incomplete or numeric', () => {
      expect(VatUtils.country('B')).toBeNull();
      expect(VatUtils.country('0123456749')).toBeNull();
    });
  });

  describe('countryLabel', () => {
    it('uses the built-in English map by default', () => {
      expect(VatUtils.countryLabel('BE0123456749')).toBe('Belgium');
      expect(VatUtils.countryLabel('NL123456789B12')).toBe('Netherlands');
    });

    it('translates through Intl.DisplayNames when a locale is given', () => {
      expect(VatUtils.countryLabel('BE0123456749', 'fr')).toBe('Belgique');
      expect(VatUtils.countryLabel('DE123456789', 'fr')).toBe('Allemagne');
    });

    it('falls back to the English map when Intl cannot resolve the code', () => {
      // XI (Northern Ireland) is not an ISO region Intl knows about.
      expect(VatUtils.countryLabel('XI123456789', 'fr')).toBe('Northern Ireland');
    });

    it('returns null for unknown countries', () => {
      expect(VatUtils.countryLabel('ZZ123456789')).toBeNull();
    });
  });

  describe('normalize', () => {
    it('prefixes a 10-digit number with BE', () => {
      expect(VatUtils.normalize('0123456749')).toBe('BE0123456749');
    });

    it('restores the leading zero of the old 9-digit Belgian format', () => {
      expect(VatUtils.normalize('123456749')).toBe('BE0123456749');
      expect(VatUtils.normalize('BE123456749')).toBe('BE0123456749');
    });

    it('uses the provided default country for digit-only input', () => {
      expect(VatUtils.normalize('12345678901', 'FR')).toBe('FR12345678901');
    });

    it('leaves complete numbers untouched', () => {
      expect(VatUtils.normalize('BE0123456749')).toBe('BE0123456749');
      expect(VatUtils.normalize('LU12345678')).toBe('LU12345678');
    });

    it('returns an empty string for empty input', () => {
      expect(VatUtils.normalize('')).toBe('');
      expect(VatUtils.normalize(null)).toBe('');
    });
  });

  describe('format / formatText', () => {
    it('renders the canonical Belgian display', () => {
      expect(VatUtils.formatText('BE0123456749')).toBe('BE 0123.456.749');
    });

    it('marks the country prefix and separators as muted', () => {
      const segments = VatUtils.format('BE0123456749');
      expect(segments[0]).toEqual({ text: 'BE', muted: true });
      expect(segments[1]).toEqual({ text: ' ', muted: true });
    });

    it('groups digit-only input with the Belgian rule', () => {
      expect(VatUtils.formatText('0123456749')).toBe('0123.456.749');
    });

    it('returns no segments for empty input', () => {
      expect(VatUtils.format('')).toEqual([]);
    });
  });

  describe('checksum', () => {
    it('validates a correct Belgian number (modulo 97)', () => {
      expect(VatUtils.checksum('BE0123456749')).toBe(true);
    });

    it('rejects a Belgian number with a wrong check digit', () => {
      expect(VatUtils.checksum('BE0123456740')).toBe(false);
    });

    it('stays silent (null) for countries without a known check', () => {
      expect(VatUtils.checksum('FR12345678901')).toBeNull();
    });
  });

  describe('isStructureValid', () => {
    it('accepts a plausible international structure', () => {
      expect(VatUtils.isStructureValid('LU12345678')).toBe(true);
    });

    it('rejects a structure that is too short', () => {
      expect(VatUtils.isStructureValid('BE123')).toBe(false);
    });
  });

  describe('digits', () => {
    it('keeps only the digits', () => {
      expect(VatUtils.digits('BE 0123.456.749')).toBe('0123456749');
    });
  });

  describe('describe', () => {
    it('reports empty input', () => {
      expect(VatUtils.describe('').status).toBe('empty');
    });

    it('reports a valid Belgian number', () => {
      const info = VatUtils.describe('BE0123456749');
      expect(info.status).toBe('valid');
      expect(info.country).toBe('BE');
      expect(info.countryLabel).toBe('Belgium');
      expect(info.progress).toBe(1);
    });

    it('reports an invalid Belgian check digit', () => {
      expect(VatUtils.describe('BE0123456740').status).toBe('invalid');
    });

    it('reports a well-formed foreign number as unverified, not invalid', () => {
      expect(VatUtils.describe('LU12345678').status).toBe('unverified');
    });

    it('reports partial input while typing', () => {
      expect(VatUtils.describe('BE01234').status).toBe('partial');
      expect(VatUtils.describe('069').status).toBe('partial');
    });
  });

});
