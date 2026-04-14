import { CachingSimulationVisNodeGlow } from './CachingSimulationVisNodeGlow'

interface VisNodeProps {
  node: { x: number; y: number; w: number; h: number; label: string; sub: string }
  highlight?: boolean
}

export function CachingSimulationVisNode({ node, highlight = false }: VisNodeProps) {
  const { x, y, w, h, label, sub } = node
  const border = highlight ? 'var(--accent)' : '#2a3254'
  const bg = highlight ? 'rgba(61,232,200,0.06)' : 'var(--bg-elevated)'
  const color = highlight ? 'var(--accent)' : 'var(--text-secondary)'

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={bg} stroke={border} strokeWidth={highlight ? 1.5 : 1} />
      {highlight ? <CachingSimulationVisNodeGlow x={x} y={y} w={w} h={h} /> : null}
      <text
        x={x + w / 2}
        y={y + h / 2 - 8}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight="600"
        letterSpacing="0.05em"
      >
        {label}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 10}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        letterSpacing="0.04em"
      >
        {sub.toUpperCase()}
      </text>
    </g>
  )
}
