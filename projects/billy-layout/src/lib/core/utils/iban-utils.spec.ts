import { IbanUtils } from './iban-utils';

describe('IbanUtils', () => {

  describe('sanitize', () => {
    it('strips separators and uppercases', () => {
      expect(IbanUtils.sanitize('be68 5390-0754.7034')).toBe('BE68539007547034');
    });

    it('returns an empty string for null/undefined', () => {
      expect(IbanUtils.sanitize(null)).toBe('');
      expect(IbanUtils.sanitize(undefined)).toBe('');
    });

    it('caps the value at 34 characters (ISO 13616)', () => {
      expect(IbanUtils.sanitize('A'.repeat(40))).toHaveLength(34);
    });
  });

  describe('country / countryLabel', () => {
    it('reads the country prefix', () => {
      expect(IbanUtils.country('be68 5390')).toBe('BE');
      expect(IbanUtils.countryLabel('LU28001940')).toBe('Luxembourg');
    });

    it('returns null while the prefix is incomplete or unknown', () => {
      expect(IbanUtils.country('B')).toBeNull();
      expect(IbanUtils.countryLabel('ZZ68539007547034')).toBeNull();
    });
  });

  describe('format / formatText', () => {
    it('groups by 4 with the country code and spaces muted', () => {
      expect(IbanUtils.formatText('BE68539007547034')).toBe('BE68 5390 0754 7034');

      const segments = IbanUtils.format('BE68539007547034');
      expect(segments[0]).toEqual({ text: 'BE', muted: true });
      expect(segments[1]).toEqual({ text: '68', muted: false });
      expect(segments[2]).toEqual({ text: ' ', muted: true });
    });

    it('returns no segments for empty input', () => {
      expect(IbanUtils.format('')).toEqual([]);
    });
  });

  describe('isValid', () => {
    it('accepts a real Belgian IBAN (ISO 7064 modulo 97)', () => {
      expect(IbanUtils.isValid('BE68539007547034')).toBe(true);
      expect(IbanUtils.isValid('be68 5390 0754 7034')).toBe(true);
    });

    it('rejects a wrong check digit', () => {
      expect(IbanUtils.isValid('BE68539007547035')).toBe(false);
    });

    it('rejects a length that does not match the country', () => {
      expect(IbanUtils.isValid('BE685390075470341')).toBe(false);
    });
  });

  describe('describe', () => {
    it('reports empty input', () => {
      expect(IbanUtils.describe('').status).toBe('empty');
    });

    it('reports partial input while typing', () => {
      const info = IbanUtils.describe('BE685390');
      expect(info.status).toBe('partial');
      expect(info.progress).toBe(0.5); // 8 of the 16 Belgian characters
    });

    it('asks for the country code first', () => {
      expect(IbanUtils.describe('123').status).toBe('partial');
      expect(IbanUtils.describe('123').country).toBeNull();
    });

    it('reports a valid IBAN with its country', () => {
      const info = IbanUtils.describe('BE68539007547034');
      expect(info.status).toBe('valid');
      expect(info.country).toBe('BE');
      expect(info.countryLabel).toBe('Belgium');
      expect(info.progress).toBe(1);
    });

    it('reports a complete IBAN whose checksum fails', () => {
      expect(IbanUtils.describe('BE68539007547035').status).toBe('invalid');
    });

    it('speaks French when asked to', () => {
      expect(IbanUtils.describe('BE68539007547034', 'fr').message).toBe('IBAN valide');
      expect(IbanUtils.describe('123', 'fr').message)
        .toBe('Un IBAN commence par le code pays (BE, LU, FR…)');
    });
  });

});
