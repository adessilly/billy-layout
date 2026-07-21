// ═══════════════════════════════════════════════════════════════════════════
// Common foundation for "codes" that are typed then read back (VAT numbers,
// IBANs).
//
// A canonical value: compact, uppercase, no separator or space
// ("BE0123456749"). It — and it alone — is what goes to the backend.
//
// A segmented rendering: the value split into fragments that either carry
// the information (the digits) or only aid readability (the country prefix,
// the dots, the spaces). The latter are marked `muted`, which lets them be
// greyed out on display without every component replaying the split.
// ═══════════════════════════════════════════════════════════════════════════

/** Rendering fragment. `muted`: country prefix or separator → shown in grey. */
export interface CodeSegment {
  text: string;
  muted: boolean;
}

/**
 * Status of a code.
 * - `partial`    : still being typed, too short to judge
 * - `unverified` : well-formed structure, but no known check digit for this
 *                  country (we do not make up an error)
 * - `valid`      : check digit verified
 */
export type CodeStatus = 'empty' | 'partial' | 'invalid' | 'unverified' | 'valid';

/** Full diagnostic of a code, ready to be shown under the field. */
export interface CodeInfo {
  status: CodeStatus;
  /** Detected ISO country code ("BE"), or null while not yet typed. */
  country: string | null;
  /** Country name, or null if the country is not listed. */
  countryLabel: string | null;
  /** Short message shown under the field. */
  message: string;
  /** Typing progress (0 → 1), for the progress ring. */
  progress: number;
}

const ALNUM = /[A-Z0-9]/;

export function isAlnum(char: string): boolean {
  return !!char && ALNUM.test(char.toUpperCase());
}

/**
 * Reduces an input (or a value coming from the backend) to its canonical
 * form: uppercase, [A-Z0-9] only, truncated to `maxLength`. Everything else —
 * dots, spaces, dashes, accented letters, symbols — is ignored.
 */
export function keepAlnum(raw: string | null | undefined, maxLength: number): string {
  return (raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength);
}

export function countAlnum(text: string): number {
  let count = 0;
  for (const char of text) {
    if (isAlnum(char)) { count++; }
  }
  return count;
}

/**
 * Appends a segment, merging it with the previous one when they share the
 * same tint: "BE" + "68" stay two segments (greyed country, normal check),
 * but two consecutive digits become one. Keeps the DOM minimal.
 */
function push(segments: CodeSegment[], text: string, muted: boolean): void {
  const last = segments[segments.length - 1];
  if (last && last.muted === muted) {
    last.text += text;
  } else {
    segments.push({ text, muted });
  }
}

/**
 * Splits along variable group sizes (VAT: 4.3.3 in Belgium).
 * Tolerant by construction: a value that is too short is split as far as it
 * goes (so the input formats itself while typing), a value that is too long
 * gets its surplus glued at the end rather than truncated.
 */
export function groupBySizes(body: string, sizes: number[], separator: string): CodeSegment[] {
  const segments: CodeSegment[] = [];
  let offset = 0;

  for (const size of sizes) {
    if (offset >= body.length) { break; }
    if (offset > 0) { push(segments, separator, true); }
    push(segments, body.slice(offset, offset + size), false);
    offset += size;
  }

  if (offset < body.length) {
    push(segments, body.slice(offset), false);
  }

  return segments;
}

/**
 * Splits into fixed-size groups (IBAN: by 4), greying the first `mutedHead`
 * characters (the country code). Separators fall on the grid of the full
 * code, not on that of the remainder: "BE68 5390 0754 7034".
 */
export function groupByChunks(
  value: string, size: number, separator: string, mutedHead = 0,
): CodeSegment[] {
  const segments: CodeSegment[] = [];

  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % size === 0) { push(segments, separator, true); }
    push(segments, value[i], i < mutedHead);
  }

  return segments;
}

/** The text these segments display — the input field's mask. */
export function segmentsToText(segments: CodeSegment[]): string {
  return segments.map(segment => segment.text).join('');
}
