import { type ReactNode } from 'react'
import styles from './CloudArchitectureLessonPanel.module.css'

interface Props {
  summary: string
  slug: string
}

function Tradeoffs({ children }: { children: ReactNode }) {
  return (
    <div className={styles.tradeoffs}>
      <p className={styles.tradeoffsTitle}>Tradeoffs</p>
      <ul>{children}</ul>
    </div>
  )
}

export default function CloudArchitectureLessonPanel({ summary, slug }: Props) {
  const base = (
    <>
      <p className={styles.problem}>{summary}</p>
    </>
  )

  if (slug === 'vpc') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Network boundary</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="140" viewBox="0 0 300 140" aria-label="VPC with public and private subnets">
              <rect x="10" y="10" width="280" height="120" rx="8" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="150" y="28" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
                VPC 10.0.0.0/16
              </text>
              <rect x="24" y="42" width="118" height="36" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
              <text x="83" y="64" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                public subnets
              </text>
              <rect x="158" y="42" width="118" height="78" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
              <text x="217" y="62" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                private subnets
              </text>
              <text x="217" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                app + db tiers
              </text>
              <text x="150" y="8" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
                Internet → IGW → public subnets
              </text>
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> clear blast-radius boundaries and route tables per tier.
          </li>
          <li>
            <span className={styles.em}>Cost:</span> NAT gateways and more subnets to manage — worth it for anything
            serious.
          </li>
        </Tradeoffs>
        <p className={styles.bottomNote}>Compare present vs bad in the code panel for flat vs segmented layouts.</p>
      </div>
    )
  }

  if (slug === 'public-private-subnets') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Traffic paths</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="120" viewBox="0 0 300 120" aria-label="public versus private subnet traffic">
              <text x="70" y="18" textAnchor="middle" fill="var(--accent)" fontSize="10" fontWeight="600">
                Public
              </text>
              <text x="230" y="18" textAnchor="middle" fill="var(--accent)" fontSize="10" fontWeight="600">
                Private
              </text>
              <rect x="20" y="28" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
              <text x="70" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                IGW route
              </text>
              <text x="70" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                ALB / NAT
              </text>
              <rect x="180" y="28" width="100" height="72" rx="6" fill="var(--bg-base)" stroke="var(--border)" />
              <text x="230" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                no direct
              </text>
              <text x="230" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                inbound internet
              </text>
              <path d="M 130 64 L 175 64" stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" />
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> databases and internal APIs stay off the public internet path.
          </li>
          <li>
            <span className={styles.em}>Watch:</span> NAT is an operational component — monitor and size for egress.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  if (slug === 'load-balancer-l4-l7') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Request flow</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="100" viewBox="0 0 300 100" aria-label="clients through load balancer to targets">
              <text x="40" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Clients
              </text>
              <rect x="110" y="32" width="70" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="145" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
                LB
              </text>
              <text x="145" y="78" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
                L4 or L7
              </text>
              <text x="260" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Targets
              </text>
              <path d="M 80 50 L 108 50" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M 182 50 L 220 50" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>L7:</span> TLS, routing, WAF hooks — more features, slightly more latency.
          </li>
          <li>
            <span className={styles.em}>L4:</span> great for non-HTTP protocols or passing TLS through to apps.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  if (slug === 'object-storage-s3') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Access path</span>
          <div className={styles.diagramBody}>
            <svg width="280" height="90" viewBox="0 0 280 90" aria-label="application role accessing private bucket">
              <text x="50" y="50" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                App role
              </text>
              <rect x="120" y="28" width="100" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="170" y="52" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
                Bucket
              </text>
              <text x="170" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
                private
              </text>
              <path d="M 100 48 L 118 48" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> IAM-scoped access, versioning, lifecycle — no servers to patch for
            static assets.
          </li>
          <li>
            <span className={styles.em}>Risk:</span> one overly broad bucket policy can expose the world — review
            policies like code.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  if (slug === 'queue-sqs') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Async pipeline</span>
          <div className={styles.diagramBody}>
            <svg width="300" height="100" viewBox="0 0 300 100" aria-label="producer queue consumer and DLQ">
              <text x="35" y="55" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Producer
              </text>
              <rect x="75" y="32" width="56" height="36" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="103" y="54" textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="600">
                Queue
              </text>
              <text x="200" y="40" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
                Consumer
              </text>
              <rect x="165" y="52" width="70" height="28" rx="4" fill="var(--bg-subtle)" stroke="var(--border)" />
              <text x="200" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="7">
                DLQ
              </text>
              <path d="M 60 50 L 73 50" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M 133 50 L 165 50" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> smooth spikes, scale workers independently, isolate failures with a
            DLQ.
          </li>
          <li>
            <span className={styles.em}>Watch:</span> visibility timeout, idempotency, and poison messages — tune all
            three.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  if (slug === 'serverless-lambda') {
    return (
      <div className={styles.wrap}>
        {base}
        <div className={styles.diagramCard}>
          <span className={styles.diagramLabel}>Event-driven</span>
          <div className={styles.diagramBody}>
            <svg width="280" height="90" viewBox="0 0 280 90" aria-label="event triggering function">
              <text x="40" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Event
              </text>
              <rect x="95" y="28" width="90" height="40" rx="6" fill="var(--bg-base)" stroke="var(--accent)" />
              <text x="140" y="52" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">
                Function
              </text>
              <text x="245" y="52" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
                Downstream
              </text>
              <path d="M 70 48 L 92 48" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M 187 48 L 210 48" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <Tradeoffs>
          <li>
            <span className={styles.em}>Win:</span> no idle servers, fast to iterate, integrates with queues and API
            gateways.
          </li>
          <li>
            <span className={styles.em}>Watch:</span> cold starts, timeouts, and secrets — never ship keys in the
            bundle.
          </li>
        </Tradeoffs>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      {base}
      <div className={styles.diagramCard}>
        <span className={styles.diagramLabel}>Diagram</span>
        <div className={styles.diagramBody}>
          <p className={styles.bottomNote}>Visual for this topic is not wired yet.</p>
        </div>
      </div>
    </div>
  )
}
