import { useCallback, useEffect, useId, useRef, useState } from "react";
import DependencyInjectionInfoModal from "./DependencyInjectionInfoModal";
import styles from "./DependencyInjectionVisualizer.module.css";

export type StorageBackend = "sftp" | "webdav" | "mock";

export interface DIStats {
  uploadsCompleted: number;
  putCalls: number;
  wires: number;
}

interface Props {
  isRunning: boolean;
  onToggleRun: () => void;
  handlerCount: number;
  spawnIntervalMs: number;
  storageBackend: StorageBackend;
  stressMode: boolean;
  emphasizeIface: boolean;
  onStatsChange: (s: DIStats) => void;
}

interface Particle {
  id: number;
  t: number;
  handlerIndex: number;
}

const PATH_SPEED = 0.78;

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}

function posAlongPolyline(points: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  const n = points.length;
  const floatSeg = Math.min(Math.max(t, 0), 1) * (n - 1);
  const seg = Math.min(Math.floor(floatSeg), n - 2);
  const u = floatSeg - seg;
  return {
    x: lerp(points[seg].x, points[seg + 1].x, u),
    y: lerp(points[seg].y, points[seg + 1].y, u),
  };
}

function particleDoneColor(b: StorageBackend): string {
  switch (b) {
    case "mock":
      return "var(--color-medium)";
    case "webdav":
      return "var(--color-easy)";
    default:
      return "var(--color-info)";
  }
}

type BlackGeom = { x: number; y: number; w: number; h: number; cx: number; right: number };
type UplGeom = { x: number; y: number; w: number; h: number; cx: number; cy: number };
type S3Geom = { x: number; y: number; w: number; h: number };

/** Build route: jobs → IngestService (left edge) → injected uploader (inside) → exit → destination */
function routePoints(
  backend: StorageBackend,
  handlerIndex: number,
  leftCx: number,
  midY: number,
  handlerY: (i: number) => number,
  black: BlackGeom,
  upl: UplGeom,
  s3Top: S3Geom,
  s3Bot: S3Geom,
  mockSink: { x: number; y: number },
): { x: number; y: number }[] {
  const iSafe = Math.min(Math.max(0, handlerIndex), 7);
  const p0 = { x: leftCx + 48, y: handlerY(iSafe) };
  const pEnter = { x: black.x, y: midY };
  const pInUpl = { x: upl.cx, y: upl.cy };
  const pExit = { x: black.right, y: midY };

  if (backend === "mock") {
    return [p0, pEnter, pInUpl, pExit, mockSink];
  }
  if (backend === "webdav") {
    const dest = { x: s3Bot.x + s3Bot.w / 2, y: s3Bot.y + 48 };
    return [p0, pEnter, pInUpl, pExit, dest];
  }
  const dest = { x: s3Top.x + s3Top.w / 2, y: s3Top.y + 48 };
  return [p0, pEnter, pInUpl, pExit, dest];
}

export default function DependencyInjectionVisualizer({
  isRunning,
  onToggleRun,
  handlerCount,
  spawnIntervalMs,
  storageBackend,
  stressMode,
  emphasizeIface,
  onStatsChange,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const m2 = `${uid}-di-arr`;

  const [particles, setParticles] = useState<Particle[]>([]);
  const [wirePulse, setWirePulse] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const nextId = useRef(0);
  const statsRef = useRef<DIStats>({ uploadsCompleted: 0, putCalls: 0, wires: 0 });
  const spawnIntervalRef = useRef(spawnIntervalMs);
  const stressRef = useRef(stressMode);
  const nRef = useRef(Math.max(1, Math.min(8, Math.round(handlerCount))));
  const prevBackendRef = useRef<StorageBackend>(storageBackend);
  const rafRef = useRef<number>(0);

  spawnIntervalRef.current = Math.max(120, spawnIntervalMs);
  stressRef.current = stressMode;
  nRef.current = Math.max(1, Math.min(8, Math.round(handlerCount)));

  const resetStats = useCallback(() => {
    statsRef.current = { uploadsCompleted: 0, putCalls: 0, wires: 0 };
    setParticles([]);
    onStatsChange({ ...statsRef.current });
  }, [onStatsChange]);

  useEffect(() => {
    if (!isRunning) {
      prevBackendRef.current = storageBackend;
      return;
    }
    if (prevBackendRef.current === storageBackend) return;
    prevBackendRef.current = storageBackend;
    statsRef.current.wires++;
    onStatsChange({ ...statsRef.current });
    setWirePulse(true);
    const tid = window.setTimeout(() => setWirePulse(false), 420);
    return () => clearTimeout(tid);
  }, [storageBackend, isRunning, onStatsChange]);

  useEffect(() => {
    if (!isRunning) {
      resetStats();
      return;
    }

    resetStats();
    statsRef.current.wires = 1;
    onStatsChange({ ...statsRef.current });

    let last = performance.now();
    let spawnAcc = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;
      const n = nRef.current;
      const interval = spawnIntervalRef.current * (stressRef.current ? 0.52 : 1);

      setParticles((prev) => {
        const completed: Particle[] = [];
        const moved = prev
          .map((p) => {
            const nt = p.t + PATH_SPEED * dt;
            if (nt >= 1) {
              completed.push(p);
              return null;
            }
            return { ...p, t: nt };
          })
          .filter((x): x is Particle => x !== null);

        for (const _ of completed) {
          statsRef.current.uploadsCompleted++;
          statsRef.current.putCalls++;
          onStatsChange({ ...statsRef.current });
        }

        spawnAcc += dt * 1000;
        let extra: Particle[] = [];
        while (spawnAcc >= interval) {
          spawnAcc -= interval;
          const hi = stressRef.current ? Math.floor(Math.random() * n) : Math.floor((now / 260) % n);
          extra.push({
            id: nextId.current++,
            t: 0,
            handlerIndex: hi,
          });
        }

        return [...moved, ...extra];
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, resetStats, onStatsChange]);

  const n = nRef.current;
  const vbH = Math.max(360, 56 + n * 48 + 72);
  const vbW = 900;
  const midY = vbH / 2 + 6;
  const leftCx = 72;

  const handlerY = (i: number) => {
    if (n <= 1) return midY;
    const top = 60;
    const bot = vbH - 60;
    return top + (i / (n - 1)) * (bot - top);
  };

  const labels = ["Job A", "Job B", "Job C", "Job D", "Job E", "Job F", "Job G", "Job H"];
  const doneCol = particleDoneColor(storageBackend);

  /** Geometry: IngestService box centered on midY; uploader field + chip on midY */
  const blackH = 120;
  const blackY = midY - blackH / 2;
  const black: BlackGeom = {
    x: 198,
    y: blackY,
    w: 312,
    h: blackH,
    cx: 198 + 312 / 2,
    right: 198 + 312,
  };
  const upl: UplGeom = {
    w: 132,
    h: 44,
    x: black.x + 166,
    y: midY - 22,
    cx: black.x + 166 + 66,
    cy: midY,
  };
  const s3Top = { x: 668, y: midY - 122, w: 112, h: 106 };
  const s3Bot = { x: 668, y: midY + 22, w: 112, h: 106 };
  const mockSink = { x: 712, y: midY };

  const activeSftp = storageBackend === "sftp";
  const activeWebdav = storageBackend === "webdav";
  const activeMock = storageBackend === "mock";

  return (
    <div className={`panel ${styles.panel}`}>
      <DependencyInjectionInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <div className="panel-header">
        <div className={styles.headerLeft}>
          <span className="panel-label">Pattern Visualizer</span>
          <button
            type="button"
            className={styles.infoBtn}
            onClick={() => setInfoOpen(true)}
            title="About this lesson: IngestService struct, injected ObjectUploader, SaveExport"
            aria-label="About Dependency Injection"
          >
            i
          </button>
        </div>
        <div className={styles.headerRight}>
          <div className="status-dot">
            <span className={`dot ${isRunning ? "live" : ""}`} />
            <span>{isRunning ? "SIMULATION LIVE" : "READY"}</span>
          </div>
          <button
            type="button"
            className={[styles.runBtn, isRunning ? styles.runBtnActive : ""].join(" ")}
            onClick={onToggleRun}
          >
            <span>{isRunning ? "■" : "▶"}</span>
            {isRunning ? "STOP" : "EXECUTE SIMULATION"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.vizViewport}>
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className={styles.svg} aria-hidden>
            <defs>
              <marker id={m2} markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
              </marker>
              <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id={`${uid}-s3top`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id={`${uid}-s3bot`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-easy)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-easy)" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Left: upload jobs */}
            {Array.from({ length: n }, (_, i) => (
              <g key={`job-${i}`}>
                <rect
                  x={32}
                  y={handlerY(i) - 22}
                  width={92}
                  height={44}
                  rx={8}
                  fill="var(--bg-elevated)"
                  stroke="var(--border)"
                  className={isRunning ? styles.handlerGlow : ""}
                />
                <text
                  x={78}
                  y={handlerY(i) + 5}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                >
                  {labels[i] ?? `Job ${i + 1}`}
                </text>
              </g>
            ))}

            {/* Two S3 buckets (right) — distinct creds per path */}
            <g opacity={activeSftp ? 1 : 0.38}>
              <path
                d={`M ${s3Top.x} ${s3Top.y + 14} Q ${s3Top.x + s3Top.w / 2} ${s3Top.y - 4} ${s3Top.x + s3Top.w} ${s3Top.y + 14} L ${s3Top.x + s3Top.w} ${s3Top.y + s3Top.h - 8} Q ${s3Top.x + s3Top.w / 2} ${s3Top.y + s3Top.h + 4} ${s3Top.x} ${s3Top.y + s3Top.h - 8} Z`}
                fill={`url(#${uid}-s3top)`}
                stroke={activeSftp ? "var(--color-info)" : "var(--border)"}
                strokeWidth={activeSftp ? 2.2 : 1.2}
                filter={activeSftp && emphasizeIface ? `url(#${uid}-glow)` : undefined}
              />
              <text
                x={s3Top.x + s3Top.w / 2}
                y={s3Top.y + 38}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight={600}
              >
                S3 bucket A
              </text>
              <text
                x={s3Top.x + s3Top.w / 2}
                y={s3Top.y + 54}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                via SFTP bridge
              </text>
              <text
                x={s3Top.x + s3Top.w / 2}
                y={s3Top.y + 70}
                textAnchor="middle"
                fill="var(--color-info)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                creds: SFTP
              </text>
              <text
                x={s3Top.x + s3Top.w / 2}
                y={s3Top.y + 82}
                textAnchor="middle"
                fill="var(--color-info)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                host key + user
              </text>
            </g>

            <g opacity={activeWebdav ? 1 : 0.38}>
              <path
                d={`M ${s3Bot.x} ${s3Bot.y + 14} Q ${s3Bot.x + s3Bot.w / 2} ${s3Bot.y - 4} ${s3Bot.x + s3Bot.w} ${s3Bot.y + 14} L ${s3Bot.x + s3Bot.w} ${s3Bot.y + s3Bot.h - 8} Q ${s3Bot.x + s3Bot.w / 2} ${s3Bot.y + s3Bot.h + 4} ${s3Bot.x} ${s3Bot.y + s3Bot.h - 8} Z`}
                fill={`url(#${uid}-s3bot)`}
                stroke={activeWebdav ? "var(--color-easy)" : "var(--border)"}
                strokeWidth={activeWebdav ? 2.2 : 1.2}
                filter={activeWebdav && emphasizeIface ? `url(#${uid}-glow)` : undefined}
              />
              <text
                x={s3Bot.x + s3Bot.w / 2}
                y={s3Bot.y + 38}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight={600}
              >
                S3 bucket B
              </text>
              <text
                x={s3Bot.x + s3Bot.w / 2}
                y={s3Bot.y + 54}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                via WebDAV gateway
              </text>
              <text
                x={s3Bot.x + s3Bot.w / 2}
                y={s3Bot.y + 70}
                textAnchor="middle"
                fill="var(--color-easy)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                creds: WebDAV
              </text>
              <text
                x={s3Bot.x + s3Bot.w / 2}
                y={s3Bot.y + 82}
                textAnchor="middle"
                fill="var(--color-easy)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                token + path
              </text>
            </g>

            {/* Jobs → IngestService (draw under the service shell) */}
            {Array.from({ length: n }, (_, i) => (
              <path
                key={`in-${i}`}
                d={`M ${leftCx + 48} ${handlerY(i)} L ${black.x} ${midY}`}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="5 4"
                fill="none"
                opacity={0.35}
              />
            ))}

            {/* IngestService struct; uploader ObjectUploader injected; SaveExport delegates to Put */}
            <rect
              x={black.x}
              y={black.y}
              width={black.w}
              height={black.h}
              rx={14}
              className={styles.blackBox}
              stroke="var(--accent)"
              strokeWidth={2}
            />
            <text
              x={black.cx}
              y={black.y + 22}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize={12}
              fontFamily="var(--font-mono)"
              fontWeight={700}
            >
              IngestService
            </text>
            <text
              x={black.x + 14}
              y={midY + 5}
              textAnchor="start"
              fill="var(--text-secondary)"
              fontSize={9}
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              uploader ObjectUploader
            </text>

            <rect
              x={upl.x}
              y={upl.y}
              width={upl.w}
              height={upl.h}
              rx={8}
              fill="var(--bg-elevated)"
              stroke={
                wirePulse
                  ? "var(--color-medium)"
                  : activeSftp
                    ? "var(--color-info)"
                    : activeWebdav
                      ? "var(--color-easy)"
                      : "var(--color-medium)"
              }
              strokeWidth={wirePulse ? 2.5 : 2}
              className={wirePulse ? styles.boxFlash : ""}
            />
            <text
              x={upl.cx}
              y={upl.y + 19}
              textAnchor="middle"
              fill={activeSftp ? "var(--color-info)" : activeWebdav ? "var(--color-easy)" : "var(--color-medium)"}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              {activeSftp ? "SFTPUploader" : activeWebdav ? "WebDAVUploader" : "MockUploader"}
            </text>
            <text
              x={upl.cx}
              y={upl.y + 34}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={7}
              fontFamily="var(--font-mono)"
            >
              {storageBackend === "sftp"
                ? "SSH · bucket A"
                : storageBackend === "webdav"
                  ? "token · bucket B"
                  : "no remote keys"}
            </text>

            {/* Exit IngestService → storage (follows active uploader) */}
            <path
              d={`M ${black.right} ${midY} L ${s3Top.x} ${s3Top.y + 48}`}
              stroke="var(--color-info)"
              strokeWidth={activeSftp ? 2 : 1}
              opacity={activeSftp ? 0.85 : 0.15}
              fill="none"
              markerEnd={activeSftp ? `url(#${m2})` : undefined}
            />
            <path
              d={`M ${black.right} ${midY} L ${s3Bot.x} ${s3Bot.y + 48}`}
              stroke="var(--color-easy)"
              strokeWidth={activeWebdav ? 2 : 1}
              opacity={activeWebdav ? 0.85 : 0.15}
              fill="none"
              markerEnd={activeWebdav ? `url(#${m2})` : undefined}
            />
            <path
              d={`M ${black.right} ${midY} L ${mockSink.x} ${mockSink.y}`}
              stroke="var(--color-medium)"
              strokeWidth={activeMock ? 2 : 1}
              opacity={activeMock ? 0.85 : 0.18}
              strokeDasharray="6 4"
              fill="none"
            />
            <text
              x={mockSink.x + 36}
              y={midY + 4}
              textAnchor="middle"
              fill="var(--color-medium)"
              fontSize={9}
              fontFamily="var(--font-mono)"
              opacity={activeMock ? 1 : 0.3}
            >
              mock: RAM only
            </text>

            {particles.map((p) => {
              const pts = routePoints(
                storageBackend,
                p.handlerIndex,
                leftCx,
                midY,
                handlerY,
                black,
                upl,
                s3Top,
                s3Bot,
                mockSink,
              );
              const { x, y } = posAlongPolyline(pts, p.t);
              const phase = p.t;
              let col = "var(--accent)";
              if (phase >= 0.35 && phase < 0.72) col = "var(--text-secondary)";
              if (phase >= 0.72) col = doneCol;
              return (
                <circle key={p.id} cx={x} cy={y} r={5} fill={col} style={{ filter: `drop-shadow(0 0 5px ${col})` }} />
              );
            })}
          </svg>
        </div>
        <p className={styles.diagramNote}>
          <code>IngestService</code> holds an <code>uploader ObjectUploader</code> field; <code>SaveExport</code> calls{' '}
          <code>s.uploader.Put</code>. <code>NewIngestService(u)</code> injects the concrete uploader. Good:{' '}
          <code>present.go</code>. Bad: <code>bad.go</code>.
        </p>
      </div>
    </div>
  );
}
