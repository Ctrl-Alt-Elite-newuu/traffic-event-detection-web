import { useState } from 'react'
import { clock, timeTicks } from '../lib/format'
import type { RiskPoint } from '../lib/types'
import { useWidth } from './useWidth'

interface Props {
  duration: number
  risk: RiskPoint[]
  threshold?: number
  currentTime?: number
  onSeek?: (t: number) => void
  height?: number
}

const M = { top: 10, right: 16, bottom: 24, left: 40 }

/** P(accident within 5 s) over time, with the alarm threshold used by the metric. */
export function RiskChart({ duration, risk, threshold = 0.5, currentTime, onSeek, height = 150 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<RiskPoint | null>(null)
  const w = width - M.left - M.right
  const h = height - M.top - M.bottom
  const sx = (t: number) => (t / duration) * w
  const sy = (v: number) => h - v * h
  const line = risk.map(([t, v], i) => `${i ? 'L' : 'M'}${sx(t).toFixed(1)},${sy(v).toFixed(1)}`).join('')
  const area = risk.length ? `${line}L${sx(risk[risk.length - 1][0]).toFixed(1)},${h}L${sx(risk[0][0]).toFixed(1)},${h}Z` : ''

  const pick = (e: React.PointerEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - box.left) / box.width) * duration
    let lo = 0
    let hi = risk.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (risk[mid][0] < t) lo = mid + 1
      else hi = mid
    }
    return { t, point: risk[lo] }
  }

  return (
    <div className="chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label="Accident risk over time">
        <g transform={`translate(${M.left},${M.top})`}>
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line x1={0} x2={w} y1={sy(v)} y2={sy(v)} stroke={v === threshold ? 'var(--axis)' : 'var(--grid)'} />
              <text x={-8} y={sy(v)} dy="0.32em" textAnchor="end">
                {v.toFixed(1)}
              </text>
            </g>
          ))}
          <text x={w} y={sy(threshold) - 4} textAnchor="end">
            alarm threshold
          </text>
          {timeTicks(duration).map((t) => (
            <text key={t} x={sx(t)} y={h + 18} textAnchor="middle">
              {clock(t, 0)}
            </text>
          ))}
          <path d={area} fill="var(--s8)" opacity={0.1} />
          <path d={line} fill="none" stroke="var(--s8)" strokeWidth={2} strokeLinejoin="round" />
          {currentTime !== undefined && <line x1={sx(currentTime)} x2={sx(currentTime)} y1={0} y2={h} stroke="var(--ink)" strokeWidth={1.5} />}
          {hover && <circle cx={sx(hover[0])} cy={sy(hover[1])} r={4} fill="var(--s8)" stroke="var(--surface)" strokeWidth={2} />}
          {risk.length > 0 && (
            <rect
              width={w}
              height={h}
              fill="transparent"
              style={{ cursor: onSeek ? 'pointer' : undefined }}
              onPointerMove={(e) => setHover(pick(e).point)}
              onPointerLeave={() => setHover(null)}
              onClick={(e) => onSeek?.(pick(e).t)}
            />
          )}
        </g>
      </svg>
      {risk.length === 0 && <p className="muted" style={{ position: 'absolute', top: 40, left: M.left + 12 }}>No risk curve yet.</p>}
      {hover && (
        <div className="tooltip" style={{ left: Math.min(M.left + sx(hover[0]) + 12, width - 150), top: 8 }}>
          <div className="muted">{clock(hover[0])}</div>
          <div className="t-row">
            Risk <span className="t-val">{hover[1].toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
