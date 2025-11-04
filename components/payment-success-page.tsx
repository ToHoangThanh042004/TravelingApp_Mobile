"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Booking {
  id: string
  userId: string
  hotelId: string | number
  roomId: number
  checkIn: string
  checkOut: string
  total: number
  createdAt: string
  status: string
}

interface User {
  id: string
  name: string
  phoneNumber: string
  avatar: string
}

interface Hotel {
  id: string
  title: string
}

interface PaymentSuccessPageProps {
  bookingId: string
  onBackHome: () => void
}

export function PaymentSuccessPage({ bookingId, onBackHome }: PaymentSuccessPageProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [hotel, setHotel] = useState<Hotel | null>(null)

  // ⚙️ Giả sử JSON Server chạy ở localhost:3001
  const API_URL = "http://localhost:3001"

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const bookingRes = await fetch(`${API_URL}/bookings/${bookingId}`)
        const bookingData: Booking = await bookingRes.json()
        setBooking(bookingData)

        const [userRes, hotelRes] = await Promise.all([
          fetch(`${API_URL}/users/${bookingData.userId}`),
          fetch(`${API_URL}/hotels/${bookingData.hotelId}`)
        ])
        const userData: User = await userRes.json()
        const hotelData: Hotel = await hotelRes.json()

        setUser(userData)
        setHotel(hotelData)
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu booking:", err)
      }
    }

    if (bookingId) fetchBookingData()
  }, [bookingId])

  if (!booking || !user || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải dữ liệu đặt phòng...
      </div>
    )
  }

  const bookingDetails = {
    confirmationNumber: booking.id,
    property: hotel.title,
    checkIn: booking.checkIn,
    checkInTime: "14:00",
    checkOut: booking.checkOut,
    checkOutTime: "12:00",
    paymentMethod: "Credit Card",
    amount: `$${booking.total}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Success Icon */}
      <div className="mb-8 animate-scale-in">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment successful!</h1>
        <p className="text-muted-foreground">
          Booking confirmed for <span className="font-semibold">{user.name}</span>
        </p>
      </div>

      {/* Booking Details */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-6 mb-8 space-y-6 animate-slide-up">
        <div className="text-center pb-6 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Confirmation number</p>
          <p className="text-lg font-bold text-foreground font-mono">{bookingDetails.confirmationNumber}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Hotel</p>
          <p className="text-sm font-semibold text-foreground">{bookingDetails.property}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Check-in</p>
          <p className="text-sm font-semibold text-foreground">{bookingDetails.checkIn}</p>
          <p className="text-xs text-muted-foreground">{bookingDetails.checkInTime}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Check-out</p>
          <p className="text-sm font-semibold text-foreground">{bookingDetails.checkOut}</p>
          <p className="text-xs text-muted-foreground">{bookingDetails.checkOutTime}</p>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Payment method</p>
          <p className="text-sm font-semibold text-foreground">{bookingDetails.paymentMethod}</p>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Amount paid</p>
          <p className="text-2xl font-bold text-primary">{bookingDetails.amount}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={onBackHome}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200"
        >
          View booking
        </Button>
        <Button
          onClick={onBackHome}
          variant="outline"
          className="w-full border-border text-foreground hover:bg-muted font-semibold py-3 rounded-lg transition-all duration-200 bg-transparent"
        >
          Back to home
        </Button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
      `}</style>
    </div>
  )
}
