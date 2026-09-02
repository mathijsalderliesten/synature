import { SearchJump } from './SearchJump'
import { ToggleSwitch } from './controls/ToggleSwitch'

export function RowToolbar({
  showCounts,
  onToggleShowCounts,
  hideRareEnabled,
  onToggleHideRare,
  hideRareThreshold,
  hiddenRareCount,
  onJump,
}: {
  showCounts: boolean
  onToggleShowCounts: () => void
  hideRareEnabled: boolean
  onToggleHideRare: () => void
  hideRareThreshold: number
  hiddenRareCount: number
  onJump: (speciesId: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SearchJump onJump={onJump} />
      <ToggleSwitch checked={showCounts} onChange={onToggleShowCounts} label="Show counts" />
      <div className="flex items-center gap-1">
        <ToggleSwitch
          checked={hideRareEnabled}
          onChange={onToggleHideRare}
          label={`Hide rare (<${hideRareThreshold})`}
        />
        {hideRareEnabled && hiddenRareCount > 0 && (
          <span className="text-[10px] text-neutral-400">({hiddenRareCount} hidden)</span>
        )}
      </div>
    </div>
  )
}
