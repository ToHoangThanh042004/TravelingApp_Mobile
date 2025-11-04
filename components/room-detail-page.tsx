"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Heart, Share2, Users, Bed, Wifi, Tv, Wind, Coffee, Droplet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoomDetailPageProps {
  hotelId: string
  roomId: number
  onBack: () => void
  onBooking: () => void
}

export function RoomDetailPage({ hotelId, roomId, onBack, onBooking }: RoomDetailPageProps) {
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState("2024-12-20")
  const [checkOutDate, setCheckOutDate] = useState("2024-12-23")

  // 🔥 Fetch room data from json-server
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`http://localhost:3001/hotels/${hotelId}`)
        const hotel = await res.json()
        const foundRoom = hotel.rooms.find((r: any) => r.id === roomId)
        setRoom(foundRoom)
      } catch (error) {
        console.error("Lỗi tải dữ liệu phòng:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [hotelId, roomId])

  if (loading) return <p className="p-4 text-center text-muted-foreground">Đang tải dữ liệu...</p>
  if (!room) return <p className="p-4 text-center text-destructive">Không tìm thấy phòng.</p>

  const nights = 3
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Carousel */}
      <div className="relative bg-muted">
        <img
          src={room.images?.[currentImageIndex] || "/placeholder.svg"}
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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {room.images?.map((_: string, idx: number) => (
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

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">About this room</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{room.description}</p>
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
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Policies</h2>
          <div className="space-y-2">
            {room.policies?.map((policy: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{policy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-card border-t border-border">
        <Button
  onClick={async () => {
    try {
      // 🔹 Lấy thông tin user hiện tại
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

      if (!currentUser.id) {
        alert("⚠️ Bạn cần đăng nhập trước khi đặt phòng!")
        return
      }

      // 🔹 Tạo đơn đặt phòng kèm userId
      const booking = {
        userId: currentUser.id,
        hotelId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        total,
        createdAt: new Date().toISOString(),
        status: "Pending"
      }

      const res = await fetch("http://localhost:3001/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      })

      if (!res.ok) throw new Error("Lỗi khi đặt phòng")

      alert("✅ Đặt phòng thành công!")
      onBooking()
    } catch (error) {
      console.error(error)
      alert("❌ Đặt phòng thất bại, vui lòng thử lại.")
    }
  }}
  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200"
>
  Book now - ${total}
</Button>


      </div>
    </div>
  )
}
