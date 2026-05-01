export type EventCategory = 'tech' | 'social' | 'music' | 'career' | 'arts'

export type Event = {
  id: string
  title: string
  description: string
  category: EventCategory
  venueName: string
  address: string
  lat: number
  lng: number
  startTime: string
  endTime: string
  tags: string[]
  imageUrl?: string
  price: string
}

export type BusinessCategory = 'coffee' | 'food' | 'bar' | 'parking'

export type Business = {
  id: string
  name: string
  category: BusinessCategory
  address: string
  lat: number
  lng: number
}

export const events: Event[] = [
  {
    id: 'evt-ai-hack-night',
    title: 'AI Hack Night',
    description: 'Build and demo small AI projects with other students.',
    category: 'tech',
    venueName: 'SoMa Commons',
    address: '123 Howard St, San Francisco, CA',
    lat: 37.7812,
    lng: -122.3984,
    startTime: '2026-05-01T18:30:00.000Z',
    endTime: '2026-05-01T21:00:00.000Z',
    tags: ['networking', 'coding', 'students'],
    price: 'free',
  },
  {
    id: 'evt-founder-coffee',
    title: 'Founder Coffee Meetup',
    description: 'Casual meetup for builders, founders, and curious students.',
    category: 'career',
    venueName: 'Financial District Loft',
    address: '456 California St, San Francisco, CA',
    lat: 37.7936,
    lng: -122.3999,
    startTime: '2026-05-01T19:00:00.000Z',
    endTime: '2026-05-01T20:30:00.000Z',
    tags: ['coffee', 'founders', 'networking'],
    price: 'free',
  },
  {
    id: 'evt-design-mixer',
    title: 'Design + Product Mixer',
    description: 'Meet designers and PMs for a fast-paced evening mixer.',
    category: 'social',
    venueName: 'Mission Studio',
    address: '789 Valencia St, San Francisco, CA',
    lat: 37.7597,
    lng: -122.4213,
    startTime: '2026-05-01T19:30:00.000Z',
    endTime: '2026-05-01T22:00:00.000Z',
    tags: ['design', 'product', 'mixer'],
    price: '$10',
  },
  {
    id: 'evt-jazz-night',
    title: 'Late Jazz Night',
    description: 'A small live jazz set in a cozy neighborhood venue.',
    category: 'music',
    venueName: 'North Beach Room',
    address: '234 Columbus Ave, San Francisco, CA',
    lat: 37.7982,
    lng: -122.4078,
    startTime: '2026-05-02T02:00:00.000Z',
    endTime: '2026-05-02T04:00:00.000Z',
    tags: ['music', 'nightlife', 'cozy'],
    price: '$15',
  },
]

export const businesses: Business[] = [
  {
    id: 'biz-blue-bottle-soma',
    name: 'Blue Bottle Coffee',
    category: 'coffee',
    address: '2 Mint Plaza, San Francisco, CA',
    lat: 37.7821,
    lng: -122.4071,
  },
  {
    id: 'biz-philz-fi-di',
    name: 'Philz Coffee',
    category: 'coffee',
    address: '5 Embarcadero Center, San Francisco, CA',
    lat: 37.7941,
    lng: -122.3978,
  },
  {
    id: 'biz-ritual-mission',
    name: 'Ritual Coffee Roasters',
    category: 'coffee',
    address: '1026 Valencia St, San Francisco, CA',
    lat: 37.7569,
    lng: -122.421,
  },
  {
    id: 'biz-souvla-hayes',
    name: 'Souvla',
    category: 'food',
    address: '517 Hayes St, San Francisco, CA',
    lat: 37.7763,
    lng: -122.4241,
  },
  {
    id: 'biz-north-beach-garage',
    name: 'North Beach Parking Garage',
    category: 'parking',
    address: '735 Vallejo St, San Francisco, CA',
    lat: 37.7988,
    lng: -122.4086,
  },
]
