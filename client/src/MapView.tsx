import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { EventItem } from './events'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

const CATEGORY_COLORS: Record<string, string> = {
  Music:                      '#f43f5e', // red-pink — concerts
  Sports:                     '#3b82f6', // blue — sports
  'Arts & Theatre':           '#f97316', // orange — arts
  Film:                       '#eab308', // yellow — film
  Free:                       '#22c55e', // green — free events
  Meetup:                     '#22c55e', // green — meetups (usually free)
  'Community & Culture':      '#22c55e',
  'Science & Technology':     '#06b6d4', // cyan — tech events
  Technology:                 '#06b6d4',
  'Business & Professional':  '#06b6d4',
  'Food & Drink':             '#fb923c', // orange — food
  'Performing & Visual Arts': '#f97316',
  'Health & Wellness':        '#4ade80',
  'Hack Night':               '#8b5cf6', // purple — hackathons
  Networking:                 '#a78bfa', // violet — networking
  Mixer:                      '#a855f7',
}

function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#94a3b8' // slate default
}

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [popupEvent, setPopupEvent] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.events)) setEvents(data.events) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? events[0],
    [selectedEventId, events]
  )

  const flyToEvent = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 13.5,
      essential: true,
    })
  }, [])

  // Map initialisation — runs once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749],
      zoom: 12,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      const layers = map.getStyle()?.layers ?? []
      layers.forEach((layer) => {
        if (layer.id.toLowerCase().includes('poi') && map.getLayer(layer.id)) {
          map.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [flyToEvent])

  // Add markers whenever events load
  useEffect(() => {
    const map = mapRef.current
    if (!map || events.length === 0) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const addMarkers = () => {
      events.forEach((event) => {
        const el = document.createElement('div')
        el.className = 'event-marker'
        el.setAttribute('aria-label', event.title)
        el.style.backgroundColor = categoryColor(event.category)
        el.style.boxShadow = `0 0 0 6px ${categoryColor(event.category)}33`

        const marker = new mapboxgl.Marker(el).setLngLat([event.lng, event.lat]).addTo(map)

        el.addEventListener('click', () => {
          setSelectedEventId(event.id)
          setPopupEvent(event)
          flyToEvent(event.lng, event.lat)
        })

        markersRef.current.push(marker)
      })
    }

    if (map.isStyleLoaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }
  }, [events, flyToEvent])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="page token-error">
        <p>
          Mapbox token is missing. Set <code>VITE_MAPBOX_TOKEN</code> in your{' '}
          <code>.env</code> file.
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <div ref={mapContainerRef} className="map" />

      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-title">Tonight nearby</div>
          <div className="sheet-subtitle">
            {loading ? 'Loading events…' : `${events.length} public events`}
          </div>
        </div>

        <div className="event-list">
          {events.map((event) => (
            <button
              key={event.id}
              className={`event-card ${selectedEvent?.id === event.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedEventId(event.id)
                setPopupEvent(event)
                flyToEvent(event.lng, event.lat)
              }}
            >
              <div className="event-title">{event.title}</div>
              <div className="event-meta">
                {event.venue} · {event.startsAt}
              </div>
              <div className="event-tag" style={{ background: `${categoryColor(event.category)}33`, color: categoryColor(event.category) }}>{event.category}</div>
            </button>
          ))}
        </div>
      </div>

      {popupEvent && (
        <div className="event-popup-backdrop" onClick={() => setPopupEvent(null)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <button className="event-popup-close" onClick={() => setPopupEvent(null)}>✕</button>
            <div className="event-popup-tag" style={{ background: `${categoryColor(popupEvent.category)}33`, color: categoryColor(popupEvent.category) }}>{popupEvent.category}</div>
            <div className="event-popup-title">{popupEvent.title}</div>
            <div className="event-popup-row">📍 {popupEvent.venue}</div>
            <div className="event-popup-row">🕐 {popupEvent.startsAt}</div>
            {popupEvent.description && (
              <div className="event-popup-desc">{popupEvent.description}</div>
            )}
            <a
              className="event-popup-btn"
              href={popupEvent.url ?? `https://www.ticketmaster.com/search?q=${encodeURIComponent(popupEvent.title)}`}
              target="_blank"
              rel="noreferrer"
            >
              Register for this event →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
