import { useState } from 'react'
import { LineChart } from '../components/LineChart'
import { Timeline } from '../components/Timeline'
import { Figure, Section, Stat, Tabs } from '../components/ui'
import { dataUrl } from '../lib/data'
import { clock, num } from '../lib/format'
import type { CountGroup, VideoInfo, VideosFile } from '../lib/types'

const GROUPS: { key: CountGroup; label: string; color: string }[] = [
  { key: 'cars', label: 'Cars', color: 'var(--s1)' },
  { key: 'heavy', label: 'Buses & trucks', color: 'var(--s2)' },
  { key: 'two_wheelers', label: 'Two-wheelers', color: 'var(--s3)' },
  { key: 'pedestrians', label: 'Pedestrians', color: 'var(--s4)' },
]

/** Mean length of complete phases (the first and last are cut by the clip boundaries). */
function phaseStats(videos: VideoInfo[]) {
  const acc: Record<string, number[]> = { red: [], green: [], yellow: [] }
  for (const v of videos) {
    v.signals.slice(1, -1).forEach((p) => acc[p.state]?.push(p.end - p.start))
  }
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  return { red: mean(acc.red), green: mean(acc.green), yellow: mean(acc.yellow), n: acc.red.length + acc.green.length }
}

export function Eda({ data }: { data: VideosFile | null }) {
  const videos = data?.videos ?? []
  const [sel, setSel] = useState<string>('')
  const current = videos.find((v) => v.id === sel) ?? videos[0]
  const totalSec = videos.reduce((a, v) => a + v.duration, 0)
  const totalUsers = videos.reduce((a, v) => a + Object.values(v.tracks).reduce((x, y) => x + (y ?? 0), 0), 0)
  const phases = phaseStats(videos)
  const shifted = videos.find((v) => v.id === data?.alignment_example)

  return (
    <Section
      id="eda"
      eyebrow="Exploratory data analysis"
      title="What the camera sees"
      lead="Four unlabeled clips from one fixed camera over a signalised junction in Tashkent. We looked at the footage, the traffic it contains and the signal cycle before writing a single rule — several findings below changed the design."
    >
      {!data ? (
        <p className="muted">Loading data…</p>
      ) : (
        <div className="stack">
          <div className="grid-4">
            <Stat label="Sample videos" value={videos.length} note={`${Math.round(totalSec / 60)} min of footage`} />
            <Stat label="Resolution" value="3840×2160" note={`${videos[0]?.fps.toFixed(2)} fps, H.264 ~${Math.round(videos[0]?.bitrate_mbps ?? 0)} Mb/s`} />
            <Stat label="Road users tracked" value={num(totalUsers)} note="tracks longer than 1 s" />
            <Stat label="Signal cycle" value={phases.red && phases.green ? `${Math.round(phases.red + phases.green + (phases.yellow ?? 0))} s` : '—'} note={phases.red ? `~${Math.round(phases.red)} s red, ~${Math.round(phases.green ?? 0)} s green` : 'reading…'} />
          </div>

          <div className="card">
            <h3>The clips</h3>
            <p className="card-sub">Camera shift is how far each recording is offset from our reference view, measured automatically.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th className="num">Length</th>
                    <th>Lighting</th>
                    <th className="num">Size</th>
                    <th className="num">Camera shift</th>
                    <th className="num">Cars</th>
                    <th className="num">Buses & trucks</th>
                    <th className="num">Two-wheelers</th>
                    <th className="num">Pedestrians</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v) => (
                    <tr key={v.id}>
                      <td>{v.id}</td>
                      <td className="num">{clock(v.duration, 0)}</td>
                      <td>{v.lighting}</td>
                      <td className="num">{v.size_gb.toFixed(1)} GB</td>
                      <td className="num">
                        {Math.hypot(v.align.dx, v.align.dy).toFixed(0)} px, {v.align.rot_deg.toFixed(1)}°
                      </td>
                      {GROUPS.map((g) => (
                        <td key={g.key} className="num">
                          {num(v.tracks[g.key] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>Road users in view over time</h3>
            <p className="card-sub">Average number of detected road users per frame, in 5-second bins.</p>
            <Tabs label="Video" options={videos.map((v) => ({ id: v.id, label: v.id }))} value={current?.id ?? ''} onChange={setSel} />
            {current && (
              <LineChart
                x={current.counts.t}
                series={GROUPS.map((g) => ({ key: g.key, label: g.label, color: g.color, values: current.counts[g.key] }))}
                yLabel="per frame"
              />
            )}
          </div>

          <div className="card">
            <h3>Traffic-light phases, read from the frame</h3>
            <p className="card-sub">
              The median signal faces the camera, so we read its lamp colours directly. Flashing green is merged into green.
              {phases.n > 0 && ` Complete phases observed: ${phases.n}.`}
            </p>
            {videos.map((v) =>
              v.signals.length ? (
                <div key={v.id} style={{ marginBottom: 8 }}>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {v.id} · {v.lighting}
                  </div>
                  <Timeline duration={v.duration} events={[]} signals={v.signals} />
                </div>
              ) : (
                <p key={v.id} className="muted">
                  {v.id}: signal phases not exported yet.
                </p>
              ),
            )}
          </div>

          <div className="grid-2">
            <Figure
              src={dataUrl('eda/heat_vehicles.jpg')}
              alt="Heatmap of where vehicles drive"
              caption="Vehicle flow: how many distinct vehicles passed through each spot, all clips combined. The lanes of both carriageways and the turning paths stand out."
            />
            <Figure
              src={dataUrl('eda/heat_pedestrians.jpg')}
              alt="Heatmap of where pedestrians walk"
              caption="Pedestrian flow: the three zebra crossings and the pavements dominate, and any use of the carriageway outside them is a jaywalking candidate."
            />
          </div>
          <div className="grid-2">
            <Figure
              src={dataUrl('eda/trajectories.jpg')}
              alt="Vehicle trajectories coloured by heading"
              caption="Vehicle trajectories coloured by direction of travel. The far carriageway flows away from the camera, the near one towards it; curves show turns. This is the reference for wrong-way and illegal-turn rules."
            />
            <Figure
              src={dataUrl('eda/alignment.jpg')}
              alt="Camera alignment before and after"
              caption={
                shifted
                  ? `Finding: the camera is re-mounted between recordings. ${shifted.id} blended with the reference view before (left, doubled edges) and after our automatic alignment (right). Offset ${Math.hypot(shifted.align.dx, shifted.align.dy).toFixed(0)} px and ${shifted.align.rot_deg.toFixed(1)}°.`
                  : 'Camera alignment before and after.'
              }
            />
          </div>

          <div className="card">
            <h3>Findings that shaped the solution</h3>
            <ul className="clean">
              <li>
                <strong>The camera moves between recordings</strong> (up to ~70 px and 1°). All geometry is annotated once on a reference frame and mapped into each video by an automatic SIFT alignment, otherwise every stop-line and crossing rule would be off on some clips.
              </li>
              <li>
                <strong>The signal is readable from pixels</strong> in daylight and at dusk, so red-light and stop-line rules can use the true phase instead of guessing from queues.
              </li>
              <li>
                <strong>Frames are 4K at ~147 Mb/s</strong>: decoding alone costs ~0.75× real time on a laptop CPU. We detect on a 1920×1080 downscale at 10 Hz to stay far inside the 3× budget.
              </li>
              <li>
                <strong>Pedestrian traffic is heavy</strong> (more pedestrian tracks than cars in every clip), which makes jaywalking and failure-to-yield the most frequent candidate events.
              </li>
              <li>
                <strong>Lighting ranges from bright daylight to dusk</strong>; alignment uses contrast-normalised images and the lamp reader uses colour saturation, so both work across the range.
              </li>
            </ul>
          </div>
        </div>
      )}
    </Section>
  )
}
