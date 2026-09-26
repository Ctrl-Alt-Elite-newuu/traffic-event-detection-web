import { useState } from 'react'
import { EventPlayer } from '../components/EventPlayer'
import { Section, Tabs, Todo } from '../components/ui'
import { classInfo } from '../lib/classes'
import { dataUrl, useResult } from '../lib/data'
import type { VideosFile } from '../lib/types'

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
      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Examples of each class</h3>
          <Todo>Add one short clip or still per detected class once the rules are final.</Todo>
        </div>
        <div className="card">
          <h3>Failure cases</h3>
          <Todo>Add honest failure cases (missed events, false alarms, boundary errors) with a sentence on why each happens.</Todo>
        </div>
      </div>
    </Section>
  )
}
