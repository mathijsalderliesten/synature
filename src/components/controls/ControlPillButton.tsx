export function ControlPillButton({
  label,
  value,
  open,
  icon,
}: {
  label: string
  value: string
  open: boolean
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs shadow-sm transition-colors ${
        open ? 'border-violet-300 ring-2 ring-violet-100' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      {icon}
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" className="ml-0.5 text-neutral-400" fill="none">
        <path
          d="M2 3.5 5 6.5 8 3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
