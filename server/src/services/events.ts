import {
  businesses,
  events,
  type Business,
  type BusinessCategory,
  type Event,
  type EventCategory,
} from '../data/events'

export type EventsQuery = {
  category?: EventCategory
  tags?: string[]
}

export type NearbyBusinessesQuery = {
  type?: BusinessCategory
  radiusMeters?: number
}

export type BusinessWithDistance = Business & {
  distanceMeters: number
}

const normalizeTag = (tag: string) => tag.trim().toLowerCase()

export const parseTags = (rawTags: string | string[] | undefined): string[] => {
  if (!rawTags) return []

  const joined = Array.isArray(rawTags) ? rawTags.join(',') : rawTags

  return joined
    .split(',')
    .map(normalizeTag)
    .filter(Boolean)
}

const matchesTags = (event: Event, tags: string[]) => {
  if (tags.length === 0) return true

  const eventTags = new Set(event.tags.map(normalizeTag))
  return tags.every((tag) => eventTags.has(tag))
}

const isUpcoming = (event: Event) => new Date(event.endTime).getTime() > Date.now()

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const distanceMetersBetween = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const earthRadiusMeters = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(earthRadiusMeters * c)
}

export const listEvents = (query: EventsQuery = {}): Event[] =>
  events.filter((event) => {
    if (query.category && event.category !== query.category) return false
    if (!matchesTags(event, query.tags ?? [])) return false
    return true
  })

export const getEventById = (id: string): Event | null =>
  events.find((event) => event.id === id) ?? null

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

const buildRandomReason = (event: Event) => {
  if (event.tags.includes('networking')) {
    return 'Good for meeting new people without overthinking the plan.'
  }

  if (event.category === 'music') {
    return 'It is an easy way to make the night feel memorable.'
  }

  if (event.category === 'tech') {
    return 'A solid pick if you want energy, ideas, and people building things.'
  }

  return 'A good spontaneous choice if you want something to do tonight.'
}

export const getRandomEvent = (query: EventsQuery = {}) => {
  const candidates = listEvents(query).filter(isUpcoming)

  if (candidates.length === 0) {
    return null
  }

  const event = randomItem(candidates)
  const reason = buildRandomReason(event)

  return {
    event: {
      id: event.id,
      title: event.title,
      venueName: event.venueName,
      lat: event.lat,
      lng: event.lng,
      startTime: event.startTime,
      category: event.category,
    },
    reason,
    prompt: `Try ${event.title} at ${event.venueName}. ${reason}`,
  }
}

export const getNearbyBusinesses = (
  eventId: string,
  query: NearbyBusinessesQuery = {}
): BusinessWithDistance[] | null => {
  const event = getEventById(eventId)

  if (!event) {
    return null
  }

  const radiusMeters = query.radiusMeters ?? 1200

  return businesses
    .filter((business) => {
      if (query.type && business.category !== query.type) return false
      return true
    })
    .map((business) => ({
      ...business,
      distanceMeters: distanceMetersBetween(event.lat, event.lng, business.lat, business.lng),
    }))
    .filter((business) => business.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
}
