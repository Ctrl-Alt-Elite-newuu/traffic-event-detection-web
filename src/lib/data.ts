import { useEffect, useState } from 'react'
import type { JobResult, JobStatus, VideoResult, VideosFile } from './types'

const DATA = '/data'
/** Demo API origin. Empty = same origin (Caddy proxies /api in production, Vite in development). */
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''

export function dataUrl(path: string): string {
  return `${DATA}/${path}`
}

type Loadable<T> = { state: 'loading' } | { state: 'ready'; data: T } | { state: 'missing' }

/** Fetch a JSON file under /data; 'missing' when it does not exist yet (e.g. results before the model runs). */
export function useJson<T>(path: string | null): Loadable<T> {
  const [result, setResult] = useState<{ path: string | null; value: Loadable<T> }>({ path, value: { state: 'loading' } })
  useEffect(() => {
    if (!path) return
    let cancelled = false
    fetch(dataUrl(path))
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : Promise.reject(r.status)))
      .then((data: T) => !cancelled && setResult({ path, value: { state: 'ready', data } }))
      .catch(() => !cancelled && setResult({ path, value: { state: 'missing' } }))
    return () => {
      cancelled = true
    }
  }, [path])
  if (!path) return { state: 'missing' }
  return result.path === path ? result.value : { state: 'loading' }
}

export const useVideos = () => useJson<VideosFile>('videos.json')
export const useResult = (id: string | null) => useJson<VideoResult>(id ? `results/${id}.json` : null)

// ---------- demo API ----------

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}/api${path}`, init)
  if (!r.ok) {
    let detail = `${r.status} ${r.statusText}`
    try {
      detail = (await r.json()).detail ?? detail
    } catch {
      /* not JSON */
    }
    throw new Error(detail)
  }
  return r.json() as Promise<T>
}

export interface Limits {
  max_upload_mb: number
  max_duration_sec: number
}

export const getLimits = () => api<Limits>('/limits')
export const getJob = (id: string) => api<JobStatus>(`/jobs/${id}`)
export const getJobResult = (id: string) => api<JobResult>(`/jobs/${id}/result`)

/** Upload with progress (fetch cannot report upload progress, XMLHttpRequest can). */
export function uploadVideo(file: File, onProgress: (fraction: number) => void): Promise<{ job_id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/api/jobs`)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => {
      let body: { job_id?: string; detail?: string } = {}
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* not JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.job_id) resolve({ job_id: body.job_id })
      else reject(new Error(body.detail ?? `Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Could not reach the demo server.'))
    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}
