"use client"

import { Coffee, ShoppingBag, Utensils, Landmark, MapPin } from "lucide-react"

interface NearbyPlace {
  id: string
  name: string
  type: string
  category: string
  distance: number
  unit: string
  rating?: number
  icon?: string
}

interface NearbyPlacesProps {
  places: NearbyPlace[]
}

const getIconComponent = (type: string) => {
  switch (type) {
    case 'restaurant':
    case 'cafe':
      return Utensils
    case 'shopping':
    case 'convenience_store':
      return ShoppingBag
    case 'attraction':
      return Landmark
    default:
      return MapPin
  }
}

const getIconEmoji = (icon?: string, type?: string) => {
  if (icon) return icon
  switch (type) {
    case 'restaurant':
      return '🍜'
    case 'cafe':
      return '☕'
    case 'shopping':
      return '🛍️'
    case 'convenience_store':
      return '🏪'
    case 'attraction':
      return '🏛️'
    default:
      return '📍'
  }
}

export function NearbyPlaces({ places }: NearbyPlacesProps) {
  if (!places || places.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Nearby Places
      </h3>

      <div className="grid gap-3">
        {places.map((place) => {
          const IconComponent = getIconComponent(place.type)
          const emoji = getIconEmoji(place.icon, place.type)

          return (
            <div
              key={place.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="text-2xl">{emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {place.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {place.category}
                </p>
                {place.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs">⭐</span>
                    <span className="text-xs font-medium">{place.rating}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary whitespace-nowrap">
                  {place.distance} {place.unit}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
