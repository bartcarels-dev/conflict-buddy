/** Cross-language "you gave / returned" agency — preserve in rewrites. */

export const AGENCY_GAVE: { test: RegExp; preserve: RegExp; label: string }[] = [
  { test: /\bje\s+gaf\b/i, preserve: /\bje\s+gaf\b/i, label: 'je gaf' },
  { test: /\byou\s+gave\b/i, preserve: /\byou\s+gave\b/i, label: 'you gave' },
  {
    test: /\bdu\s+hast\b.+\b(zurückgegeben|gegeben)\b/i,
    preserve: /\bdu\s+hast\b/i,
    label: 'du hast',
  },
  {
    test: /\bdu\s+gabst\b/i,
    preserve: /\bdu\s+gabst\b/i,
    label: 'du gabst',
  },
  {
    test: /\btu\s+as\s+(rendu|donné)\b/i,
    preserve: /\btu\s+as\s+(rendu|donné)\b/i,
    label: 'tu as rendu/donné',
  },
  {
    test: /\bdevolviste\b/i,
    preserve: /\bdevolviste\b/i,
    label: 'devolviste',
  },
  {
    test: /\bdevolveste\b/i,
    preserve: /\bdevolveste\b/i,
    label: 'devolveste',
  },
  {
    test: /\btu\s+me\s+(diste|has\s+dado)\b/i,
    preserve: /\btu\s+me\s+(diste|has\s+dado)\b/i,
    label: 'tu me diste/has dado',
  },
  {
    test: /\b(você|voce)\s+me\s+(deu|devolveu)\b/i,
    preserve: /\b(você|voce)\s+me\s+(deu|devolveu)\b/i,
    label: 'você me deu/devolveu',
  },
];

export function findAgencyGave(input: string) {
  return AGENCY_GAVE.find(({ test }) => test.test(input));
}
