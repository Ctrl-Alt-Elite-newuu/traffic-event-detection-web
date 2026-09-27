import { useState } from 'react'
import { EventPlayer } from '../components/EventPlayer'
import { Figure, Section, Tabs } from '../components/ui'
import { classInfo } from '../lib/classes'
import { dataUrl, useResult } from '../lib/data'
import type { VideosFile } from '../lib/types'

const EXAMPLES = [
  { file: 'jaywalking.jpg', title: 'Jaywalking', text: 'Pedestrians crossing the far carriageway mid-block by the bus stop, or cutting diagonally across the side road after leaving a crossing.' },
  { file: 'stopped_vehicle.jpg', title: 'Stopped vehicle', text: 'Cars standing at the kerb for 10 s or more (typically dropping passengers), not queued at a light.' },
  { file: 'failure_to_yield.jpg', title: 'Failure to yield', text: 'A vehicle driving through a crossing while a pedestrian is walking on it.' },
]

const FAILURES = [
  { title: 'Parked cars as "stopped vehicles".', text: 'The tracker kept losing and re-finding cars in the roadside parking pocket, so they never looked "parked". We marked the pocket as a scene fact.' },
  { title: 'Queues at lights we cannot see.', text: 'Cars waiting at the far carriageway\'s hidden signal looked stopped. A stop among other stopped vehicles now counts as a queue.' },
  { title: 'Pedestrians on the kerb and at the frame edge.', text: 'The learned road mask spills slightly onto the pavement, and people cut off by the frame bottom get a false ground point. Both are now excluded.' },
  { title: 'Red light on the wrong carriageway.', text: 'The far carriageway crossed "on red" more often than on green: its signal is not the visible one. We only judge the near carriageway.' },
  { title: 'Late light readings in the demo.', text: 'With the lighter demo detector, the light was sampled only every 4 s and produced a false red-light alarm; readings are now scheduled by time.' },
  { title: 'Accident alarms in normal traffic.', text: 'A car passing a queued car in the next lane looks like a collision course in this oblique view: 9 false alarms per minute until moving-vehicle pairs only were scored (now ~0.1).' },
]

export function Results({ data }: { data: VideosFile | null }) {
  const videos = data?.videos ?? []
  const [sel, setSel] = useState('')
  const current = videos.find((v) => v.id === sel) ?? videos[0]
  const result = useResult(current?.id ?? null)

  const counts = new Map<string, number>()
  if (result.state === 'ready') for (const e of result.data.events) counts.set(e[2], (counts.get(e[2]) ?? 0) + 1)

  return (
    <Section
      id="results"
      eyebrow="Results on the sample videos"
      title="Every sample clip, annotated"
      lead="Our model's output on each clip we were given: the annotated video, the event timeline and the accident-risk curve. Click anything on the timeline or in the table to jump the video there."
    >
      <Tabs label="Sample video" options={videos.map((v) => ({ id: v.id, label: `${v.id} · ${v.lighting}` }))} value={current?.id ?? ''} onChange={setSel} />
      {current && (
        <div className="card">
          {result.state === 'loading' && <p className="muted">Loading…</p>}
          {result.state === 'missing' && (
            <div className="stack">
              <div className="notice">Model output for {current.id} is not published yet. The traffic-light phases below are already real.</div>
              <EventPlayer duration={current.duration} events={[]} risk={[]} signals={current.signals} poster={dataUrl(current.thumb)} />
            </div>
          )}
          {result.state === 'ready' && (
            <div className="stack">
              {counts.size > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[...counts].map(([id, n]) => (
                    <span key={id} className="pill">
                      {classInfo(id).label}: {n}
                    </span>
                  ))}
                </div>
              )}
              <EventPlayer
                duration={current.duration}
                events={result.data.events}
                risk={result.data.risk}
                signals={current.signals}
                videoSrc={result.data.annotated_video ? dataUrl(result.data.annotated_video) : undefined}
                poster={dataUrl(current.thumb)}
              />
            </div>
          )}
        </div>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Examples of each class we detect</h3>
        <p className="card-sub">Snapshots from the sample videos, taken mid-event, with the road user that caused it boxed in red (made with our review tool, scripts/review_events.py).</p>
        <div className="stack">
          {EXAMPLES.map((e) => (
            <Figure key={e.file} src={dataUrl(`examples/${e.file}`)} alt={e.title} caption={<><strong>{e.title}.</strong> {e.text}</>} />
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Red-light running and wrong-way driving do not occur in the samples; both rules stay enabled for the hidden test set.
        </p>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Failure cases</h3>
        <p className="card-sub">What went wrong while building the rules, and what we changed. Most were found by looking at every detection, not by the counts.</p>
        <div className="grid-2">
          <ul className="clean">
            {FAILURES.map((f) => (
              <li key={f.title}>
                <strong>{f.title}</strong> {f.text}
              </li>
            ))}
          </ul>
          <Figure
            src={dataUrl('examples/failure_wrong_way_edge.jpg')}
            alt="A taxi cut off by the bottom of the frame, wrongly flagged as wrong-way"
            caption="A former false wrong-way alarm: the taxi is cut off by the frame edge, so its ground point jumped and faked a reversal. Vehicles at the frame edge are now ignored."
          />
        </div>
      </div>
    </Section>
  )
}
