import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { events } from './events'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

type EventItem = {
  id: string
  title: string
  venue: string
  startsAt: string
  lat: number
  lng: number
  category: string
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? events[0],
    [selectedEventId]
  )

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
      const style = map.getStyle()
      const layers = style.layers || []

      layers.forEach((layer) => {
        const id = layer.id.toLowerCase()

        // hide poi clutter
        if (id.includes('poi')) {
          if (map.getLayer(layer.id)) {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          }
        }
      })

      events.forEach((event) => {
        const el = document.createElement('div')
        el.className = 'event-marker'

        new mapboxgl.Marker(el)
          .setLngLat([event.lng, event.lat])
          .addTo(map)

        el.addEventListener('click', () => {
          setSelectedEventId(event.id)
          map.flyTo({
            center: [event.lng, event.lat],
            zoom: 13.5,
            essential: true,
          })
        })
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

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
                mapRef.current?.flyTo({
                  center: [event.lng, event.lat],
                  zoom: 13.5,
                  essential: true,
                })
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