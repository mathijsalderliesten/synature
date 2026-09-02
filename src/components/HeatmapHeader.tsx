function ControlPill({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50"
    >
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" className="ml-0.5 text-neutral-400" fill="none">
        <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function HeatmapHeader({
  start,
  end,
  siteCount,
  totalSites,
}: {
  start: number
  end: number
  siteCount: number
  totalSites: number
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Detection heatmap</h1>
        <p className="mt-0.5 text-xs text-neutral-400">Acoustic detections by taxon &amp; site</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ControlPill label="Start" value={dateFmt.format(start)} />
        <ControlPill label="End" value={dateFmt.format(end)} />
        <ControlPill label="Status" value="Verified & Pending" />
        <ControlPill label="Sites" value={siteCount === totalSites ? `All ${totalSites}` : `${siteCount} selected`} />
      </div>
    </div>
  )
}
