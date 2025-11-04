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

interface HotelDetailPageProps {
  hotelId: string
  hotel?: Hotel | null | undefined // Allow undefined to match Page.tsx
  onBack: () => void
  onSelectRoom: (roomId: number) => void
  onToggleFavorite?: (id: string) => void
}

interface Hotel {
  id: string
  title: string
  location: string
  rating: number
  reviewsCount: number
  image: string
  description: string
  facilities: { icon: string; label: string; description: string }[]
  rooms: {
    id: number
    name: string
    size: number
    beds: string
    maxGuests: number
    view: string
    price: number
    available: boolean
    image: string
    amenities: string[]
  }[]
  reviews: {
    id: number
    author: string
    avatar: string
    rating: number
    date: string
    text: string
  }[]
}

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

export function HotelDetailPage({ hotelId, hotel: initialHotel, onBack, onSelectRoom, onToggleFavorite }: HotelDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hotel, setHotel] = useState<Hotel | null>(null) // Initialize as null
  const [isLoading, setIsLoading] = useState(true) // Always start with loading
  const [error, setError] = useState<string | null>(null)

  const CURRENT_USER_ID = "u001" // Thay bằng logic xác thực nếu có

  // Fetch dữ liệu từ db.json nếu không có initialHotel hoặc initialHotel là undefined
  useEffect(() => {
    if (initialHotel) {
      setHotel(initialHotel)
      setIsLoading(false)
      // Kiểm tra trạng thái yêu thích
      const checkFavorite = async () => {
        try {
          const favoritesResponse = await fetch(
            `http://localhost:3001/favorites?userId=${CURRENT_USER_ID}&propertyId=${hotelId}`
          )
          if (!favoritesResponse.ok) throw new Error("Failed to fetch favorites")
          const favoritesData = await favoritesResponse.json()
          setIsFavorite(favoritesData.length > 0)
        } catch (err: any) {
          console.error("Error fetching favorites:", err)
        }
      }
      checkFavorite()
      return
    }

    const fetchHotel = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Lấy chi tiết khách sạn
        const hotelResponse = await fetch(`http://localhost:3001/hotels/${hotelId}`)
        if (!hotelResponse.ok) throw new Error("Failed to fetch hotel")
        const hotelData: Hotel = await hotelResponse.json()

        setHotel(hotelData)

        // Kiểm tra trạng thái yêu thích
        const favoritesResponse = await fetch(
          `http://localhost:3001/favorites?userId=${CURRENT_USER_ID}&propertyId=${hotelId}`
        )
        if (!favoritesResponse.ok) throw new Error("Failed to fetch favorites")
        const favoritesData = await favoritesResponse.json()
        setIsFavorite(favoritesData.length > 0)
      } catch (err: any) {
        setError(err.message || "Failed to load hotel details")
        console.error("Error fetching hotel:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotel()
  }, [hotelId, initialHotel])

  // Xử lý toggle favorite
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        const favoriteResponse = await fetch(
          `http://localhost:3001/favorites?userId=${CURRENT_USER_ID}&propertyId=${hotelId}`
        )
        const favoriteData = await favoriteResponse.json()
        if (favoriteData[0]) {
          await fetch(`http://localhost:3001/favorites/${favoriteData[0].id}`, {
            method: "DELETE",
          })
        }
      } else {
        // Thêm vào danh sách yêu thích
        await fetch("http://localhost:3001/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            propertyId: hotelId, // Sử dụng chuỗi thay vì parseInt
          }),
        })
      }
      setIsFavorite(!isFavorite)
      if (onToggleFavorite) {
        onToggleFavorite(hotelId) // Gọi callback để đồng bộ với Page.tsx
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Xử lý trạng thái loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Xử lý trạng thái lỗi hoặc không tìm thấy khách sạn
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive text-lg font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-muted-foreground">{error || "Không tìm thấy khách sạn"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Tạo danh sách hình ảnh cho carousel
  const images = [hotel.image, ...hotel.rooms.map((room) => room.image)].filter(
    (img, index, self) => img && self.indexOf(img) === index
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Carousel */}
      <div className="relative bg-muted">
        <img
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={hotel.title}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <Heart size={24} className={isFavorite ? "fill-destructive text-destructive" : "text-foreground"} />
        </button>
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title and Rating */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{hotel.title}</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin size={16} />
                <span>{hotel.location}</span>
              </div>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{hotel.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({hotel.reviewsCount} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{hotel.description}</p>
        </div>

        {/* Facilities */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Facilities & services</h2>
          <div className="grid grid-cols-2 gap-4">
            {hotel.facilities.map((facility, idx) => {
              const Icon = iconMap[facility.icon] || Star
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

        {/* Available Rooms */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Available Rooms</h2>
          <div className="space-y-4">
            {hotel.rooms.map((room) => (
              <div
                key={room.id}
                className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img src={room.image || "/placeholder.svg"} alt={room.name} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {room.size} m² • {room.beds}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${room.price}</p>
                      <p className="text-xs text-muted-foreground">per night</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{room.maxGuests} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span>{room.view}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => onSelectRoom(room.id)}
                    disabled={!room.available}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {room.available ? "View Details" : "Not Available"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Guest Reviews</h2>
          <div className="space-y-4">
            {hotel.reviews.map((review) => (
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
    </div>
  )
}