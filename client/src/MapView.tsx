import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { events } from './events'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? events[0],
    [selectedEventId]
  )

  const flyToEvent = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 13.5,
      essential: true,
    })
  }, [])

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

      events.forEach((event) => {
        const el = document.createElement('div')
        el.className = 'event-marker'
        el.setAttribute('aria-label', event.title)

        new mapboxgl.Marker(el).setLngLat([event.lng, event.lat]).addTo(map)

        el.addEventListener('click', () => {
          setSelectedEventId(event.id)
          flyToEvent(event.lng, event.lat)
        })
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [flyToEvent])

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
          <div className="sheet-subtitle">Public events for students</div>
        </div>

        <div className="event-list">
          {events.map((event) => (
            <button
              key={event.id}
              className={`event-card ${selectedEvent?.id === event.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedEventId(event.id)
                flyToEvent(event.lng, event.lat)
              }}
            >
              <div className="event-title">{event.title}</div>
              <div className="event-meta">
                {event.venue} · {event.startsAt}
              </div>
              <div className="event-tag">{event.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}