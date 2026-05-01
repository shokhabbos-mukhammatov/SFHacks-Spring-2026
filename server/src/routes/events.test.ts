import { describe, expect, it } from 'vitest'
import { getEventById, getNearbyBusinesses, getRandomEvent, listEvents } from '../services/events'

describe('events service', () => {
  it('lists events by category', () => {
    const results = listEvents({ category: 'tech', tags: [] })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((event) => event.category === 'tech')).toBe(true)
  })

  it('gets a single event by id', () => {
    expect(getEventById('evt-ai-hack-night')?.title).toBe('AI Hack Night')
  })

  it('returns a random upcoming event', () => {
    const result = getRandomEvent()
    expect(result).not.toBeNull()
    expect(result?.event.title).toBeTruthy()
    expect(result?.prompt).toContain(result?.event.title ?? '')
  })

  it('returns nearby businesses for an event', () => {
    const businesses = getNearbyBusinesses('evt-ai-hack-night', { type: 'coffee' })
    expect(businesses).not.toBeNull()
    expect(businesses?.length).toBeGreaterThan(0)
    expect(businesses?.every((business) => business.category === 'coffee')).toBe(true)
  })
})
