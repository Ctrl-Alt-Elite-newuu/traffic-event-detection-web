/** Everything on the site that is plain text lives here, so the team can edit it without touching components.
 *  Search for "TODO" to find what still needs filling in. */

export const TEAM_NAME = 'Ctrl+Alt+Elite'
export const PROJECT_NAME = 'Road Event Watch'

export const LINKS = {
  live: 'https://ctrl-alt-elite.sukoon.uz',
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
    'Checking assumptions against the data: 99% of the near carriageway\'s stop-line crossings happen on the visible green, so its hidden signal runs in phase with the visible one — and the far carriageway\'s do not, so we only judge red-light running where the signal is actually known.',
    'A learned scene prior: where vehicles drive and in which direction, averaged over every track in the samples, gives the carriageway mask for jaywalking and the reference direction for wrong-way driving.',
    'Part B false alarms fell from ~9 to ~0.1 per minute once we saw that almost all of them were a car passing a queued car in the next lane, which the oblique view makes look like a collision course.',
    'TODO: add per-class scores on our dev labels.',
  ],
  didnt: [
    'Decoding 4K H.264 is the real bottleneck: reading every frame alone takes ~0.75× real time on a laptop CPU, so detection has to be sparse and downscaled.',
    'The far carriageway\'s signal faces away from the camera, so red-light running there cannot be judged.',
    'Pixel speeds lie in a perspective view: distant cars move a few pixels per second and looked "stopped" until we measured speed in box heights per second.',
    'Rear-end collisions with a stationary vehicle are not anticipated by Part B: excluding stationary vehicles was the price of removing the queue false alarms.',
    'On a laptop CPU the full pipeline runs at ~9× real time (90% of it in YOLO); it relies on the evaluation GPU to fit the 3× budget.',
    'TODO: classes we dropped because they produced too many false positives, and failure cases.',
  ],
  next: [
    'TODO: what we would do with more time (e.g. a learned accident / near-miss clip classifier, better re-identification across occlusions).',
  ],
}
