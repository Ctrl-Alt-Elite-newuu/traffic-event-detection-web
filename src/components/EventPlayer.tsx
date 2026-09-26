import { useEffect, useRef, useState } from 'react'
import { classColor, classInfo } from '../lib/classes'
import { clock } from '../lib/format'
import type { EventRow, RiskPoint, SignalPhase } from '../lib/types'
import { RiskChart } from './RiskChart'
import { Timeline } from './Timeline'

interface Props {
  duration: number
  events: EventRow[]
  risk: RiskPoint[]
  signals?: SignalPhase[]
  videoSrc?: string
  poster?: string
}

/** Video + event timeline + risk curve + event list, all on one clock: clicking any of them seeks the video. */
export function EventPlayer({ duration, events, risk, signals, videoSrc, poster }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const v = video.current
    if (!v) return
    let raf = 0
    const tick = () => {
      setTime(v.currentTime)
      raf = requestAnimationFrame(tick)
    }
    const start = () => (raf = requestAnimationFrame(tick))
    const stop = () => {
      cancelAnimationFrame(raf)
      setTime(v.currentTime)
    }
    v.addEventListener('play', start)
    v.addEventListener('pause', stop)
    v.addEventListener('seeked', stop)
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('play', start)
      v.removeEventListener('pause', stop)
      v.removeEventListener('seeked', stop)
    }
  }, [videoSrc])

  const seek = (t: number) => {
    setTime(t)
    if (video.current) {
      video.current.currentTime = t
      video.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
  const sorted = [...events].sort((a, b) => a[0] - b[0])

  return (
    <div className="stack">
      {videoSrc ? (
        <div className="media">
          <video ref={video} src={videoSrc} poster={poster} controls playsInline preload="metadata" />
        </div>
      ) : (
        poster && (
          <div className="media">
            <img src={poster} alt="Frame from the video" loading="lazy" />
          </div>
        )
      )}
      <div>
        <h3>Event timeline</h3>
        <p className="card-sub">One row per event class{signals?.length ? ', plus the traffic-light phase read from the frame' : ''}. Click an event to jump to it.</p>
        <Timeline duration={duration} events={events} signals={signals} currentTime={time} onSeek={seek} />
      </div>
      <div>
        <h3>Accident risk</h3>
        <p className="card-sub">Probability that an accident starts within the next 5 s, computed causally from past frames only.</p>
        <RiskChart duration={duration} risk={risk} currentTime={time} onSeek={seek} />
      </div>
      {sorted.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th className="num">Start</th>
                <th className="num">End</th>
                <th className="num">Length</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ev) => (
                <tr key={`${ev[2]}-${ev[0]}`} className="clickable" onClick={() => seek(ev[0])}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <i className="swatch" style={{ background: classColor(ev[2]) }} />
                      {classInfo(ev[2]).label}
                    </span>
                  </td>
                  <td className="num">{clock(ev[0])}</td>
                  <td className="num">{clock(ev[1])}</td>
                  <td className="num">{(ev[1] - ev[0]).toFixed(1)} s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
