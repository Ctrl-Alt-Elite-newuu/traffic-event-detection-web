import { useState } from 'react'
import { CLASSES, FAMILIES, classColor, classInfo } from '../lib/classes'
import { clock, timeTicks } from '../lib/format'
import type { EventRow, SignalPhase } from '../lib/types'
import { useWidth } from './useWidth'

interface Props {
  duration: number
  events: EventRow[]
  signals?: SignalPhase[]
  currentTime?: number
  onSeek?: (t: number) => void
}

const LABEL_W = 132
const ROW = 26
const SIGNAL_COLORS: Record<string, string> = {
  red: 'var(--critical)',
  yellow: 'var(--warning)',
  green: 'var(--good)',
  unknown: 'var(--grid)',
}

/** One row per class that occurs; bars are events. Click a bar or anywhere on the axis to seek. */
export function Timeline({ duration, events, signals, currentTime, onSeek }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<{ ev: EventRow; x: number; y: number } | null>(null)
  const present = CLASSES.filter((c) => events.some((e) => e[2] === c.id)).map((c) => c.id)
  const rows: string[] = [...(signals?.length ? ['__signal'] : []), ...present]
  const narrow = width < 520
  const labelW = narrow ? 96 : LABEL_W
  const w = width - labelW - 8
  const height = rows.length * ROW + 30
  const sx = (t: number) => labelW + (Math.min(t, duration) / duration) * w
  const families = [...new Set(present.map((id) => classInfo(id).family))]

  const seekFromEvent = (e: React.MouseEvent<SVGElement>) => {
    if (!onSeek) return
    const box = (e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement)).getBoundingClientRect()
    const t = ((e.clientX - box.left - labelW) / w) * duration
    if (t >= 0 && t <= duration) onSeek(t)
  }

  return (
    <div className="chart" ref={ref}>
      {families.length > 0 && (
        <div className="legend">
          {families.map((f) => (
            <span key={f}>
              <i className="swatch" style={{ background: FAMILIES[f].color }} />
              {FAMILIES[f].label}
            </span>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="muted">No events detected.</p>
      ) : (
        <svg width={width} height={height} role="img" aria-label="Event timeline">
          <rect x={labelW} y={0} width={w} height={rows.length * ROW} fill="transparent" onClick={seekFromEvent} style={{ cursor: onSeek ? 'pointer' : undefined }} />
          {rows.map((row, i) => {
            const y = i * ROW
            return (
              <g key={row}>
                <line x1={labelW} x2={labelW + w} y1={y + ROW} y2={y + ROW} stroke="var(--grid)" />
                <text x={labelW - 10} y={y + ROW / 2} dy="0.32em" textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 12 }}>
                  {row === '__signal' ? 'Traffic light' : classInfo(row).label}
                </text>
                {row === '__signal'
                  ? signals!.map((p) => (
                      <rect key={p.start} x={sx(p.start)} y={y + 8} width={Math.max(1, sx(p.end) - sx(p.start) - 1)} height={ROW - 16} rx={2} fill={SIGNAL_COLORS[p.state]} onClick={seekFromEvent}>
                        <title>{`${p.state} ${clock(p.start)}–${clock(p.end)}`}</title>
                      </rect>
                    ))
                  : events
                      .filter((e) => e[2] === row)
                      .map((ev) => (
                        <rect
                          key={`${ev[0]}-${ev[1]}`}
                          x={sx(ev[0])}
                          y={y + 5}
                          width={Math.max(3, sx(ev[1]) - sx(ev[0]))}
                          height={ROW - 10}
                          rx={4}
                          fill={classColor(ev[2])}
                          style={{ cursor: onSeek ? 'pointer' : undefined }}
                          onClick={() => onSeek?.(ev[0])}
                          onPointerEnter={() => setHover({ ev, x: sx(ev[0]), y })}
                          onPointerLeave={() => setHover(null)}
                        />
                      ))}
              </g>
            )
          })}
          {timeTicks(duration).map((t) => (
            <text key={t} x={sx(t)} y={rows.length * ROW + 18} textAnchor="middle">
              {clock(t, 0)}
            </text>
          ))}
          {currentTime !== undefined && (
            <line x1={sx(currentTime)} x2={sx(currentTime)} y1={0} y2={rows.length * ROW} stroke="var(--ink)" strokeWidth={1.5} pointerEvents="none" />
          )}
        </svg>
      )}
      {hover && (
        <div className="tooltip" style={{ left: Math.min(hover.x, width - 200), top: hover.y + ROW + 30 }}>
          <strong>{classInfo(hover.ev[2]).label}</strong>
          <div className="muted">
            {clock(hover.ev[0])} – {clock(hover.ev[1])} ({(hover.ev[1] - hover.ev[0]).toFixed(1)} s)
          </div>
          {onSeek && <div className="muted">Click to jump to it</div>}
        </div>
      )}
    </div>
  )
}
