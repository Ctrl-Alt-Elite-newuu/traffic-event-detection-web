import { Figure, Section } from '../components/ui'
import { dataUrl } from '../lib/data'

type Kind = 'learned' | 'rule' | 'annotated'

const KIND: Record<Kind, { label: string; color: string }> = {
  learned: { label: 'Learned model', color: 'var(--s1)' },
  rule: { label: 'Rule-based', color: 'var(--s2)' },
  annotated: { label: 'Hand-annotated once', color: 'var(--s3)' },
}

const STEPS: { title: string; detail: string; kind: Kind }[] = [
  { title: 'Decode', detail: '4K @ 29.97 fps → 1920×1080, every 3rd frame (10 Hz)', kind: 'rule' },
  { title: 'Align camera', detail: 'SIFT matches to a reference view → similarity transform', kind: 'rule' },
  { title: 'Detect', detail: 'YOLO11s (COCO), 1280 px: cars, buses, trucks, two-wheelers, people', kind: 'learned' },
  { title: 'Track', detail: 'ByteTrack: identities and ground-contact trajectories', kind: 'rule' },
  { title: 'Scene + signal', detail: 'Crossings, stop lines, islands; light colour read from pixels', kind: 'annotated' },
  { title: 'Event rules', detail: 'Per-class rules on trajectories, layout and signal phase', kind: 'rule' },
  { title: 'Segments', detail: 'Merge fragments, drop sub-second blips, one class per segment', kind: 'rule' },
]

const PART_B = [
  { title: 'Causal frames', detail: 'Only frames seen so far; detector + tracker every 6th frame (5 Hz)', kind: 'learned' as Kind },
  { title: 'Velocities', detail: 'Each vehicle\'s velocity fitted over the last 1.2 s, in the reference view', kind: 'rule' as Kind },
  { title: 'Time to collision', detail: 'Pairs of moving vehicles on converging paths that would touch within 1.5 s', kind: 'rule' as Kind },
  { title: 'Calibrate', detail: 'Tuned to ~0.1 false alarms per minute on 18 min of normal traffic', kind: 'rule' as Kind },
]

function Flow({ steps }: { steps: { title: string; detail: string; kind: Kind }[] }) {
  return (
    <ol className="flow">
      {steps.map((s, i) => (
        <li key={s.title} className="flow-step">
          <div className="flow-box" style={{ borderTopColor: KIND[s.kind].color }}>
            <div className="flow-num">{i + 1}</div>
            <strong>{s.title}</strong>
            <span>{s.detail}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Approach() {
  return (
    <Section
      id="approach"
      eyebrow="Problem & approach"
      title="From a fixed camera to timed events"
      lead="Every event class is a statement about where road users are, how they move and what the signal shows. So we turn the video into trajectories with a learned detector and tracker, then decide events with transparent rules over a scene layout we annotated once."
    >
      <div className="legend" style={{ marginBottom: 16 }}>
        {Object.values(KIND).map((k) => (
          <span key={k.label}>
            <i className="swatch" style={{ background: k.color }} />
            {k.label}
          </span>
        ))}
      </div>
      <h3>Part A: event detection</h3>
      <Flow steps={STEPS} />
      <h3 style={{ marginTop: 28 }}>Part B: accident anticipation</h3>
      <Flow steps={PART_B} />

      <div className="grid-2" style={{ marginTop: 32 }}>
        <div className="card">
          <h3>What is learned, what is rule-based</h3>
          <ul className="clean">
            <li>
              <strong>Learned:</strong> road-user detection only (YOLO11s, pretrained on COCO, open weights, no fine-tuning).
            </li>
            <li>
              <strong>Rule-based:</strong> tracking, camera alignment, traffic-light reading, every event rule, segment post-processing and the risk score.
            </li>
            <li>
              <strong>Hand-annotated once:</strong> the scene layout (crossings, stop lines, islands, light positions), because the organizers provide no scene description.
            </li>
          </ul>
        </div>
        <div className="card">
          <h3>Why this design</h3>
          <ul className="clean">
            <li>There are no labels, so rules we can inspect and tune on our own dev labels beat a model we cannot train.</li>
            <li>Boundaries are scored at IoU up to 0.7, and rules on trajectories give frame-accurate start and end times.</li>
            <li>The budget is 3× real time on a T4 for 4K input, so one pass of a small detector at 10 Hz leaves a wide margin.</li>
          </ul>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>How we ship it</h3>
          <ul className="clean">
            <li>Work lands on <code>dev</code>; <code>main</code> changes only through pull requests, protected against force pushes and deletion.</li>
            <li>Every push runs CI: a clean install, the harness interface check and the official format check on our predictions.</li>
            <li>Only a merge into <code>main</code> publishes the demo image and deploys it, pinned to the exact commit so it can be rolled back.</li>
            <li>Least-privilege workflow tokens, pinned dependencies, and no secrets or videos in git.</li>
          </ul>
        </div>
        <div className="card">
          <h3>How the demo is protected</h3>
          <ul className="clean">
            <li>A dedicated, key-only server user deploys it, separate from the other projects on the machine.</li>
            <li>The API is reachable only through the HTTPS reverse proxy (Let&apos;s Encrypt), never directly.</li>
            <li>Uploads are capped at the proxy and in the app, checked to be a playable video of at most 2 minutes, processed one at a time, and deleted right after.</li>
            <li>Known gaps, stated plainly: the container runs as root and there is no per-client rate limit yet.</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Figure
          src={dataUrl('eda/scene_layout.jpg')}
          alt="Scene layout drawn over the reference frame: crosswalks, stop lines, traffic lights and islands"
          caption="Our scene layout on the reference view: three crossings (blue), stop lines (red), traffic-light lamp regions and raised islands (magenta). Every video is aligned to this view first."
        />
      </div>
    </Section>
  )
}
