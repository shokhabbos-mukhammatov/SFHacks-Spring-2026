import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
console.log('TOKEN:', import.meta.env.VITE_MAPBOX_TOKEN)
import MapView from './MapView'

export default function App() {
  return <MapView />
}