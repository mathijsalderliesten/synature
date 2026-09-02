export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    Math.round(n),
  )
}
