"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

interface FilterModalProps {
  onClose: () => void
  onApply: (filters: any) => void
}

export function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [priceRange, setPriceRange] = useState([50, 500])
  const [selectedType, setSelectedType] = useState<string[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])

  const placeTypes = [
    { id: "entire", label: "Entire place", description: "A whole place with a private bathroom" },
    { id: "private", label: "Private room", description: "A room with a private bathroom" },
    { id: "dorm", label: "Dormitory", description: "A shared room with shared bathroom" },
  ]

  const facilities = [
    { id: "pool", label: "Pool" },
    { id: "garden", label: "Garden" },
    { id: "wifi", label: "WiFi" },
    { id: "kitchen", label: "Kitchen" },
    { id: "ac", label: "Air conditioning" },
    { id: "parking", label: "Parking" },
    { id: "gym", label: "Exercise equipment" },
    { id: "tv", label: "TV" },
  ]

  const toggleType = (id: string) => {
    setSelectedType((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleFacility = (id: string) => {
    setSelectedFacilities((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleApply = () => {
    onApply({
      priceRange,
      placeTypes: selectedType,
      facilities: selectedFacilities,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in">
      <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-card rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Filters</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-8">
          {/* Price Range */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Price range</h3>
            <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={1000} step={10} className="mb-4" />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Type of Place */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Type of place</h3>
            <div className="space-y-3">
              {placeTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={selectedType.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={selectedFacilities.includes(facility.id)}
                    onCheckedChange={() => toggleFacility(facility.id)}
                  />
                  <span className="text-sm text-foreground">{facility.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-4 py-4 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
          >
            Clear all
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            View results
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
