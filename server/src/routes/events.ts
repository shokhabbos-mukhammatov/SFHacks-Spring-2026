import { Router, Request, Response } from 'express'

const eventsRouter = Router()
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'

const FALLBACK_EVENTS = [
  { id: '1', title: 'AI Hack Night', venue: 'SoMa, San Francisco', startsAt: '6:30 PM', lat: 37.7827, lng: -122.3972, category: 'Hack Night', isFree: true, description: "An evening of hacking, networking, and demos with SF's top builders." },
  { id: '2', title: 'Founder Coffee Meetup', venue: 'Financial District, SF', startsAt: '7:00 PM', lat: 37.7937, lng: -122.3965, category: 'Networking', isFree: true, description: 'Casual coffee meetup for founders and startup enthusiasts in the Financial District.' },
  { id: '3', title: 'Design + Product Mixer', venue: 'Mission District, SF', startsAt: '7:30 PM', lat: 37.7597, lng: -122.4148, category: 'Mixer', isFree: false, description: 'Designers and product managers come together for drinks and conversation.' },
]

function formatTime(localDate: string, localTime?: string): string {
  if (!localTime) return localDate
  const dt = new Date(`${localDate}T${localTime}`)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(dt)
}

async function fetchTicketmaster(apiKey: string): Promise<any[]> {
  const base = { apikey: apiKey, city: 'San Francisco', countryCode: 'US', size: '20', sort: 'date,asc' }
  const classifications = ['Music', 'Sports', 'Arts & Theatre', 'Miscellaneous']

  const responses = await Promise.all(
    classifications.map((c) =>
      fetch(`${TM_BASE}?${new URLSearchParams({ ...base, classificationName: c })}`)
    )
  )

  const results: any[] = []
  for (const res of responses) {
    if (!res.ok) { console.error('TM error', res.status); continue }
    const data = await res.json() as any
    results.push(...(data._embedded?.events ?? []))
  }

  const seen = new Set<string>()
  return results
    .filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return e._embedded?.venues?.[0]?.location?.latitude
    })
    .map((e) => {
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
        isFree: !e.priceRanges || e.priceRanges?.[0]?.min === 0,
        address: [venue.address?.line1, venue.city?.name, venue.state?.stateCode].filter(Boolean).join(', ') || undefined,
        description: e.info ?? e.pleaseNote ?? undefined,
        url: e.url ?? undefined,
      }
    })
}

eventsRouter.get('/', async (_req: Request, res: Response) => {
  const tmKey = process.env.TICKETMASTER_API_KEY
  if (!tmKey) return res.json({ events: FALLBACK_EVENTS })

  try {
    const events = await fetchTicketmaster(tmKey)
    res.json({ events: events.length > 0 ? events : FALLBACK_EVENTS })
  } catch (err) {
    console.error('Events fetch failed:', err)
    res.json({ events: FALLBACK_EVENTS })
  }
})

export default eventsRouter
