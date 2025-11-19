// Simple Leaflet map component for hotel locations
"use client"

import { useEffect, useRef, useState } from 'react'

interface MapViewProps {
  latitude: number
  longitude: number
  hotelName: string
  className?: string
}

export function MapView({ latitude, longitude, hotelName, className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      try {
        setIsLoading(true)
        setError(null)

        const L = await import('leaflet')
        
        // Fix default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        if (mapRef.current && !mapInstanceRef.current) {
          // Create map
          const map = L.map(mapRef.current).setView([latitude, longitude], 15)
          mapInstanceRef.current = map

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          // Add marker
          const marker = L.marker([latitude, longitude]).addTo(map)
          marker.bindPopup(`<b>${hotelName}</b>`).openPopup()

          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error loading map:', err)
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      loadLeaflet()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, hotelName])

  if (error) {
    return (
      <div className="w-full h-64 rounded-lg border border-border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted rounded-lg border border-border h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full h-64 rounded-lg overflow-hidden border border-border ${className}`}
        style={{ zIndex: 0 }}
      />
    </div>
  )
}
