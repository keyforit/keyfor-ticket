// Palette colori in stile Business Central / Fluent UI
const BC_PALETTE = [
  '#009B9B', // teal
  '#0078D4', // blue
  '#D83B01', // orange-red
  '#5C2D91', // purple
  '#107C10', // green
  '#FFB900', // yellow
  '#A4262C', // dark red
  '#038387', // cyan
  '#8764B8', // lavender
  '#986F0B', // amber
  '#498205', // lime green
  '#00B7C3', // light teal
]

/**
 * Restituisce un colore deterministico dalla palette BC
 * basato sull'hash della stringa `code` del template.
 * Lo stesso codice restituisce sempre lo stesso colore.
 */
export function getRequestTypeColor(code: string | undefined): string {
  if (!code) return BC_PALETTE[0]
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  }
  return BC_PALETTE[hash % BC_PALETTE.length]
}
