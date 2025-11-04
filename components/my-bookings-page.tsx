"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, Calendar, DollarSign, MessageCircle, RotateCcw, Star, X, Loader2 } from "lucide-react"

interface Booking {
  id: string
  propertyName: string
  location: string
  image: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled"
  bookingId: string
  address: string
  roomType: string
  nights: number
  pricePerNight: number
  guestName: string
  guestPhone: string
  rating?: number
  review?: string
}

interface MyBookingsPageProps {
  onBack: () => void
  onViewDetails?: (bookingId: string) => void
  userId?: string // ID của user đang đăng nhập
  apiUrl?: string // URL của JSON Server API
}

const STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: "🕒" },
  confirmed: { label: "Đã xác nhận", color: "bg-green-100 text-green-800", icon: "✅" },
  "checked-in": { label: "Đang ở", color: "bg-blue-100 text-blue-800", icon: "🏠" },
  completed: { label: "Đã hoàn tất", color: "bg-gray-100 text-gray-800", icon: "✔️" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: "❌" },
}

export function MyBookingsPage({ 
  onBack, 
  onViewDetails,
  userId = "u001", // Default user ID
  apiUrl = "http://localhost:3001" // Default API URL
}: MyBookingsPageProps) {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "confirmed" | "checked-in" | "completed" | "cancelled"
  >("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userRatings, setUserRatings] = useState<Record<string, { rating: number; review: string }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Fetch bookings từ API
  useEffect(() => {
    fetchBookings()
    fetchUserInfo()
  }, [userId])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/${userId}`)
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
      }
    } catch (err) {
      console.error("Error fetching user info:", err)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Lấy bookings của user
      // const bookingsResponse = await fetch(`${apiUrl}/bookings?userId=${userId}`)
      // const userBookings = await bookingsResponse.json()

      // Lấy thông tin hotels
      const hotelsResponse = await fetch(`${apiUrl}/hotels`)
      const hotels = await hotelsResponse.json()
      // Lấy tất cả bookings và lọc theo userId
      const bookingsResponse = await fetch(`${apiUrl}/bookings`)
      const allBookings = await bookingsResponse.json()
      
      // Lọc bookings của user hiện tại - chuyển về string để so sánh
      const userBookings = allBookings.filter((booking: any) => {
        return String(booking.userId) === String(userId)
      })

      // Kết hợp dữ liệu bookings với hotels
      const formattedBookings: Booking[] = await Promise.all(
        userBookings.map(async (booking: any) => {
          const hotel = hotels.find((h: any) => h.id === String(booking.hotelId))
          const room = hotel?.rooms?.find((r: any) => r.id === booking.roomId)

          // Tính số đêm
          const checkInDate = new Date(booking.checkIn)
          const checkOutDate = new Date(booking.checkOut)
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24))

          return {
            id: booking.id,
            propertyName: hotel?.title || "Unknown Hotel",
            location: hotel?.location || "Unknown Location",
            image: room?.image || hotel?.image || "/placeholder.svg",
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: booking.total,
            status: booking.status?.toLowerCase() || "pending",
            bookingId: `BK${booking.id.toUpperCase()}`,
            address: hotel?.location || "Unknown Address",
            roomType: room?.name || "Standard Room",
            nights: nights,
            pricePerNight: room?.price || Math.floor(booking.total / nights),
            guestName: currentUser?.name || "Guest",
            guestPhone: currentUser?.phoneNumber || "N/A",
            rating: booking.rating,
            review: booking.review,
          }
        })
      )

      setBookings(formattedBookings)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Không thể tải danh sách đặt phòng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = activeFilter === "all" || booking.status === activeFilter
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleRateBooking = async (bookingId: string, rating: number, review: string) => {
    try {
      // Cập nhật rating vào database
      await fetch(`${apiUrl}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, review }),
      })

      setUserRatings((prev) => ({
        ...prev,
        [bookingId]: { rating, review },
      }))
      
      // Refresh bookings
      fetchBookings()
      setSelectedBooking(null)
    } catch (err) {
      console.error("Error rating booking:", err)
      alert("Không thể gửi đánh giá. Vui lòng thử lại.")
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Cập nhật status thành cancelled
      await fetch(`${apiUrl}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      })

      // Refresh bookings
      fetchBookings()
      setSelectedBooking(null)
    } catch (err) {
      console.error("Error cancelling booking:", err)
      alert("Không thể hủy đặt phòng. Vui lòng thử lại.")
    }
  }

  const handleRebooking = (booking: Booking) => {
    console.log("Rebooking:", booking)
    // Implement rebooking logic here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đơn đặt phòng...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Đơn đặt phòng của tôi</h1>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <input
            type="text"
            placeholder="Tìm theo mã đặt hoặc tên khách sạn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ xác nhận" },
              { key: "confirmed", label: "Đã xác nhận" },
              { key: "completed", label: "Đã hoàn tất" },
              { key: "cancelled", label: "Đã hủy" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter.key
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="p-4 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🧳</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn đặt phòng</h2>
            <p className="text-gray-600 mb-6">Thế giới đang chờ bạn khám phá!</p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
            >
              {/* Booking Card */}
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.propertyName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{booking.propertyName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_CONFIG[booking.status].color}`}
                    >
                      {STATUS_CONFIG[booking.status].label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {booking.checkIn} → {booking.checkOut}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-semibold text-gray-900">
                        ${booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">Mã đặt: {booking.bookingId}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
                >
                  Xem chi tiết
                </button>

                {booking.status === "pending" || booking.status === "confirmed" ? (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Hủy đặt
                  </button>
                ) : booking.status === "completed" ? (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                  >
                    Đánh giá
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in">
          <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn đặt</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Property Info */}
              <div>
                <img
                  src={selectedBooking.image || "/placeholder.svg"}
                  alt={selectedBooking.propertyName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedBooking.propertyName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  {selectedBooking.address}
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Thông tin đặt phòng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs mb-1">Nhận phòng</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.checkIn}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs mb-1">Trả phòng</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.checkOut}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs mb-1">Loại phòng</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.roomType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-xs mb-1">Số đêm</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.nights} đêm</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Chi tiết thanh toán</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${selectedBooking.pricePerNight.toLocaleString()} × {selectedBooking.nights} đêm
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${(selectedBooking.pricePerNight * selectedBooking.nights).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí dịch vụ</span>
                    <span className="font-semibold text-gray-900">$0</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="font-bold text-cyan-600 text-lg">
                      ${selectedBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Thông tin khách</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Tên khách</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.guestPhone}</p>
                  </div>
                </div>
              </div>

              {/* Rating Section for Completed Bookings */}
              {selectedBooking.status === "completed" && !userRatings[selectedBooking.id] && !selectedBooking.rating && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">Đánh giá khách sạn</h4>
                  <RatingForm
                    bookingId={selectedBooking.id}
                    onSubmit={(rating, review) => handleRateBooking(selectedBooking.id, rating, review)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                {selectedBooking.status === "pending" || selectedBooking.status === "confirmed" ? (
                  <>
                    <button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id)
                      }}
                      className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Hủy đặt phòng
                    </button>
                    <button
                      onClick={() => handleRebooking(selectedBooking)}
                      className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Đặt lại
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
                  >
                    Đóng
                  </button>
                )}

                <button className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Rating Form Component
function RatingForm({
  bookingId,
  onSubmit,
}: {
  bookingId: string
  onSubmit: (rating: number, review: string) => void
}) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
            <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Chia sẻ trải nghiệm của bạn..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        rows={4}
      />
      <button
        onClick={() => onSubmit(rating, review)}
        className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
      >
        Gửi đánh giá
      </button>
    </div>
  )
}