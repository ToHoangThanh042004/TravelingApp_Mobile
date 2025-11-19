// Component to display all hotels on a single map
"use client"

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface Hotel {
  id: string
  title: string
  location: string
  rating: number
  image: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface AllHotelsMapProps {
  hotels: Hotel[]
  onSelectHotel: (hotelId: string) => void
  onClose: () => void
}

export function AllHotelsMap({ hotels, onSelectHotel, onClose }: AllHotelsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter hotels that have coordinates
  const hotelsWithCoords = hotels.filter(h => h.coordinates?.latitude && h.coordinates?.longitude)

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

        if (mapRef.current && !mapInstanceRef.current && hotelsWithCoords.length > 0) {
          // Calculate center point (average of all coordinates)
          const avgLat = hotelsWithCoords.reduce((sum, h) => sum + (h.coordinates?.latitude || 0), 0) / hotelsWithCoords.length
          const avgLng = hotelsWithCoords.reduce((sum, h) => sum + (h.coordinates?.longitude || 0), 0) / hotelsWithCoords.length

          // Create map centered on Vietnam
          const map = L.map(mapRef.current).setView([avgLat, avgLng], 6)
          mapInstanceRef.current = map

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          // Add markers for each hotel
          const bounds: any[] = []
          hotelsWithCoords.forEach((hotel) => {
            if (hotel.coordinates) {
              const lat = hotel.coordinates.latitude
              const lng = hotel.coordinates.longitude
              bounds.push([lat, lng])

              const marker = L.marker([lat, lng]).addTo(map)
              
              // Create popup with hotel info
              const popupContent = `
                <div style="min-width: 200px;">
                  <img src="${hotel.image}" alt="${hotel.title}" 
                       style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                  <h3 style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">${hotel.title}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📍 ${hotel.location}</p>
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">⭐ ${hotel.rating}/5</p>
                  <button 
                    onclick="window.selectHotel_${hotel.id}()"
                    style="width: 100%; padding: 8px; background: #0ea5e9; color: white; border: none; 
                           border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;"
                  >
                    View Details
                  </button>
                </div>
              `
              
              marker.bindPopup(popupContent)

              // Add click handler for the button in popup
              ;(window as any)[`selectHotel_${hotel.id}`] = () => {
                onSelectHotel(hotel.id)
              }
            }
          })

          // Fit map to show all markers
          if (bounds.length > 1) {
            map.fitBounds(bounds as any, { padding: [50, 50] })
          }

          setIsLoading(false)
        } else if (hotelsWithCoords.length === 0) {
          setError('No hotels with location data')
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
      // Clean up click handlers
      hotelsWithCoords.forEach((hotel) => {
        delete (window as any)[`selectHotel_${hotel.id}`]
      })
    }
  }, [hotels, hotelsWithCoords.length, onSelectHotel])

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Hotels Map</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Hotels Map</h2>
            <p className="text-sm text-muted-foreground">
              {hotelsWithCoords.length} hotel{hotelsWithCoords.length !== 1 ? 's' : ''} with locations
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className="w-full h-full"
            style={{ zIndex: 0 }}
          />
        </div>

        {/* Legend */}
        <div className="bg-card border-t border-border p-4">
          <p className="text-sm text-muted-foreground text-center">
            📍 Tap on any marker to view hotel details
          </p>
        </div>
      </div>
    </div>
  )
}
