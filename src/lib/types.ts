/** [start_sec, end_sec, label] exactly as solution.detect_events returns it. */
export type EventRow = [number, number, string]
/** [t_sec, score] as recorded from RiskEstimator.step. */
export type RiskPoint = [number, number]

export type SignalState = 'red' | 'yellow' | 'green' | 'unknown'
export interface SignalPhase {
  start: number
  end: number
  state: SignalState
}

export type CountGroup = 'cars' | 'heavy' | 'two_wheelers' | 'pedestrians'

/** One sample video, as written by traffic-event-detection/scripts/export_site_data.py. */
export interface VideoInfo {
  id: string
  file: string
  duration: number
  fps: number
  width: number
  height: number
  n_frames: number
  size_gb: number
  bitrate_mbps: number
  brightness: number
  lighting: 'daylight' | 'dusk'
  thumb: string
  align: { dx: number; dy: number; scale: number; rot_deg: number; inliers: number | null }
  tracks: Partial<Record<CountGroup, number>>
  counts: { t: number[] } & Record<CountGroup, number[]>
  signals: SignalPhase[]
}

export interface VideosFile {
  videos: VideoInfo[]
  alignment_example: string
}

/** Model output for one sample video (public/data/results/<id>.json). */
export interface VideoResult {
  events: EventRow[]
  risk: RiskPoint[]
  /** Optional annotated rendering, relative to /data/. */
  annotated_video?: string
}

export interface JobStatus {
  id: string
  status: 'queued' | 'running' | 'done' | 'error'
  stage: string
  progress: number
  error: string | null
}

export interface JobResult {
  video: { name: string; duration: number; fps: number; width: number; height: number }
  events: EventRow[]
  risk: RiskPoint[]
}
