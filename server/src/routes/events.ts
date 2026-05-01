import { Router, Request, Response } from 'express'

const eventsRouter = Router()
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'
const EB_BASE = 'https://www.eventbriteapi.com/v3/events/search/'

const FALLBACK_EVENTS = [
  { id: '1', title: 'AI Hack Night', venue: 'SoMa, San Francisco', startsAt: '6:30 PM', lat: 37.7827, lng: -122.3972, category: 'Hack Night', description: "An evening of hacking, networking, and demos with SF's top builders." },
  { id: '2', title: 'Founder Coffee Meetup', venue: 'Financial District, SF', startsAt: '7:00 PM', lat: 37.7937, lng: -122.3965, category: 'Networking', description: 'Casual coffee meetup for founders and startup enthusiasts in the Financial District.' },
  { id: '3', title: 'Design + Product Mixer', venue: 'Mission District, SF', startsAt: '7:30 PM', lat: 37.7597, lng: -122.4148, category: 'Mixer', description: 'Designers and product managers come together for drinks and conversation.' },
]

function formatTime(localDate: string, localTime?: string): string {
  if (!localTime) return localDate
  const dt = new Date(`${localDate}T${localTime}`)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(dt)
}

async function fetchTicketmaster(apiKey: string): Promise<any[]> {
  // Fetch general events + music concerts in parallel
  const base = { apikey: apiKey, city: 'San Francisco', countryCode: 'US', size: '30', sort: 'date,asc' }
  const [generalRes, musicRes] = await Promise.all([
    fetch(`${TM_BASE}?${new URLSearchParams(base)}`),
    fetch(`${TM_BASE}?${new URLSearchParams({ ...base, classificationName: 'Music' })}`),
  ])

  const results: any[] = []
  for (const res of [generalRes, musicRes]) {
    if (!res.ok) { console.error('TM error', res.status); continue }
    const data = await res.json() as any
    results.push(...(data._embedded?.events ?? []))
  }

  const seen = new Set<string>()
  return results.filter((e) => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return e._embedded?.venues?.[0]?.location?.latitude
  }).map((e) => {
    const venue = e._embedded.venues[0]
    const cat = e.classifications?.[0]
    return {
      id: `tm-${e.id}`,
      title: e.name,
      venue: venue.name ?? 'San Francisco',
      startsAt: formatTime(e.dates.start.localDate, e.dates.start.localTime),
      lat: parseFloat(venue.location.latitude),
      lng: parseFloat(venue.location.longitude),
      category: cat?.segment?.name ?? cat?.genre?.name ?? 'Event',
      description: e.info ?? e.pleaseNote ?? undefined,
      url: e.url ?? undefined,
    }
  })
}

async function fetchEventbrite(token: string): Promise<any[]> {
  const params = new URLSearchParams({
    'location.address': 'San Francisco, CA',
    'location.within': '10mi',
    'expand': 'venue,category',
    'sort_by': 'date',
  })

  const res = await fetch(`${EB_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) { console.error('Eventbrite error', res.status); return [] }
  const data = await res.json() as any

  return (data.events ?? [])
    .filter((e: any) => e.venue?.latitude && e.venue?.longitude)
    .map((e: any) => ({
      id: `eb-${e.id}`,
      title: e.name?.text ?? 'Untitled Event',
      venue: e.venue?.name ?? 'San Francisco',
      startsAt: e.start?.local
        ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(e.start.local))
        : 'TBD',
      lat: parseFloat(e.venue.latitude),
      lng: parseFloat(e.venue.longitude),
      category: e.category?.name ?? (e.is_free ? 'Free' : 'Event'),
      description: e.description?.text?.slice(0, 200) ?? undefined,
      url: e.url ?? undefined,
    }))
}

eventsRouter.get('/', async (_req: Request, res: Response) => {
  const tmKey = process.env.TICKETMASTER_API_KEY
  const ebToken = process.env.EVENTBRITE_TOKEN

  if (!tmKey && !ebToken) {
    return res.json({ events: FALLBACK_EVENTS })
  }

  try {
    const [tmEvents, ebEvents] = await Promise.all([
      tmKey ? fetchTicketmaster(tmKey) : Promise.resolve([]),
      ebToken ? fetchEventbrite(ebToken) : Promise.resolve([]),
    ])

    const events = [...tmEvents, ...ebEvents]
    if (events.length === 0) return res.json({ events: FALLBACK_EVENTS })

    res.json({ events })
  } catch (err) {
    console.error('Events fetch failed:', err)
    res.json({ events: FALLBACK_EVENTS })
  }
})

export default eventsRouter
