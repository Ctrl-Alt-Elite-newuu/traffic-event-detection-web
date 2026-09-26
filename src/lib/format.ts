/** 83.4 -> "1:23.4" */
export function clock(sec: number, decimals = 1): string {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const rest = (s - m * 60).toFixed(decimals).padStart(decimals ? 3 + decimals : 2, '0')
  return `${m}:${rest}`
}

/** 1284 -> "1,284" */
export function num(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

/** Evenly spaced "nice" ticks covering [0, max]. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const ticks = []
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)))
  if (ticks[ticks.length - 1] < max) ticks.push(Number((ticks[ticks.length - 1] + step).toFixed(6)))
  return ticks
}

/** Time-axis ticks in seconds for a duration. */
export function timeTicks(duration: number): number[] {
  const steps = [5, 10, 15, 30, 60, 120, 300]
  const step = steps.find((s) => duration / s <= 8) ?? 600
  const ticks = []
  for (let t = 0; t <= duration; t += step) ticks.push(t)
  return ticks
}
