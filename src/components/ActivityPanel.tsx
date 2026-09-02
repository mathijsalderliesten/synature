import type { PeriodStat } from '../lib/activity'
import { formatCount } from '../lib/format'

function DeltaBadge({ deltaPct }: { deltaPct: number | null }) {
  if (deltaPct === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
        New
      </span>
    )
  }
  const isUp = deltaPct > 0.05
  const isDown = deltaPct < -0.05
  const color = isUp
    ? 'bg-emerald-50 text-emerald-700'
    : isDown
      ? 'bg-rose-50 text-rose-700'
      : 'bg-neutral-100 text-neutral-500'
  const arrow = isUp ? '▲' : isDown ? '▼' : '–'
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      {Math.abs(deltaPct).toFixed(1)}% {arrow}
    </span>
  )
}

export function ActivityPanel({ stats }: { stats: PeriodStat[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Overall activity</h2>
      <div className="flex flex-col gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-[11px] text-neutral-400">{s.label}</span>
            <span className="text-base font-semibold text-neutral-900">{formatCount(s.count)} detections</span>
            <DeltaBadge deltaPct={s.deltaPct} />
          </div>
        ))}
      </div>
      <p className="text-[10px] leading-snug text-neutral-400">
        vs. the preceding period of equal length &middot; reflects current filters &amp; taxon scope
      </p>
    </div>
  )
}
