// Carbon Design System sequential purple ramp (light lavender -> deep indigo).
const PURPLE_STOPS = [
  '#f6f2ff',
  '#e8daff',
  '#d4bbff',
  '#be95ff',
  '#a56eff',
  '#8a3ffc',
  '#6929c4',
  '#491d8b',
  '#31135e',
]

export const EMPTY_CELL_COLOR = '#faf9fc'

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** t in [0, 1] -> a color along the purple ramp. */
export function purpleRamp(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (PURPLE_STOPS.length - 1)
  const i = Math.floor(scaled)
  const frac = scaled - i
  const a = hexToRgb(PURPLE_STOPS[Math.min(i, PURPLE_STOPS.length - 1)])
  const b = hexToRgb(PURPLE_STOPS[Math.min(i + 1, PURPLE_STOPS.length - 1)])
  const mixed: [number, number, number] = [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ]
  return rgbToHex(mixed)
}

/**
 * Map a raw value against a max into a cell color. Zero is a distinct
 * near-white "empty" so absence never gets confused with a low-purple value.
 * A gamma < 1 boosts mid/low values so the ramp doesn't read as all-white.
 */
export function valueColor(value: number, max: number, gamma = 0.62): string {
  if (value <= 0 || max <= 0) return EMPTY_CELL_COLOR
  const t = Math.pow(Math.min(1, value / max), gamma)
  return purpleRamp(t)
}

export function cssGradient(): string {
  return `linear-gradient(to right, ${PURPLE_STOPS.join(', ')})`
}

/** Log-scaled color against a single global max, for the Absolute color mode. */
export function valueColorLog(value: number, max: number): string {
  if (value <= 0 || max <= 0) return EMPTY_CELL_COLOR
  const t = Math.log10(value + 1) / Math.log10(max + 1)
  return purpleRamp(Math.min(1, t))
}

/** Perceived luminance, to pick readable text color against a cell fill. */
export function readableTextColor(bgHex: string): string {
  const n = parseInt(bgHex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#3f2d63' : '#ffffff'
}
