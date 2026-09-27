import { Section } from '../components/ui'
import { LINKS, REPORT, TEAM, type Member } from '../content/site'

const isSet = (v?: string) => !!v && !v.startsWith('TODO')

export function Report() {
  return (
    <Section id="report" eyebrow="Technical report" title="What we built, what worked, what did not" lead={REPORT.built}>
      <div className="grid-3">
        <div className="card">
          <h3>What worked</h3>
          <ul className="clean">
            {REPORT.worked.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>What did not</h3>
          <ul className="clean">
            {REPORT.didnt.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>What we would do next</h3>
          <ul className="clean">
            {REPORT.next.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Person({ m }: { m: Member }) {
  const links = [
    ['GitHub', m.github],
    ['LinkedIn', m.linkedin],
    ['Portfolio', m.portfolio],
  ].filter(([, url]) => isSet(url))
  return (
    <div className="card person">
      <div className="avatar" aria-hidden>
        {initials(m.name)}
      </div>
      <div style={{ minWidth: 0 }}>
        <h3>{m.name}</h3>
        <div className="card-sub" style={{ marginBottom: 8 }}>
          {m.role}
        </div>
        <ul className="clean" style={{ fontSize: '0.9rem' }}>
          {m.did.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {m.proudOf && m.proudOf.length > 0 && (
          <div style={{ fontSize: '0.85rem', marginTop: 10 }}>
            <div className="muted">Previous projects</div>
            <ul className="clean">
              {m.proudOf.map((p) => (
                <li key={p.title}>
                  {isSet(p.url) ? (
                    <a href={p.url} target="_blank" rel="noreferrer">
                      {p.title} ↗
                    </a>
                  ) : (
                    p.title
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {links.length > 0 && (
          <div className="links-row">
            {links.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">
                {label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Team() {
  return (
    <Section id="team" eyebrow="Team" title="Ctrl+Alt+Elite" lead="Three people, one fixed camera, four days.">
      <div className="grid-3">
        {TEAM.map((m) => (
          <Person key={m.name} m={m} />
        ))}
      </div>
    </Section>
  )
}

export function Links() {
  const items = [
    { label: 'Code repository', url: LINKS.repo, note: 'solution.py, rules, training and export scripts' },
    { label: 'Model weights', url: LINKS.weights, note: 'YOLO11s (COCO), shipped in the repository' },
    { label: 'predictions_samples.json', url: LINKS.predictions, note: 'our output on the four sample videos' },
    { label: 'Website source', url: LINKS.website, note: 'this site, live at ctrl-alt-elite.sukoon.uz' },
  ]
  return (
    <Section id="links" eyebrow="Links" title="Everything, in one place">
      <div className="grid-4">
        {items.map((i) => (
          <a key={i.label} className="card" href={i.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{i.label} ↗</h3>
            <div className="card-sub" style={{ margin: 0 }}>
              {i.note}
            </div>
          </a>
        ))}
      </div>
    </Section>
  )
}
