import type { DetectionStatus } from '../../data/types'
import { Popover } from '../Popover'
import { ControlPillButton } from './ControlPillButton'

export function StatusControl({
  statuses,
  onToggle,
}: {
  statuses: Set<DetectionStatus>
  onToggle: (status: DetectionStatus) => void
}) {
  const label =
    statuses.size === 2 ? 'Verified & Pending' : statuses.has('verified') ? 'Verified only' : 'Pending only'

  return (
    <Popover
      trigger={(open) => <ControlPillButton label="Status" value={label} open={open} />}
    >
      {() => (
        <div className="flex flex-col gap-1">
          {(['verified', 'pending'] as const).map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              <input
                type="checkbox"
                checked={statuses.has(status)}
                onChange={() => onToggle(status)}
                className="accent-violet-600"
              />
              <span className="capitalize">{status}</span>
            </label>
          ))}
        </div>
      )}
    </Popover>
  )
}
