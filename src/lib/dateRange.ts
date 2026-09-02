import { detectionWindow } from '../data/detections'

const DAY_MS = 24 * 60 * 60 * 1000

export interface DateRangePreset {
  id: string
  label: string
  start: number
  end: number
}

export function getPresets(): DateRangePreset[] {
  const end = detectionWindow.end
  return [
    { id: '7d', label: 'Last 7 days', start: end - 7 * DAY_MS, end },
    { id: '30d', label: 'Last 30 days', start: end - 30 * DAY_MS, end },
    { id: '90d', label: 'Last 3 months', start: detectionWindow.start, end },
  ]
}

export function matchPreset(start: number, end: number): string | null {
  const presets = getPresets()
  for (const p of presets) {
    if (Math.abs(p.start - start) < DAY_MS / 2 && Math.abs(p.end - end) < DAY_MS / 2) return p.id
  }
  return null
}

export function toInputDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

export function fromInputDate(s: string, endOfDay = false): number {
  const t = new Date(s + (endOfDay ? 'T23:59:59' : 'T00:00:00')).getTime()
  return Number.isNaN(t) ? Date.now() : t
}
