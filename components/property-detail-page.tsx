"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Users,
  Bed,
  Wifi,
  Utensils,
  Dumbbell,
  Droplet,
  Trees,
  Wind,
  Tv,
  Coffee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

// Định nghĩa interface cho dữ liệu từ db.json
interface Facility {
  icon: string
  label: string
  description: string
}

interface Review {
  id: number
  author: string
  avatar: string
  rating: number
  date: string
  text: string
}

interface Property {
  id: string
  title: string
  location: string
  rating: number
  reviewsCount: number
  price: number
  beds: number
  guests: number
  image: string
  description: string
  facilities: Facility[]
  reviews: Review[]
}

interface PropertyDetailPageProps {
  propertyId: string
  onBack: () => void
  onBooking: () => void
}

export function PropertyDetailPage({ propertyId, onBack, onBooking }: PropertyDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Map icon strings to Lucide components
  const iconMap: { [key: string]: React.ElementType } = {
    Wifi,
    Utensils,
    Dumbbell,
    Droplet,
    Trees,
    Wind,
    Tv,
    Coffee,
  }

  // Fetch dữ liệu từ db.json
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://192.168.1.18:3001/hotels/${propertyId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch property")
        }
        const data = await response.json()

        // Chuyển đổi dữ liệu từ db.json để khớp với cấu trúc component
        const formattedProperty: Property = {
          id: data.id,
          title: data.title,
          location: data.location,
          rating: data.rating,
          reviewsCount: data.reviewsCount,
          price: data.rooms[0]?.price || 0, // Lấy giá của phòng đầu tiên (hoặc logic khác tùy yêu cầu)
          beds: data.rooms.reduce((total: number, room: any) => total + (room.beds.match(/\d+/)?.[0] || 0), 0), // Tính tổng số giường
          guests: data.rooms.reduce((max: number, room: any) => Math.max(max, room.maxGuests), 0), // Lấy số khách tối đa
          image: data.image,
          description: data.description,
          facilities: data.facilities,
          reviews: data.reviews,
        }

        setProperty(formattedProperty)

        // Kiểm tra trạng thái yêu thích (giả sử bạn có userId, ví dụ: u001)
        const favoritesResponse = await fetch(
          `http://192.168.1.18:3001/favorites?userId=u001&propertyId=${propertyId}`
        )
        const favoritesData = await favoritesResponse.json()
        setIsFavorite(favoritesData.length > 0)
      } catch (err) {
        setError("Failed to load property details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  // Xử lý toggle favorite
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        const favorite = await fetch(
          `http://192.168.1.18:3001/favorites?userId=u001&propertyId=${propertyId}`
        )
        const favoriteData = await favorite.json()
        if (favoriteData[0]) {
          await fetch(`http://192.168.1.18:3001/favorites/${favoriteData[0].id}`, {
            method: "DELETE",
          })
        }
      } else {
        // Thêm vào danh sách yêu thích
        await fetch("http://192.168.1.18:3001/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "u001", // Giả sử userId hiện tại
            propertyId: parseInt(propertyId),
          }),
        })
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Xử lý loading và error
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {error || "Property not found"}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Image */}
      <div className="relative">
        <img src={property.image || "/placeholder.svg"} alt={property.title} className="w-full h-64 object-cover" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors dark:bg-gray-800/90 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="bg-white/90 hover:bg-white rounded-full transition-colors dark:bg-gray-800/90 dark:hover:bg-gray-800">
            <ThemeToggle />
          </div>
          <button
            onClick={handleToggleFavorite}
            className="bg-white/90 hover:bg-white rounded-full p-2 transition-colors dark:bg-gray-800/90 dark:hover:bg-gray-800"
          >
            <Heart size={24} className={isFavorite ? "fill-destructive text-destructive" : "text-foreground"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title and Rating */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin size={16} />
                <span>{property.location}</span>
              </div>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{property.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({property.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="text-center">
            <Bed size={24} className="mx-auto text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">{property.beds} Beds</p>
          </div>
          <div className="text-center">
            <Users size={24} className="mx-auto text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">{property.guests} Guests</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">${property.price}</span>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">About this place</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
        </div>

        {/* Facilities */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Facilities & services</h2>
          <div className="grid grid-cols-2 gap-4">
            {property.facilities.map((facility, idx) => {
              const Icon = iconMap[facility.icon] || Star // Fallback icon
              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Icon size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{facility.label}</p>
                    <p className="text-xs text-muted-foreground">{facility.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Services (Không có trong db.json, giả sử là tính năng tùy chọn) */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Services</h2>
          <div className="space-y-4">
            {[
              { label: "Cleaning & laundry", items: ["Daily cleaning", "Laundry service"] },
              { label: "Bathroom", items: ["Bathtub", "Hot tub", "Shower"] },
              { label: "Kitchen", items: ["Dishwasher", "Microwave", "Oven"] },
            ].map((service, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-foreground mb-2">{service.label}</h3>
                <ul className="space-y-1">
                  {service.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Reviews</h2>
            <a href="#" className="text-primary text-sm font-semibold hover:underline">
              See all
            </a>
          </div>
          <div className="space-y-4">
            {property.reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-border last:border-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{review.author}</p>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={onBooking}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200"
        >
          Book now
        </Button>
      </div>
    </div>
  )
}