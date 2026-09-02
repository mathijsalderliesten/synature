import type { TaxonNode } from '../data/types'

export function Breadcrumb({
  path,
  onNavigate,
}: {
  path: TaxonNode[]
  onNavigate: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1 text-xs text-neutral-500">
      <button
        type="button"
        onClick={() => onNavigate(-1)}
        className={`rounded px-1.5 py-0.5 hover:bg-neutral-100 ${
          path.length === 0 ? 'font-medium text-neutral-900' : 'text-violet-600 hover:underline'
        }`}
      >
        All taxa
      </button>
      {path.map((node, i) => {
        const isLast = i === path.length - 1
        return (
          <span key={node.id} className="flex items-center gap-1">
            <span className="text-neutral-300">/</span>
            <button
              type="button"
              onClick={() => onNavigate(i)}
              disabled={isLast}
              className={`rounded px-1.5 py-0.5 ${
                isLast ? 'font-medium text-neutral-900' : 'text-violet-600 hover:bg-neutral-100 hover:underline'
              }`}
            >
              {node.name}
            </button>
          </span>
        )
      })}
    </div>
  )
}
