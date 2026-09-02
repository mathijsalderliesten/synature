import { cssGradient } from '../lib/color'

export function HeatmapLegend() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Detections</span>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
          Relative — within each taxon
        </span>
      </div>
      <div
        className="h-2.5 w-52 rounded-full"
        style={{ background: cssGradient() }}
        role="img"
        aria-label="Purple gradient legend, light for low values, dark for high values"
      />
      <div className="flex w-52 justify-between text-[11px] text-neutral-400">
        <span>0%</span>
        <span>100% of this taxon&apos;s peak</span>
      </div>
      <p className="mt-0.5 text-[11px] italic text-neutral-400">Detections, not abundance.</p>
    </div>
  )
}
