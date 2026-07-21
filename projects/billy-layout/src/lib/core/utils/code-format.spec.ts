import {
  countAlnum, groupByChunks, groupBySizes, isAlnum, keepAlnum, segmentsToText,
} from './code-format';

describe('code-format', () => {

  describe('keepAlnum', () => {
    it('uppercases and strips everything but [A-Z0-9]', () => {
      expect(keepAlnum('be 0123.456-749', 14)).toBe('BE0123456749');
    });

    it('caps the value at maxLength', () => {
      expect(keepAlnum('abcdef', 4)).toBe('ABCD');
    });

    it('returns an empty string for null/undefined', () => {
      expect(keepAlnum(null, 10)).toBe('');
      expect(keepAlnum(undefined, 10)).toBe('');
    });
  });

  describe('isAlnum', () => {
    it('accepts letters (any case) and digits', () => {
      expect(isAlnum('b')).toBe(true);
      expect(isAlnum('Z')).toBe(true);
      expect(isAlnum('7')).toBe(true);
    });

    it('rejects separators and the empty string', () => {
      expect(isAlnum('.')).toBe(false);
      expect(isAlnum(' ')).toBe(false);
      expect(isAlnum('')).toBe(false);
    });
  });

  describe('countAlnum', () => {
    it('counts only the alphanumeric characters', () => {
      expect(countAlnum('BE 0123.456.749')).toBe(12);
      expect(countAlnum(' ..-- ')).toBe(0);
    });
  });

  describe('groupBySizes', () => {
    it('splits along the sizes with muted separators', () => {
      expect(groupBySizes('0123456749', [4, 3, 3], '.')).toEqual([
        { text: '0123', muted: false },
        { text: '.', muted: true },
        { text: '456', muted: false },
        { text: '.', muted: true },
        { text: '749', muted: false },
      ]);
    });

    it('formats a short value as far as it goes', () => {
      expect(segmentsToText(groupBySizes('01234', [4, 3, 3], '.'))).toBe('0123.4');
    });

    it('glues the surplus of a too-long value at the end', () => {
      expect(segmentsToText(groupBySizes('012345674999', [4, 3, 3], '.'))).toBe('0123.456.74999');
    });
  });

  describe('groupByChunks', () => {
    it('splits into fixed groups, greying the head characters', () => {
      const segments = groupByChunks('BE68539007547034', 4, ' ', 2);
      expect(segments[0]).toEqual({ text: 'BE', muted: true });
      expect(segments[1]).toEqual({ text: '68', muted: false });
      expect(segments[2]).toEqual({ text: ' ', muted: true });
      expect(segmentsToText(segments)).toBe('BE68 5390 0754 7034');
    });

    it('keeps separators on the grid of the full code', () => {
      expect(segmentsToText(groupByChunks('BE685390075', 4, ' '))).toBe('BE68 5390 075');
    });
  });

  describe('segmentsToText', () => {
    it('round-trips: the flattened text matches the original with separators', () => {
      const canonical = 'BE0123456749';
      const segments = groupBySizes(canonical, [2, 4, 3, 3], '.');
      expect(segmentsToText(segments).replace(/\./g, '')).toBe(canonical);
    });
  });

});
