import type { Site } from '../../data/types'
import { Popover } from '../Popover'
import { ControlPillButton } from './ControlPillButton'

export function SitesControl({
  sites,
  selectedSiteIds,
  onToggleSite,
  onSetAll,
  groupByHabitat,
  onToggleGroupByHabitat,
}: {
  sites: Site[]
  selectedSiteIds: Set<string>
  onToggleSite: (id: string) => void
  onSetAll: (on: boolean) => void
  groupByHabitat: boolean
  onToggleGroupByHabitat: () => void
}) {
  const value = selectedSiteIds.size === sites.length ? `All ${sites.length}` : `${selectedSiteIds.size} selected`

  return (
    <Popover
      align="right"
      trigger={(open) => <ControlPillButton label="Sites" value={value} open={open} />}
    >
      {() => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-400">
              {selectedSiteIds.size} of {sites.length} selected
            </span>
            <div className="flex gap-2 text-[11px]">
              <button type="button" className="text-violet-600 hover:underline" onClick={() => onSetAll(true)}>
                All
              </button>
              <button type="button" className="text-violet-600 hover:underline" onClick={() => onSetAll(false)}>
                None
              </button>
            </div>
          </div>
          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {sites.map((site) => (
              <label
                key={site.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={selectedSiteIds.has(site.id)}
                  onChange={() => onToggleSite(site.id)}
                  className="accent-violet-600"
                />
                <span className="flex-1">{site.name}</span>
                <span className="text-[10px] text-neutral-400">{site.habitat}</span>
              </label>
            ))}
          </div>
          <label className="mt-1 flex cursor-pointer items-center gap-2 border-t border-neutral-100 pt-2 text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={groupByHabitat}
              onChange={onToggleGroupByHabitat}
              className="accent-violet-600"
            />
            Group columns by habitat
          </label>
        </div>
      )}
    </Popover>
  )
}
