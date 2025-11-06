"use client"

import { ChevronLeft, Heart } from "lucide-react"
import { PropertyCard } from "@/components/property-card"

interface FavoritesPageProps {
  
  favorites: any[]
  onBack: () => void
  onToggleFavorite: (id: string) => void
}

export function FavoritesPage({ favorites, onBack, onToggleFavorite }: FavoritesPageProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Places you liked</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No favorites yet</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggleFavorite={() => onToggleFavorite(property.id)}
                isFavorite={true}
              />
            ))}
          </div>
        )}
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

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
