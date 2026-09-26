/** The 14 official event classes, grouped into families that share a colour.
 *  14 classes are too many for distinct hues, so identity comes from the row label
 *  and colour only carries the family. */
export type Family = 'collision' | 'signal' | 'manoeuvre' | 'pedestrian' | 'flow'

export const FAMILIES: Record<Family, { label: string; color: string }> = {
  collision: { label: 'Collision risk', color: 'var(--s8)' },
  signal: { label: 'Signal & crossing', color: 'var(--s2)' },
  manoeuvre: { label: 'Illegal manoeuvre', color: 'var(--s7)' },
  pedestrian: { label: 'Pedestrian', color: 'var(--s3)' },
  flow: { label: 'Flow & hazard', color: 'var(--s1)' },
}

export interface ClassInfo {
  id: string
  label: string
  family: Family
  definition: string
}

export const CLASSES: ClassInfo[] = [
  { id: 'accident', label: 'Accident', family: 'collision', definition: 'Contact between road users, or with a fixed object.' },
  { id: 'near_miss', label: 'Near miss', family: 'collision', definition: 'Sharp braking or swerving to avoid a collision; no contact.' },
  { id: 'red_light', label: 'Red-light running', family: 'signal', definition: 'A vehicle crosses the stop line while its signal is red.' },
  { id: 'stop_line', label: 'Stop-line violation', family: 'signal', definition: 'A vehicle stops past the stop line on red.' },
  { id: 'failure_to_yield', label: 'Failure to yield', family: 'signal', definition: 'A vehicle drives through a crossing while a pedestrian is on it.' },
  { id: 'wrong_way', label: 'Wrong-way driving', family: 'manoeuvre', definition: 'A vehicle moves against the traffic direction of its lane.' },
  { id: 'illegal_u_turn', label: 'Illegal U-turn', family: 'manoeuvre', definition: 'A U-turn where markings or signs prohibit it.' },
  { id: 'illegal_turn', label: 'Illegal turn', family: 'manoeuvre', definition: 'A turn from the wrong lane or in a prohibited direction.' },
  { id: 'solid_line_crossing', label: 'Solid line crossing', family: 'manoeuvre', definition: 'A lane change across a solid marking.' },
  { id: 'jaywalking', label: 'Jaywalking', family: 'pedestrian', definition: 'A pedestrian on the carriageway outside a crossing.' },
  { id: 'stopped_vehicle', label: 'Stopped vehicle', family: 'flow', definition: 'Stationary on the carriageway for 10 s or more, not queuing.' },
  { id: 'congestion', label: 'Congestion', family: 'flow', definition: 'Standstill or crawling traffic across all lanes of a direction.' },
  { id: 'road_obstacle', label: 'Road obstacle', family: 'flow', definition: 'Debris, animal or fallen object on the carriageway.' },
  { id: 'fire_smoke', label: 'Fire or smoke', family: 'flow', definition: 'Visible fire or smoke from a vehicle or on the road.' },
]

const BY_ID = new Map(CLASSES.map((c) => [c.id, c]))

export function classInfo(id: string): ClassInfo {
  return BY_ID.get(id) ?? { id, label: id, family: 'flow', definition: '' }
}

export function classColor(id: string): string {
  return FAMILIES[classInfo(id).family].color
}
