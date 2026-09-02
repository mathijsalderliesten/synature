import type { ColorMode } from '../hooks/useHeatmapState'
import { cssGradient } from '../lib/color'
import { formatCompact } from '../lib/format'

const MODES: { id: ColorMode; label: string }[] = [
  { id: 'relative', label: 'Relative — within each taxon' },
  { id: 'absolute', label: 'Absolute — across all taxa' },
]

export function HeatmapLegend({
  mode,
  onModeChange,
  globalMax,
}: {
  mode: ColorMode
  onModeChange: (mode: ColorMode) => void
  globalMax: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Detections</span>
        <div className="flex rounded-full bg-neutral-100 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                mode === m.id ? 'bg-violet-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className="h-2.5 w-56 rounded-full"
        style={{ background: cssGradient() }}
        role="img"
        aria-label="Purple gradient legend, light for low values, dark for high values"
      />
      <div className="flex w-56 justify-between text-[11px] text-neutral-400">
        {mode === 'relative' ? (
          <>
            <span>0%</span>
            <span>100% of this taxon&apos;s peak</span>
          </>
        ) : (
          <>
            <span>0</span>
            <span>{formatCompact(globalMax / 10)}</span>
            <span>{formatCompact(globalMax)} (log scale)</span>
          </>
        )}
      </div>
      <p className="mt-0.5 text-[11px] italic text-neutral-400">Detections, not abundance.</p>
    </div>
  )
}
