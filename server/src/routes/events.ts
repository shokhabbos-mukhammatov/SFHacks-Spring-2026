import { Router, type Request, type Response } from 'express'
import {
  getEventById,
  getNearbyBusinesses,
  getRandomEvent,
  listEvents,
  parseTags,
} from '../services/events'
import type { BusinessCategory, EventCategory } from '../data/events'

const eventsRouter = Router()
eventsRouter.get('/', (req: Request, res: Response) => {
  const category = req.query.category as EventCategory | undefined
  const tags = parseTags(req.query.tags as string | string[] | undefined)

  const results = listEvents({ category, tags })

  res.json({
    count: results.length,
    events: results,
  })
})

eventsRouter.get('/random', (req: Request, res: Response) => {
  const category = req.query.category as EventCategory | undefined
  const tags = parseTags(req.query.tags as string | string[] | undefined)

  const result = getRandomEvent({ category, tags })

  if (!result) {
    res.status(404).json({ error: 'No upcoming events matched the provided filters.' })
    return
  }

  res.json(result)
})

eventsRouter.get('/:id', (req: Request, res: Response) => {
  const event = getEventById(req.params.id)

  if (!event) {
    res.status(404).json({ error: 'Event not found.' })
    return
  }

  res.json(event)
})

eventsRouter.get('/:id/nearby-businesses', (req: Request, res: Response) => {
  const type = req.query.type as BusinessCategory | undefined
  const radiusMeters = req.query.radiusMeters
    ? Number(req.query.radiusMeters)
    : undefined

  const businesses = getNearbyBusinesses(req.params.id, { type, radiusMeters })

  if (!businesses) {
    res.status(404).json({ error: 'Event not found.' })
    return
  }

  res.json({
    eventId: req.params.id,
    count: businesses.length,
    businesses,
  })
})

export default eventsRouter
