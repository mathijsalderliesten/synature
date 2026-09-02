export function PinIcon({ active }: { active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path
        d="M8.5 1.5c-1.7 0-3 1.3-3 3 0 1.1.4 2.3 1 3.3L4 11.3v1.2h1.2l3.5-2.5c1 .6 2.2 1 3.3 1 1.7 0 3-1.3 3-3s-1.3-3-3-3c0-1.7-1.3-3-3-3z"
        fill={active ? '#7c3aed' : 'none'}
        stroke={active ? '#7c3aed' : 'currentColor'}
        strokeWidth="1.2"
        strokeLinejoin="round"
        transform="rotate(45 8 8)"
      />
    </svg>
  )
}
