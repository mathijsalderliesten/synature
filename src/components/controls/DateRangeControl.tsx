import { fromInputDate, getPresets, matchPreset, toInputDate } from '../../lib/dateRange'
import { Popover } from '../Popover'
import { ControlPillButton } from './ControlPillButton'

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function DateRangeControl({
  start,
  end,
  onChange,
}: {
  start: number
  end: number
  onChange: (start: number, end: number) => void
}) {
  const presets = getPresets()
  const activePreset = matchPreset(start, end)
  const value = `${dateFmt.format(start)} – ${dateFmt.format(end)}`

  return (
    <Popover
      trigger={(open) => (
        <ControlPillButton
          label="Dates"
          value={value}
          open={open}
          icon={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-neutral-400">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }
        />
      )}
    >
      {() => (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.start, p.end)}
                className={`rounded-md px-2 py-1 text-left text-xs ${
                  activePreset === p.id
                    ? 'bg-violet-50 font-medium text-violet-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="border-t border-neutral-100 pt-2">
            <p className="mb-1.5 text-[11px] font-medium text-neutral-400">Custom range</p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={toInputDate(start)}
                max={toInputDate(end)}
                onChange={(e) => onChange(fromInputDate(e.target.value), end)}
                className="w-full rounded-md border border-neutral-200 px-1.5 py-1 text-xs text-neutral-700"
              />
              <span className="text-neutral-300">–</span>
              <input
                type="date"
                value={toInputDate(end)}
                min={toInputDate(start)}
                onChange={(e) => onChange(start, fromInputDate(e.target.value, true))}
                className="w-full rounded-md border border-neutral-200 px-1.5 py-1 text-xs text-neutral-700"
              />
            </div>
          </div>
        </div>
      )}
    </Popover>
  )
}
