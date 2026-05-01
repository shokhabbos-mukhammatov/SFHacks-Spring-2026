import { Router, Request, Response, NextFunction } from 'express'

const eventsRouter = Router()
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json'

const FALLBACK_EVENTS = [
  { id: '1', title: 'AI Hack Night', venue: 'SoMa, San Francisco', startsAt: '6:30 PM', lat: 37.7827, lng: -122.3972, category: 'Hack Night', description: 'An evening of hacking, networking, and demos with SF\'s top builders.' },
  { id: '2', title: 'Founder Coffee Meetup', venue: 'Financial District, SF', startsAt: '7:00 PM', lat: 37.7937, lng: -122.3965, category: 'Networking', description: 'Casual coffee meetup for founders and startup enthusiasts in the Financial District.' },
  { id: '3', title: 'Design + Product Mixer', venue: 'Mission District, SF', startsAt: '7:30 PM', lat: 37.7597, lng: -122.4148, category: 'Mixer', description: 'Designers and product managers come together for drinks and conversation.' },
]

function formatTime(localDate: string, localTime?: string): string {
  if (!localTime) return localDate
  const dt = new Date(`${localDate}T${localTime}`)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(dt)
}

eventsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.TICKETMASTER_API_KEY
  console.log('API key loaded:', apiKey ? `${apiKey.slice(0, 6)}...` : 'MISSING')
  if (!apiKey) return res.status(503).json({ error: 'TICKETMASTER_API_KEY not configured' })

  const params = new URLSearchParams({
    apikey: apiKey,
    city: 'San Francisco',
    countryCode: 'US',
    size: '50',
    sort: 'date,asc',
  })

  try {
    const tmRes = await fetch(`${TM_BASE}?${params}`)
    if (!tmRes.ok) {
      const body = await tmRes.text()
      console.error('Ticketmaster error', tmRes.status, body)
      return res.json({ events: FALLBACK_EVENTS })
    }
    const data = (await tmRes.json()) as any

    const events = (data._embedded?.events ?? [])
      .filter((e: any) => e._embedded?.venues?.[0]?.location?.latitude)
      .map((e: any) => {
        const venue = e._embedded.venues[0]
        const cat = e.classifications?.[0]
        return {
          id: e.id,
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

    res.json({ events })
  } catch (err) {
    console.error('Events fetch failed:', err)
    res.json({ events: FALLBACK_EVENTS })
  }
})

export default eventsRouter
