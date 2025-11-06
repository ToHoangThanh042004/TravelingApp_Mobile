"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Heart, Share2, Users, Bed, Wifi, Tv, Wind, Coffee, Droplet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoomDetailPageProps {
  hotelId: string
  roomId: number
  onBack: () => void
  onProceedToPayment: (bookingData: BookingData) => void
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

export function RoomDetailPage({ hotelId, roomId, onBack, onProceedToPayment }: RoomDetailPageProps) {
  const [room, setRoom] = useState<any>(null)
  const [hotel, setHotel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [bookedDates, setBookedDates] = useState<Array<{checkIn: string, checkOut: string}>>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Set default dates (today + 7 days)
  useEffect(() => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    setCheckInDate(today.toISOString().split('T')[0])
    setCheckOutDate(nextWeek.toISOString().split('T')[0])
  }, [])

  // Fetch room data from json-server
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`http://localhost:3001/hotels/${hotelId}`)
        const hotelData = await res.json()
        const foundRoom = hotelData.rooms.find((r: any) => r.id === roomId)
        setHotel(hotelData)
        setRoom(foundRoom)

        // Fetch booked dates for this room
        const bookingsRes = await fetch(`http://localhost:3001/bookings`)
        const allBookings = await bookingsRes.json()
        
        const activeStatuses = ["Confirmed", "Pending", "Checked-in"]
        const roomBookings = allBookings.filter((booking: any) => 
          booking.hotelId === hotelId && 
          booking.roomId === roomId &&
          activeStatuses.includes(booking.status)
        )

        setBookedDates(roomBookings.map((b: any) => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        })))
      } catch (error) {
        console.error("Lỗi tải dữ liệu phòng:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [hotelId, roomId])

  if (loading) return <p className="p-4 text-center text-muted-foreground">Đang tải dữ liệu...</p>
  if (!room || !hotel) return <p className="p-4 text-center text-destructive">Không tìm thấy phòng.</p>

  // Calculate pricing
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)))
  const subtotal = room.price * nights
  const tax = Math.round(subtotal * 0.1)
  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + tax + serviceFee

  const iconMap: any = {
    Tv: Tv,
    Wind: Wind,
    Wifi: Wifi,
    Coffee: Coffee,
    Droplet: Droplet,
    Bed: Bed,
  }

  const handleProceedToPayment = async () => {
    // Validate dates
    if (!checkInDate || !checkOutDate) {
      alert("Vui lòng chọn ngày nhận phòng và trả phòng!")
      return
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert("Ngày trả phòng phải sau ngày nhận phòng!")
      return
    }

    // Check for booking conflicts
    setCheckingAvailability(true)
    try {
      const response = await fetch(`http://localhost:3001/bookings`)
      const allBookings = await response.json()
      
      // Filter bookings for this specific room with active statuses
      const activeStatuses = ["Confirmed", "Pending", "Checked-in"]
      const roomBookings = allBookings.filter((booking: any) => 
        booking.hotelId === hotelId && 
        booking.roomId === roomId &&
        activeStatuses.includes(booking.status)
      )

      // Check for date conflicts
      const requestedCheckIn = new Date(checkInDate)
      const requestedCheckOut = new Date(checkOutDate)

      const conflictBooking = roomBookings.find((booking: any) => {
        const bookedCheckIn = new Date(booking.checkIn)
        const bookedCheckOut = new Date(booking.checkOut)

        // Check if dates overlap
        // Conflict exists if: (start1 < end2) AND (start2 < end1)
        return (requestedCheckIn < bookedCheckOut) && (bookedCheckIn < requestedCheckOut)
      })

      if (conflictBooking) {
        const conflictStart = new Date(conflictBooking.checkIn).toLocaleDateString('vi-VN')
        const conflictEnd = new Date(conflictBooking.checkOut).toLocaleDateString('vi-VN')
        alert(`⚠️ Phòng này đã được đặt từ ${conflictStart} đến ${conflictEnd}\n\n❌ Không thể đặt phòng trong khoảng thời gian bạn chọn!\n\n✅ Vui lòng chọn ngày khác (sau ${conflictEnd}) hoặc chọn phòng khác.`)
        return
      }

      // If no conflict, proceed with booking
      const bookingData: BookingData = {
        hotelId,
        roomId,
        hotelName: hotel.title,
        roomName: room.name,
        roomImage: room.images?.[0] || room.image || hotel.image,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        pricePerNight: room.price,
        subtotal,
        tax,
        serviceFee,
        total,
        location: hotel.location
      }

      onProceedToPayment(bookingData)
    } catch (error) {
      console.error("Error checking booking availability:", error)
      alert("❌ Không thể kiểm tra tình trạng phòng. Vui lòng thử lại!")
    } finally {
      setCheckingAvailability(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Carousel */}
      <div className="relative bg-muted">
        <img
          src={room.images?.[currentImageIndex] || room.image || "/placeholder.svg"}
          alt={room.name}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
        >
          <Heart size={24} className={isFavorite ? "fill-destructive text-destructive" : "text-foreground"} />
        </button>

        {/* Image indicators */}
        {room.images && room.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {room.images.map((_: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title and Price */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{room.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{room.view}</p>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="text-center">
            <Bed size={24} className="mx-auto text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">{room.size} m²</p>
          </div>
          <div className="text-center">
            <Users size={24} className="mx-auto text-primary mb-2" />
            <p className="text-sm font-semibold text-foreground">{room.maxGuests} Guests</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">${room.price}</span>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Chọn ngày</h2>
          
          {/* Booked dates warning */}
          {bookedDates.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Các ngày đã được đặt:</p>
                  <div className="space-y-1">
                    {bookedDates.map((booking, idx) => (
                      <p key={idx} className="text-xs text-amber-700">
                        • {new Date(booking.checkIn).toLocaleDateString('vi-VN')} → {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2 italic">
                    Vui lòng chọn ngày khác để đặt phòng
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nhận phòng</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Trả phòng</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Tổng: {nights} đêm
          </p>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">About this room</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{room.description || "Phòng thoải mái với đầy đủ tiện nghi hiện đại."}</p>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Room Amenities</h2>
          <div className="grid grid-cols-2 gap-4">
            {room.amenities?.map((amenity: any, idx: number) => {
              const key = `${roomId}-${idx}-${typeof amenity === "string" ? amenity : amenity.label}`;
              if (typeof amenity === "string") {
                const Icon = iconMap[amenity] || Bed;
                return (
                  <div key={key} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Icon size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-foreground">{amenity}</p>
                  </div>
                );
              }
              const Icon = iconMap[amenity.icon] || Bed;
              return (
                <div key={key} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Icon size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{amenity.label}</p>
                    <p className="text-xs text-muted-foreground">{amenity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Price Details</h2>
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ${room.price} × {nights} nights
              </span>
              <span className="text-sm font-semibold text-foreground">${subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tax (10%)</span>
              <span className="text-sm font-semibold text-foreground">${tax}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Service fee (5%)</span>
              <span className="text-sm font-semibold text-foreground">${serviceFee}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">${total}</span>
            </div>
          </div>
        </div>

        {/* Policies */}
        {room.policies && room.policies.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Policies</h2>
            <div className="space-y-2">
              {room.policies.map((policy: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{policy}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={handleProceedToPayment}
          disabled={!room.available || checkingAvailability}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkingAvailability ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Đang kiểm tra...
            </span>
          ) : !room.available ? (
            "Not Available"
          ) : (
            `Proceed to Payment - $${total}`
          )}
        </Button>
      </div>
    </div>
  )
}