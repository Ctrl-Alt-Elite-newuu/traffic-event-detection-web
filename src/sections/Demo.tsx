import { useEffect, useRef, useState } from 'react'
import { EventPlayer } from '../components/EventPlayer'
import { Section } from '../components/ui'
import { getJob, getJobResult, getLimits, uploadVideo, type Limits } from '../lib/data'
import type { JobResult } from '../lib/types'

const DEFAULT_LIMITS: Limits = { max_upload_mb: 300, max_duration_sec: 150 }

type Phase =
  | { kind: 'idle' }
  | { kind: 'uploading'; progress: number }
  | { kind: 'processing'; stage: string; progress: number }
  | { kind: 'done'; result: JobResult }
  | { kind: 'error'; message: string }

/** Read the duration from the browser before uploading, so a too-long clip is rejected instantly. */
function videoDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => resolve(v.duration)
    v.onerror = () => reject(new Error('This file cannot be played by the browser.'))
    v.src = url
  })
}

export function Demo() {
  const [limits, setLimits] = useState<Limits>(DEFAULT_LIMITS)
  const [online, setOnline] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getLimits()
      .then((l) => {
        setLimits(l)
        setOnline(true)
      })
      .catch(() => setOnline(false))
  }, [])

  useEffect(() => () => void (fileUrl && URL.revokeObjectURL(fileUrl)), [fileUrl])

  const start = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.mp4')) return setPhase({ kind: 'error', message: 'Please choose an .mp4 file.' })
    if (file.size > limits.max_upload_mb * 1024 * 1024)
      return setPhase({ kind: 'error', message: `The file is ${(file.size / 1048576).toFixed(0)} MB; the limit is ${limits.max_upload_mb} MB.` })
    const url = URL.createObjectURL(file)
    try {
      const d = await videoDuration(url)
      if (d > limits.max_duration_sec) {
        URL.revokeObjectURL(url)
        return setPhase({ kind: 'error', message: `The clip is ${Math.round(d)} s long; the limit is ${limits.max_duration_sec} s.` })
      }
    } catch {
      /* the browser may not decode every codec; let the server decide */
    }
    setFileUrl(url)
    try {
      setPhase({ kind: 'uploading', progress: 0 })
      const { job_id } = await uploadVideo(file, (p) => setPhase({ kind: 'uploading', progress: p }))
      for (;;) {
        const s = await getJob(job_id)
        if (s.status === 'error') throw new Error(s.error ?? 'Processing failed.')
        if (s.status === 'done') break
        setPhase({ kind: 'processing', stage: s.stage, progress: s.progress })
        await new Promise((r) => setTimeout(r, 1000))
      }
      setPhase({ kind: 'done', result: await getJobResult(job_id) })
    } catch (e) {
      setPhase({ kind: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }

  const busy = phase.kind === 'uploading' || phase.kind === 'processing'
  const pct = phase.kind === 'uploading' ? phase.progress * 100 : phase.kind === 'processing' ? phase.progress * 100 : 0

  return (
    <Section
      id="demo"
      eyebrow="Live demo"
      title="Try it on your own clip"
      lead={`Upload an .mp4 from a road camera (up to ${limits.max_upload_mb} MB and ${Math.round(limits.max_duration_sec / 60 * 10) / 10} minutes). The same code we submitted runs on our server's CPU, so expect roughly a few seconds of processing per second of video.`}
    >
      <div className="stack">
        {online === false && <div className="notice">The demo server is offline right now. Please try again later.</div>}
        <label
          className={`dropzone${over ? ' over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            const f = e.dataTransfer.files[0]
            if (f && !busy) start(f)
          }}
        >
          <input
            ref={input}
            type="file"
            accept="video/mp4,.mp4"
            hidden
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) start(f)
              e.target.value = ''
            }}
          />
          <strong>{busy ? 'Working on your video…' : 'Drop an .mp4 here or click to choose'}</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            Max {limits.max_upload_mb} MB · max {limits.max_duration_sec} s · the video is deleted after processing
          </div>
        </label>

        {busy && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{phase.kind === 'uploading' ? 'Uploading' : phase.stage[0].toUpperCase() + phase.stage.slice(1)}</span>
              <span className="muted">{Math.round(pct)}%</span>
            </div>
            <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {phase.kind === 'error' && (
          <div className="card">
            <p className="error" style={{ margin: 0 }}>
              {phase.message}
            </p>
          </div>
        )}

        {phase.kind === 'done' && (
          <div className="card stack">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>
                {phase.result.events.length} event{phase.result.events.length === 1 ? '' : 's'} found
              </h3>
              <a
                className="btn ghost"
                download="events.json"
                href={`data:application/json,${encodeURIComponent(JSON.stringify({ events: phase.result.events, risk: phase.result.risk }))}`}
              >
                Download JSON
              </a>
            </div>
            <EventPlayer duration={phase.result.video.duration} events={phase.result.events} risk={phase.result.risk} videoSrc={fileUrl ?? undefined} />
          </div>
        )}
      </div>
    </Section>
  )
}
