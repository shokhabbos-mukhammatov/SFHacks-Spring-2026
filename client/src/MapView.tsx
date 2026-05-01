import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { EventItem } from './events'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

const CATEGORY_COLORS: Record<string, string> = {
  Music:                      '#f43f5e',
  Sports:                     '#3b82f6',
  'Arts & Theatre':           '#f97316',
  Film:                       '#eab308',
  Free:                       '#22c55e',
  Meetup:                     '#22c55e',
  'Community & Culture':      '#22c55e',
  'Science & Technology':     '#06b6d4',
  Technology:                 '#06b6d4',
  'Business & Professional':  '#06b6d4',
  'Food & Drink':             '#fb923c',
  'Performing & Visual Arts': '#f97316',
  'Health & Wellness':        '#4ade80',
  Concert:                    '#f43f5e',
  Theater:                    '#f97316',
  Comedy:                     '#eab308',
  'Hack Night':               '#8b5cf6',
  Networking:                 '#a78bfa',
  Mixer:                      '#a855f7',
}

const SF_BOUNDS = { minLat: 37.63, maxLat: 37.93, minLng: -122.55, maxLng: -122.33 }
function inSF(lat: number, lng: number) {
  return lat >= SF_BOUNDS.minLat && lat <= SF_BOUNDS.maxLat && lng >= SF_BOUNDS.minLng && lng <= SF_BOUNDS.maxLng
}

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? '#94a3b8'
}

if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN

interface GeoSuggestion { place_name: string; center: [number, number] }

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [popupEvent, setPopupEvent] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [paidFilter, setPaidFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.events))
          setEvents(data.events.filter((e: EventItem) => inSF(e.lat, e.lng)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(events.map((e) => e.category))).sort()
    return ['All', ...cats]
  }, [events])

  const filteredEvents = useMemo(() => events.filter((e) => {
    if (activeCategory !== 'All' && e.category !== activeCategory) return false
    if (paidFilter === 'free' && !e.isFree) return false
    if (paidFilter === 'paid' && e.isFree) return false
    return true
  }), [events, activeCategory, paidFilter])

  const selectedEvent = useMemo(
    () => filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0],
    [selectedEventId, filteredEvents]
  )

  const flyTo = useCallback((lng: number, lat: number, zoom = 13.5) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, essential: true })
  }, [])

  // Map init
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
      map.getStyle()?.layers?.forEach((layer) => {
        if (layer.id.toLowerCase().includes('poi') && map.getLayer(layer.id))
          map.setLayoutProperty(layer.id, 'visibility', 'none')
      })
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [flyTo])

  // Markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    if (filteredEvents.length === 0) return
    const add = () => {
      filteredEvents.forEach((event) => {
        const el = document.createElement('div')
        el.className = 'event-marker'
        el.setAttribute('aria-label', event.title)
        el.style.backgroundColor = categoryColor(event.category)
        el.style.boxShadow = `0 0 0 6px ${categoryColor(event.category)}33`
        const marker = new mapboxgl.Marker(el).setLngLat([event.lng, event.lat]).addTo(map)
        el.addEventListener('click', () => { setSelectedEventId(event.id); setPopupEvent(event); flyTo(event.lng, event.lat) })
        markersRef.current.push(marker)
      })
    }
    if (map.isStyleLoaded()) add(); else map.once('load', add)
  }, [filteredEvents, flyTo])

  // Geocode as user types
  useEffect(() => {
    if (!query.trim() || !MAPBOX_TOKEN) { setSuggestions([]); return }
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=-122.4194,37.7749&country=us&types=address,place,poi&limit=5`
        const res = await fetch(url)
        const data = await res.json()
        setSuggestions(data.features?.map((f: any) => ({ place_name: f.place_name, center: f.center })) ?? [])
      } catch { setSuggestions([]) }
    }, 300)
  }, [query])

  // Current location
  const goToCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { longitude, latitude } = coords
        flyTo(longitude, latitude, 14)
        // Place/replace blue dot
        userMarkerRef.current?.remove()
        const el = document.createElement('div')
        el.className = 'user-marker'
        userMarkerRef.current = new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(mapRef.current!)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const pickSuggestion = (s: GeoSuggestion) => {
    flyTo(s.center[0], s.center[1], 14)
    setQuery(s.place_name)
    setSuggestions([])
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="page token-error">
        <p>Mapbox token is missing. Set <code>VITE_MAPBOX_TOKEN</code> in your <code>.env</code> file.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div ref={mapContainerRef} className="map" />

      {/* Search bar */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); setSuggestions([]) } }}
          />
          {query && <button className="search-clear" onClick={() => { setQuery(''); setSuggestions([]) }}>✕</button>}
        </div>
        <button className="locate-btn" onClick={goToCurrentLocation} title="Use current location">
          {locating ? '…' : '📍'}
        </button>
        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((s) => (
              <li key={s.place_name} onClick={() => pickSuggestion(s)}>{s.place_name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bottom-sheet">
        <div className="sheet-header">
          <div className="sheet-title">Tonight nearby</div>
          <div className="sheet-subtitle">
            {loading ? 'Loading events…' : `${filteredEvents.length} of ${events.length} events`}
          </div>
        </div>

        <div className="filter-row">
          {(['all', 'free', 'paid'] as const).map((f) => (
            <button key={f} className={`filter-pill ${paidFilter === f ? 'active' : ''}`} onClick={() => setPaidFilter(f)}>
              {f === 'all' ? 'All' : f === 'free' ? '🟢 Free' : '💳 Paid'}
            </button>
          ))}
          <div className="filter-divider" />
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              style={cat !== 'All' && activeCategory === cat ? { background: `${categoryColor(cat)}33`, color: categoryColor(cat), borderColor: categoryColor(cat) } : {}}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="event-list">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              className={`event-card ${selectedEvent?.id === event.id ? 'active' : ''}`}
              onClick={() => { setSelectedEventId(event.id); setPopupEvent(event); flyTo(event.lng, event.lat) }}
            >
              <div className="event-title">{event.title}</div>
              <div className="event-meta">{event.venue} · {event.startsAt}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <div className="event-tag" style={{ background: `${categoryColor(event.category)}33`, color: categoryColor(event.category) }}>{event.category}</div>
                {event.isFree && <div className="event-tag" style={{ background: '#22c55e22', color: '#22c55e' }}>Free</div>}
              </div>
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
            <div className="event-popup-row">📍 {popupEvent.venue}{popupEvent.address ? ` — ${popupEvent.address}` : ''}</div>
            <div className="event-popup-row">🕐 {popupEvent.startsAt}</div>
            {popupEvent.description && <div className="event-popup-desc">{popupEvent.description}</div>}
            <a className="event-popup-btn" href={popupEvent.url ?? `https://www.ticketmaster.com/search?q=${encodeURIComponent(popupEvent.title)}`} target="_blank" rel="noreferrer">
              Register for this event →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
