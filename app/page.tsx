"use client"

import { useState, useEffect } from "react"
import { AuthPage } from "@/components/auth-page"
import { HomePage } from "@/components/home-page"
import { PropertyDetailPage } from "@/components/property-detail-page"
import { HotelDetailPage } from "@/components/hotel-detail-page"
import { RoomDetailPage } from "@/components/room-detail-page"
import { BookingConfirmationPage } from "@/components/booking-confirmation-page"
import { PaymentSuccessPage } from "@/components/payment-success-page"
import { FavoritesPage } from "@/components/favorites-page"
import { MyBookingsPage } from "@/components/my-bookings-page"

type PageType =
  | "auth"
  | "home"
  | "property-detail"
  | "hotel-detail"
  | "room-detail"
  | "booking-confirmation"
  | "payment-success"
  | "favorites"
  | "my-bookings"

// Định nghĩa interface cho dữ liệu từ db.json
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

// Định nghĩa interface cho PropertyCard và PropertyDetailPage
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
  description: string
  facilities: { icon: string; label: string; description: string }[]
  reviews: {
    id: number
    author: string
    avatar: string
    rating: number
    date: string
    text: string
  }[]
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageType>("auth")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([]) // Thêm state để lưu hotels gốc
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string>(null);


  // Giả sử userId hiện tại
  const CURRENT_USER_ID = "u001" // Phải khớp với userId trong HotelDetailPage.tsx

  // Fetch dữ liệu từ db.json
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Lấy danh sách khách sạn
        const hotelsResponse = await fetch("http://localhost:3001/hotels")
        if (!hotelsResponse.ok) throw new Error("Failed to fetch hotels")
        const hotelsData: Hotel[] = await hotelsResponse.json()

        // Lấy danh sách yêu thích
        const favoritesResponse = await fetch(`http://localhost:3001/favorites?userId=${CURRENT_USER_ID}`)
        if (!favoritesResponse.ok) throw new Error("Failed to fetch favorites")
        const favoritesData = await favoritesResponse.json()
        const favoriteIds = favoritesData.map((fav: { propertyId: string }) => fav.propertyId.toString())

        // Định dạng dữ liệu cho PropertyCard và PropertyDetailPage
        const formattedProperties: Property[] = hotelsData.map((hotel) => ({
          id: hotel.id,
          title: hotel.title,
          location: hotel.location,
          price: hotel.rooms[0]?.price || 0, // Lấy giá của phòng đầu tiên
          rating: hotel.rating,
          reviewsCount: hotel.reviewsCount,
          image: hotel.image,
          type: "Hotel", // Giá trị mặc định vì db.json không có trường type
          beds: hotel.rooms.reduce((total: number, room) => {
            const match = room.beds.match(/\d+/)
            return total + (match ? parseInt(match[0]) : 0)
          }, 0),
          isFavorite: favoriteIds.includes(hotel.id),
          description: hotel.description,
          facilities: hotel.facilities,
          reviews: hotel.reviews,
        }))

        setHotels(hotelsData) // Lưu dữ liệu hotels gốc
        setProperties(formattedProperties)
        setFavorites(favoriteIds)
      } catch (err: any) {
        setError(err.message || "Failed to load data")
        console.error("Error fetching data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
    setCurrentPage("home")
  }

  const handleViewProperty = (id: string) => {
    setSelectedPropertyId(id)
    setCurrentPage("property-detail")
  }

  const handleViewHotel = (id: string) => {
    setSelectedHotelId(id)
    setCurrentPage("hotel-detail")
  }

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoomId(roomId)
    setCurrentPage("room-detail")
  }

  const handleViewMyBookings = () => {
    setCurrentPage("my-bookings")
  }

  const handleBooking = () => {
    setCurrentPage("booking-confirmation")
  }

  const handleConfirmBooking = () => {
    setCurrentPage("payment-success")
  }

  const handleBackHome = () => {
    setCurrentPage("home")
  }

  const handleViewFavorites = () => {
    setCurrentPage("favorites")
  }

  const toggleFavorite = async (id: string) => {
    try {
      const isFavorite = favorites.includes(id)
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        const favoriteResponse = await fetch(
          `http://localhost:3001/favorites?userId=${CURRENT_USER_ID}&propertyId=${id}`
        )
        const favoriteData = await favoriteResponse.json()
        if (favoriteData[0]) {
          await fetch(`http://localhost:3001/favorites/${favoriteData[0].id}`, {
            method: "DELETE",
          })
        }
        setFavorites((prev) => prev.filter((fav) => fav !== id))
      } else {
        // Thêm vào danh sách yêu thích
        await fetch("http://localhost:3001/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            propertyId: id, // Sử dụng id trực tiếp vì propertyId trong db.json là chuỗi
          }),
        })
        setFavorites((prev) => [...prev, id])
      }

      // Cập nhật trạng thái isFavorite trong properties
      setProperties((prev) =>
        prev.map((prop) => (prop.id === id ? { ...prop, isFavorite: !prop.isFavorite } : prop))
      )
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleBackToHotel = () => {
    setCurrentPage("hotel-detail")
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

  // Xử lý trạng thái lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-destructive text-lg font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p className="text-muted-foreground">{error}</p>
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

  return (
    <div className="min-h-screen bg-background">
      {currentPage === "auth" && <AuthPage onAuthenticate={handleAuthenticate} />}
      {currentPage === "home" && (
        <HomePage
          onViewProperty={handleViewProperty}
          onViewHotel={handleViewHotel}
          onViewFavorites={handleViewFavorites}
          onViewMyBookings={handleViewMyBookings}
          favorites={favorites}
          properties={properties}
          onToggleFavorite={toggleFavorite}
        />
      )}
      {currentPage === "property-detail" && selectedPropertyId && (
        <PropertyDetailPage
          propertyId={selectedPropertyId}
          onBack={handleBackHome}
          onBooking={handleBooking}
        />
      )}
      {currentPage === "hotel-detail" && selectedHotelId && (
        <HotelDetailPage
          hotelId={selectedHotelId}
          hotel={hotels.find((h) => h.id === selectedHotelId) || null} // Truyền hotel trực tiếp
          onBack={handleBackHome}
          onSelectRoom={handleSelectRoom}
        />
      )}
      {currentPage === "room-detail" && selectedHotelId && selectedRoomId && (
        <RoomDetailPage
          hotelId={selectedHotelId}
          roomId={selectedRoomId}
          onBack={handleBackToHotel}
          onBooking={handleBooking}
        />
      )}
      {currentPage === "booking-confirmation" && (
        <BookingConfirmationPage onBack={handleBackHome} onConfirm={handleConfirmBooking} />
      )}
      {currentPage === "payment-success" && (
  <PaymentSuccessPage 
    bookingId={selectedBookingId} 
    onBackHome={handleBackHome} 
  />
)}

      {currentPage === "my-bookings" && <MyBookingsPage onBack={handleBackHome} />}
    </div>
  )
}