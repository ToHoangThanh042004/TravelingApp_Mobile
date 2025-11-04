import { Heart, Star, MapPin } from "lucide-react"

interface Property {
  id: string
  title: string
  location: string
  price: number
  rating: number
  reviewsCount: number
  image: string
  type: string
  beds: number
  isFavorite: boolean
}

interface PropertyCardProps {
  property: Property
  onToggleFavorite: () => void
  isFavorite: boolean
}

export function PropertyCard({ property, onToggleFavorite, isFavorite }: PropertyCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
      {/* Image Container */}
      <div className="relative h-48 bg-muted overflow-hidden group">
        <img
          src={property.image || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-md"
        >
          <Heart
            size={20}
            className={`transition-colors duration-200 ${
              isFavorite ? "fill-primary text-primary" : "text-foreground hover:text-primary"
            }`}
          />
        </button>

        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-foreground">
          {property.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin size={14} />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-primary text-primary" />
          <span className="text-xs font-semibold text-foreground">{property.rating}</span>
          <span className="text-xs text-muted-foreground">({property.reviewsCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-foreground">${property.price}</span>
          <span className="text-xs text-muted-foreground">/night</span>
        </div>
      </div>
    </div>
  )
}