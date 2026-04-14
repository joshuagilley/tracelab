import type { S3Geom } from '@/components/simulations/design-patterns/dependencyInjectionSimulationRoute'

function bucketPath(x: number, y: number, w: number, h: number) {
  return `M ${x} ${y + 14} Q ${x + w / 2} ${y - 4} ${x + w} ${y + 14} L ${x + w} ${y + h - 8} Q ${x + w / 2} ${y + h + 4} ${x} ${y + h - 8} Z`
}

type Line = { y: number; size: number; weight?: number; fill: string; text: string }

export function DiDiagramS3Top({
  uid,
  s3Top,
  active,
  emphasizeIface,
}: {
  uid: string
  s3Top: S3Geom
  active: boolean
  emphasizeIface: boolean
}) {
  const cx = s3Top.x + s3Top.w / 2
  const lines: Line[] = [
    { y: 38, size: 11, weight: 600, fill: 'var(--text-primary)', text: 'S3 bucket A' },
    { y: 54, size: 8, fill: 'var(--text-muted)', text: 'via SFTP bridge' },
    { y: 70, size: 8, fill: 'var(--color-info)', text: 'creds: SFTP' },
    { y: 82, size: 8, fill: 'var(--color-info)', text: 'host key + user' },
  ]
  return (
    <g opacity={active ? 1 : 0.38}>
      <path
        d={bucketPath(s3Top.x, s3Top.y, s3Top.w, s3Top.h)}
        fill={`url(#${uid}-s3top)`}
        stroke={active ? 'var(--color-info)' : 'var(--border)'}
        strokeWidth={active ? 2.2 : 1.2}
        filter={active && emphasizeIface ? `url(#${uid}-glow)` : undefined}
      />
      {lines.map((ln, i) => (
        <text
          key={i}
          x={cx}
          y={s3Top.y + ln.y}
          textAnchor="middle"
          fill={ln.fill}
          fontSize={ln.size}
          fontFamily="var(--font-mono)"
          fontWeight={ln.weight}
        >
          {ln.text}
        </text>
      ))}
    </g>
  )
}

export function DiDiagramS3Bottom({
  uid,
  s3Bot,
  active,
  emphasizeIface,
}: {
  uid: string
  s3Bot: S3Geom
  active: boolean
  emphasizeIface: boolean
}) {
  const cx = s3Bot.x + s3Bot.w / 2
  const lines: Line[] = [
    { y: 38, size: 11, weight: 600, fill: 'var(--text-primary)', text: 'S3 bucket B' },
    { y: 54, size: 8, fill: 'var(--text-muted)', text: 'via WebDAV gateway' },
    { y: 70, size: 8, fill: 'var(--color-easy)', text: 'creds: WebDAV' },
    { y: 82, size: 8, fill: 'var(--color-easy)', text: 'token + path' },
  ]
  return (
    <g opacity={active ? 1 : 0.38}>
      <path
        d={bucketPath(s3Bot.x, s3Bot.y, s3Bot.w, s3Bot.h)}
        fill={`url(#${uid}-s3bot)`}
        stroke={active ? 'var(--color-easy)' : 'var(--border)'}
        strokeWidth={active ? 2.2 : 1.2}
        filter={active && emphasizeIface ? `url(#${uid}-glow)` : undefined}
      />
      {lines.map((ln, i) => (
        <text
          key={i}
          x={cx}
          y={s3Bot.y + ln.y}
          textAnchor="middle"
          fill={ln.fill}
          fontSize={ln.size}
          fontFamily="var(--font-mono)"
          fontWeight={ln.weight}
        >
          {ln.text}
        </text>
      ))}
    </g>
  )
}
