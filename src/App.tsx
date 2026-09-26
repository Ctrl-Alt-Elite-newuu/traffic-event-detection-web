import { useEffect, useState } from 'react'
import { Stat } from './components/ui'
import { PROJECT_NAME, TEAM_NAME } from './content/site'
import { useVideos } from './lib/data'
import { num } from './lib/format'
import { Approach } from './sections/Approach'
import { Demo } from './sections/Demo'
import { Eda } from './sections/Eda'
import { Links, Report, Team } from './sections/About'
import { Results } from './sections/Results'

const NAV = [
  ['approach', 'Approach'],
  ['eda', 'EDA'],
  ['results', 'Results'],
  ['demo', 'Live demo'],
  ['report', 'Report'],
  ['team', 'Team'],
  ['links', 'Links'],
] as const

type Theme = 'light' | 'dark'

function readTheme(): Theme | null {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(readTheme)
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme
    try {
      if (theme) localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable (private mode): the choice just isn't remembered */
    }
  }, [theme])
  const effective: Theme = theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  return [effective, () => setTheme(effective === 'dark' ? 'light' : 'dark')] as const
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [theme, toggle] = useTheme()
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a className="brand" href="#top">
          <img src="/favicon.svg" alt="" />
          {PROJECT_NAME}
        </a>
        <nav className="nav-links" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
            ☰
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

export default function App() {
  const videos = useVideos()
  const data = videos.state === 'ready' ? videos.data : null
  const list = data?.videos ?? []
  const users = list.reduce((a, v) => a + Object.values(v.tracks).reduce((x, y) => x + (y ?? 0), 0), 0)

  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">WIUT Hackathon 2026 · Computer Vision track · {TEAM_NAME}</div>
            <h1>Traffic events and accident risk from a fixed road camera</h1>
            <p>
              We watch a CCTV view of a Tashkent junction, report every traffic event as a timed segment with one of 14 classes, and raise an alarm before an accident happens — using only past frames.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#demo">
                Try the live demo
              </a>
              <a className="btn ghost" href="#results">
                See results on the samples
              </a>
            </div>
            {list.length > 0 && (
              <div className="grid-4">
                <Stat label="Sample footage analysed" value={`${Math.round(list.reduce((a, v) => a + v.duration, 0) / 60)} min`} note={`${list.length} clips, 4K`} />
                <Stat label="Road users tracked" value={num(users)} note="vehicles and pedestrians" />
                <Stat label="Event classes" value="14" note="detected as time segments" />
                <Stat label="Accident horizon" value="5 s" note="causal risk score per frame" />
              </div>
            )}
          </div>
        </section>
        <Approach />
        <Eda data={data} />
        <Results data={data} />
        <Demo />
        <Report />
        <Team />
        <Links />
      </main>
      <footer className="footer">
        <div className="wrap">
          {TEAM_NAME} · WIUT Hackathon 2026. Footage belongs to the organizers and is shown only as the video itself shows it.
        </div>
      </footer>
    </>
  )
}
