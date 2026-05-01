export type EventItem = {
  id: string
  title: string
  venue: string
  address?: string
  startsAt: string
  lat: number
  lng: number
  category: string
  isFree?: boolean
  description?: string
  url?: string
}
