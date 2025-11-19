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
    images?: string[]
    description?: string
    amenities: string[]
    policies?: string[]
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

interface BookingData {
  hotelId: string
  roomId: number
  hotelName: string
  roomName: string
  roomImage: string
  checkIn: string
  checkOut: string
  nights: number
  pricePerNight: number
  subtotal: number
  tax: number
  serviceFee: number
  total: number
  location: string
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageType>("auth")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null)

  const API_URL = "http://192.168.1.18:3001"

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
  const storedUser = localStorage.getItem("authUser")
  if (!storedUser) {
    console.warn("⚠️ Không tìm thấy authUser — yêu cầu đăng nhập lại.")
    return null
  }

  try {
    const user = JSON.parse(storedUser)
    if (!user.id) {
      console.warn("⚠️ authUser không có trường id:", user)
      return null
    }
    return user.id
  } catch (err) {
    console.error("⚠️ Lỗi khi parse authUser:", err)
    return null
  }
}


  // Check authentication on mount
  useEffect(() => {
  const storedUser = localStorage.getItem("authUser")
  if (storedUser) {
    setIsAuthenticated(true)
    setCurrentPage("home")
  } else {
    // Không có user => ép quay về trang login
    setIsAuthenticated(false)
    setCurrentPage("auth")
  }
}, [])


  // Fetch data from db.json
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = getCurrentUserId()

        // Fetch hotels
        const hotelsResponse = await fetch(`${API_URL}/hotels`)
        if (!hotelsResponse.ok) throw new Error("Failed to fetch hotels")
        const hotelsData: Hotel[] = await hotelsResponse.json()

        // Fetch favorites
        const favoritesResponse = await fetch(`${API_URL}/favorites?userId=${userId}`)
        if (!favoritesResponse.ok) throw new Error("Failed to fetch favorites")
        const favoritesData = await favoritesResponse.json()
        const favoriteIds = favoritesData.map((fav: { propertyId: string }) => fav.propertyId.toString())

        // Format data for PropertyCard
        const formattedProperties: Property[] = hotelsData.map((hotel) => ({
          id: hotel.id,
          title: hotel.title,
          location: hotel.location,
          price: hotel.rooms[0]?.price || 0,
          rating: hotel.rating,
          reviewsCount: hotel.reviewsCount,
          image: hotel.image,
          type: "Hotel",
          beds: hotel.rooms.reduce((total: number, room) => {
            const match = room.beds.match(/\d+/)
            return total + (match ? parseInt(match[0]) : 0)
          }, 0),
          isFavorite: favoriteIds.includes(hotel.id),
          description: hotel.description,
          facilities: hotel.facilities,
          reviews: hotel.reviews,
        }))

        setHotels(hotelsData)
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
  }, [isAuthenticated])

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

  const handleProceedToPayment = (data: BookingData) => {
    setBookingData(data)
    setCurrentPage("booking-confirmation")
  }

  const handleConfirmPayment = async (paymentMethod: string, paymentDetails: any) => {
    try {
      if (!bookingData) {
        alert("Lỗi: Không tìm thấy thông tin đặt phòng!")
        return
      }

      const userId = getCurrentUserId()

      // Create booking object
      const newBooking = {
        userId: userId,
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        subtotal: bookingData.subtotal,
        tax: bookingData.tax,
        serviceFee: bookingData.serviceFee,
        total: bookingData.total,
        createdAt: new Date().toISOString(),
        status: "Confirmed",
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      }

      // Save booking to database
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBooking),
      })

      if (!response.ok) {
        throw new Error("Failed to create booking")
      }

      const savedBooking = await response.json()
      setCompletedBookingId(savedBooking.id)
      setCurrentPage("payment-success")
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Đặt phòng thất bại! Vui lòng thử lại.")
    }
  }

  const handleBackHome = () => {
    setCurrentPage("home")
    setSelectedPropertyId(null)
    setSelectedHotelId(null)
    setSelectedRoomId(null)
    setBookingData(null)
    setCompletedBookingId(null)
  }

  const handleBackToHotel = () => {
    setCurrentPage("hotel-detail")
    setSelectedRoomId(null)
  }

  const handleBackToRoom = () => {
    setCurrentPage("room-detail")
  }

  const handleViewFavorites = () => {
    setCurrentPage("favorites")
  }

  const handleViewBooking = () => {
    setCurrentPage("my-bookings")
  }
  const toggleFavorite = async (id: string) => {
    try {
      const userId = getCurrentUserId()
      const isFavorite = favorites.includes(id)

      if (isFavorite) {
        // Remove from favorites
        const favoriteResponse = await fetch(
          `${API_URL}/favorites?userId=${userId}&propertyId=${id}`
        )
        const favoriteData = await favoriteResponse.json()
        if (favoriteData[0]) {
          await fetch(`${API_URL}/favorites/${favoriteData[0].id}`, {
            method: "DELETE",
          })
        }
        setFavorites((prev) => prev.filter((fav) => fav !== id))
      } else {
        // Add to favorites
        await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            propertyId: id,
          }),
        })
        setFavorites((prev) => [...prev, id])
      }

      // Update isFavorite status in properties
      setProperties((prev) =>
        prev.map((prop) => (prop.id === id ? { ...prop, isFavorite: !prop.isFavorite } : prop))
      )
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Loading state
  if (isLoading && currentPage !== "auth") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Error state
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
          onBooking={() => handleProceedToPayment(bookingData!)}
        />
      )}
      
      {currentPage === "hotel-detail" && selectedHotelId && (
        <HotelDetailPage
          hotelId={selectedHotelId}
          hotel={hotels.find((h) => h.id === selectedHotelId) || null}
          onBack={handleBackHome}
          onSelectRoom={handleSelectRoom}
          onToggleFavorite={toggleFavorite}
        />
      )}
      
      {currentPage === "room-detail" && selectedHotelId && selectedRoomId && (
        <RoomDetailPage
          hotelId={selectedHotelId}
          roomId={selectedRoomId}
          onBack={handleBackToHotel}
          onProceedToPayment={handleProceedToPayment}
        />
      )}
      
      {currentPage === "booking-confirmation" && bookingData && (
        <BookingConfirmationPage
          onBack={handleBackToRoom}
          onConfirm={handleConfirmPayment}
          bookingData={bookingData}
        />
      )}
      
      {currentPage === "payment-success" && completedBookingId && (
        <PaymentSuccessPage
          bookingId={completedBookingId}
          onBackHome={handleBackHome}
          onViewBooking={handleViewBooking}
        />
      )}
      
      {currentPage === "favorites" && (
        <FavoritesPage
          onBack={handleBackHome}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
      
      {currentPage === "my-bookings" && (
        <MyBookingsPage
          onBack={handleBackHome}
          userId={getCurrentUserId()}
          apiUrl={API_URL}
        />
      )}
    </div>
  )
}