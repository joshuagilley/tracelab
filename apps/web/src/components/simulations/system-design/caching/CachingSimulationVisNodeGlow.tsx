export function CachingSimulationVisNodeGlow({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={8}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1}
      opacity={0.3}
      style={{ filter: 'blur(3px)' }}
    />
  )
}
