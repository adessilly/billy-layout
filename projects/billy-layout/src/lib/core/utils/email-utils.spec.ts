import { EmailUtils } from './email-utils';

describe('EmailUtils', () => {

  describe('sanitize', () => {
    it('removes spaces and forbidden characters, keeps case', () => {
      expect(EmailUtils.sanitize(' Jean.Dupont @gmail.com ')).toBe('Jean.Dupont@gmail.com');
      expect(EmailUtils.sanitize('a<b>@(c).be')).toBe('ab@c.be');
    });

    it('returns an empty string for null/undefined', () => {
      expect(EmailUtils.sanitize(null)).toBe('');
      expect(EmailUtils.sanitize(undefined)).toBe('');
    });

    it('caps the value at 254 characters (RFC 5321)', () => {
      expect(EmailUtils.sanitize('a'.repeat(300))).toHaveLength(254);
    });
  });

  describe('isValid', () => {
    it('accepts standard addresses', () => {
      expect(EmailUtils.isValid('jean@example.be')).toBe(true);
      expect(EmailUtils.isValid('jean.dupont+tag@sub.example.com')).toBe(true);
    });

    it('rejects malformed addresses', () => {
      expect(EmailUtils.isValid('jean')).toBe(false);
      expect(EmailUtils.isValid('jean@example')).toBe(false);
      expect(EmailUtils.isValid('@example.be')).toBe(false);
      expect(EmailUtils.isValid('jean@@example.be')).toBe(false);
    });
  });

  describe('domain', () => {
    it('returns what follows the last "@"', () => {
      expect(EmailUtils.domain('jean@gmail.com')).toBe('gmail.com');
    });

    it('returns null while the domain is not started', () => {
      expect(EmailUtils.domain('jean')).toBeNull();
      expect(EmailUtils.domain('jean@')).toBeNull();
    });
  });

  describe('suggest', () => {
    it('corrects a transposition typo on a common domain', () => {
      expect(EmailUtils.suggest('jean@gmial.com')).toBe('jean@gmail.com');
    });

    it('leaves an already common domain alone', () => {
      expect(EmailUtils.suggest('jean@gmail.com')).toBeNull();
    });

    it('does not guess when the domain resembles nothing known', () => {
      expect(EmailUtils.suggest('jean@company.org')).toBeNull();
    });
  });

  describe('describe', () => {
    it('reports empty input', () => {
      expect(EmailUtils.describe('').status).toBe('empty');
    });

    it('guides through the typing steps', () => {
      expect(EmailUtils.describe('jean')).toMatchObject({ status: 'partial', progress: 0.35 });
      expect(EmailUtils.describe('jean@gmail')).toMatchObject({ status: 'partial', progress: 0.7 });
    });

    it('flags a missing local part or a doubled "@"', () => {
      expect(EmailUtils.describe('@gmail.com').status).toBe('invalid');
      expect(EmailUtils.describe('a@b@c.be').status).toBe('invalid');
    });

    it('reports a valid address', () => {
      const info = EmailUtils.describe('jean@gmail.com');
      expect(info.status).toBe('valid');
      expect(info.progress).toBe(1);
    });

    it('reports a probable typo as unverified with the suggestion', () => {
      const info = EmailUtils.describe('jean@gmial.com');
      expect(info.status).toBe('unverified');
      expect(info.message).toBe('Did you mean jean@gmail.com?');
    });

    it('speaks French when asked to', () => {
      expect(EmailUtils.describe('jean@gmail.com', 'fr').message).toBe('Adresse valide');
      expect(EmailUtils.describe('jean@gmial.com', 'fr').message)
        .toBe('Vouliez-vous dire jean@gmail.com ?');
    });
  });

});
