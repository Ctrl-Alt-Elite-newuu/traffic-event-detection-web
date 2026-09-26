/** Everything on the site that is plain text lives here, so the team can edit it without touching components.
 *  Search for "TODO" to find what still needs filling in. */

export const TEAM_NAME = 'Ctrl+Alt+Elite'
export const PROJECT_NAME = 'Road Event Watch'

export const LINKS = {
  repo: 'https://github.com/Ctrl-Alt-Elite-newuu/traffic-event-detection',
  website: 'https://github.com/Ctrl-Alt-Elite-newuu/traffic-event-detection-web',
  weights: 'https://github.com/Ctrl-Alt-Elite-newuu/traffic-event-detection/tree/main/weights',
  predictions: 'https://github.com/Ctrl-Alt-Elite-newuu/traffic-event-detection/blob/main/predictions_samples.json',
}

export interface Member {
  name: string
  role: string
  did: string[]
  github?: string
  linkedin?: string
  portfolio?: string
  proudOf?: { title: string; url?: string }[]
}

export const TEAM: Member[] = [
  {
    name: 'Asila Muxitdinova',
    role: 'TODO: role',
    did: ['TODO: what you built'],
    github: 'TODO',
    linkedin: 'TODO',
    portfolio: 'TODO',
    proudOf: [{ title: 'TODO: a previous project', url: 'TODO' }],
  },
  {
    name: 'Shaxnozaxon Abdusalomova',
    role: 'TODO: role',
    did: ['TODO: what you built'],
    github: 'TODO',
    linkedin: 'TODO',
    portfolio: 'TODO',
    proudOf: [{ title: 'TODO: a previous project', url: 'TODO' }],
  },
  {
    name: 'TODO: third member',
    role: 'TODO: role',
    did: ['TODO: what you built'],
    github: 'TODO',
    linkedin: 'TODO',
    portfolio: 'TODO',
    proudOf: [{ title: 'TODO: a previous project', url: 'TODO' }],
  },
]

/** One-page technical report. Keep it honest: failures are part of the score. */
export const REPORT = {
  built:
    'A detector + tracker pipeline that turns a fixed CCTV view into trajectories, reads the traffic light from the frame, aligns every video to one hand-annotated scene layout, and applies per-class rules to produce time-segmented events and a causal accident-risk score.',
  worked: [
    'Per-video camera alignment (SIFT + similarity transform): the camera was re-mounted between recordings by up to ~70 px and 1°, and one shared scene layout now fits every video.',
    'Reading the traffic light straight from pixels: red, yellow, green and flashing-green phases come out cleanly in daylight and at dusk.',
    'YOLO11s at 1280 px on a 1920×1080 downscale with ByteTrack: enough to track cars, buses, trucks, two-wheelers and pedestrians across the whole junction.',
    'TODO: add the event rules that scored well on our dev labels, with numbers.',
  ],
  didnt: [
    'Decoding 4K H.264 is the real bottleneck: reading every frame alone takes ~0.75× real time on a laptop CPU, so detection has to be sparse and downscaled.',
    'The gantry signals for the near carriageway face away from the camera; we infer that direction from the visible signal, which can be wrong if the two are phased differently.',
    'TODO: classes we dropped because they produced too many false positives, and failure cases.',
  ],
  next: [
    'TODO: what we would do with more time (e.g. a learned accident / near-miss clip classifier, better re-identification across occlusions).',
  ],
}
