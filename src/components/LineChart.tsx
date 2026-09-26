import { useState } from 'react'
import { clock, niceTicks, num, timeTicks } from '../lib/format'
import { useWidth } from './useWidth'

export interface Series {
  key: string
  label: string
  color: string
  values: number[]
}

interface Props {
  x: number[]
  series: Series[]
  height?: number
  yLabel?: string
  digits?: number
}

const M = { top: 12, right: 16, bottom: 26, left: 40 }

/** Multi-series line chart over time with a crosshair tooltip. One y-axis only. */
export function LineChart({ x, series, height = 240, yLabel, digits = 1 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const w = width - M.left - M.right
  const h = height - M.top - M.bottom
  const xMax = x.length ? x[x.length - 1] : 1
  const yMax = Math.max(1, ...series.flatMap((s) => s.values))
  const yTicks = niceTicks(yMax, 4)
  const yTop = yTicks[yTicks.length - 1]
  const sx = (t: number) => (t / xMax) * w
  const sy = (v: number) => h - (v / yTop) * h

  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${sx(x[i]).toFixed(1)},${sy(v).toFixed(1)}`).join('')

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - box.left) / box.width) * xMax
    let best = 0
    for (let i = 1; i < x.length; i++) if (Math.abs(x[i] - t) < Math.abs(x[best] - t)) best = i
    setHover(best)
  }

  return (
    <div className="chart" ref={ref}>
      {series.length > 1 && (
        <div className="legend">
          {series.map((s) => (
            <span key={s.key}>
              <i className="key" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg width={width} height={height} role="img" aria-label={`Line chart: ${series.map((s) => s.label).join(', ')} over time`}>
        <g transform={`translate(${M.left},${M.top})`}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} x2={w} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
              <text x={-8} y={sy(v)} dy="0.32em" textAnchor="end">
                {num(v, v % 1 ? 1 : 0)}
              </text>
            </g>
          ))}
          {timeTicks(xMax).map((t) => (
            <text key={t} x={sx(t)} y={h + 18} textAnchor="middle">
              {clock(t, 0)}
            </text>
          ))}
          <line x1={0} x2={w} y1={h} y2={h} stroke="var(--axis)" />
          {yLabel && (
            <text x={0} y={-2} dy="-0.2em">
              {yLabel}
            </text>
          )}
          {series.map((s) => (
            <path key={s.key} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {hover !== null && (
            <g>
              <line x1={sx(x[hover])} x2={sx(x[hover])} y1={0} y2={h} stroke="var(--axis)" />
              {series.map((s) => (
                <circle key={s.key} cx={sx(x[hover])} cy={sy(s.values[hover])} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </g>
          )}
          <rect width={w} height={h} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </g>
      </svg>
      {hover !== null && (
        <div
          className="tooltip"
          style={{ left: Math.min(M.left + sx(x[hover]) + 12, width - 170), top: M.top + 24 }}
        >
          <div className="muted">{clock(x[hover], 0)}</div>
          {series.map((s) => (
            <div className="t-row" key={s.key}>
              <i className="swatch" style={{ background: s.color }} />
              {s.label}
              <span className="t-val">{num(s.values[hover], digits)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
