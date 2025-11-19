"use client"

import { MapPin, Navigation, Clock } from "lucide-react"

interface DistanceInfo {
  name: string
  distance: number
  unit: string
  travelTime?: {
    walking?: string
    driving?: string
  }
}

interface LocationInfoProps {
  distanceTo?: {
    airport?: DistanceInfo
    beach?: DistanceInfo | null
    cityCenter?: DistanceInfo
    trainStation?: DistanceInfo
  }
  address?: {
    fullAddress?: string
    street?: string
    district?: string
    city?: string
  }
}

export function LocationInfo({ distanceTo, address }: LocationInfoProps) {
  if (!distanceTo && !address) return null

  return (
    <div className="space-y-4">
      {/* Address */}
      {address?.fullAddress && (
        <div className="flex gap-3 items-start">
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">Address</p>
            <p className="text-sm text-muted-foreground">{address.fullAddress}</p>
          </div>
        </div>
      )}

      {/* Distances */}
      {distanceTo && (
        <div className="space-y-3">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            Distance to Key Locations
          </p>
          
          <div className="space-y-2 ml-6">
            {distanceTo.airport && (
              <div className="flex items-start justify-between gap-2 py-2 border-b border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">✈️ {distanceTo.airport.name}</p>
                  {distanceTo.airport.travelTime?.driving && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {distanceTo.airport.travelTime.driving}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  {distanceTo.airport.distance} {distanceTo.airport.unit}
                </span>
              </div>
            )}

            {distanceTo.cityCenter && (
              <div className="flex items-start justify-between gap-2 py-2 border-b border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">🏙️ {distanceTo.cityCenter.name}</p>
                  {distanceTo.cityCenter.travelTime?.walking && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {distanceTo.cityCenter.travelTime.walking} walk
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  {distanceTo.cityCenter.distance} {distanceTo.cityCenter.unit}
                </span>
              </div>
            )}

            {distanceTo.beach && (
              <div className="flex items-start justify-between gap-2 py-2 border-b border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">🏖️ {distanceTo.beach.name}</p>
                  {distanceTo.beach.travelTime?.walking && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {distanceTo.beach.travelTime.walking} walk
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  {distanceTo.beach.distance} {distanceTo.beach.unit}
                </span>
              </div>
            )}

            {distanceTo.trainStation && (
              <div className="flex items-start justify-between gap-2 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">🚂 {distanceTo.trainStation.name}</p>
                  {distanceTo.trainStation.travelTime?.driving && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {distanceTo.trainStation.travelTime.driving}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  {distanceTo.trainStation.distance} {distanceTo.trainStation.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
