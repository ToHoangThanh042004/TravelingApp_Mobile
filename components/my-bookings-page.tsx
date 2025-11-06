"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, Calendar, DollarSign, Star, X, Loader2 } from "lucide-react"

interface Booking {
  id: string
  userId: string
  hotelId: string
  roomId: number
  checkIn: string
  checkOut: string
  nights: number
  subtotal: number
  tax: number
  serviceFee: number
  total: number
  createdAt: string
  status: string
  paymentMethod: string
  paymentDetails?: any
  rating?: number
  review?: string
}

interface Hotel {
  id: string
  title: string
  location: string
  image: string
  rooms: Room[]
  reviews: Review[]
  reviewsCount: number
}

interface Room {
  id: number
  name: string
  image: string
  price: number
}

interface User {
  id: string
  name: string
  phoneNumber: string
  email?: string
}

interface Review {
  id: number
  author: string
  avatar: string
  rating: number
  date: string
  text: string
  userId?: string
  bookingId?: string
}

interface DisplayBooking {
  id: string
  propertyName: string
  location: string
  image: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: string
  bookingId: string
  address: string
  roomType: string
  nights: number
  pricePerNight: number
  guestName: string
  guestPhone: string
  guestEmail?: string
  rating?: number
  review?: string
  subtotal: number
  tax: number
  serviceFee: number
  paymentMethod: string
  paymentDetails?: any
  createdAt: string
}

interface MyBookingsPageProps {
  onBack: () => void
  onViewDetails?: (bookingId: string) => void
  userId?: string
  apiUrl?: string
}

const STATUS_CONFIG = {
  Pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  Confirmed: { label: "Đã xác nhận", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "Checked-in": { label: "Đang ở", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  Completed: { label: "Đã hoàn tất", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
}

export function MyBookingsPage({ 
  onBack, 
  onViewDetails,
  userId = "u001",
  apiUrl = "http://localhost:3001"
}: MyBookingsPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<DisplayBooking | null>(null)
  const [bookings, setBookings] = useState<DisplayBooking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const canCancelBooking = (booking: DisplayBooking) => {
    const createdAt = new Date(booking.createdAt).getTime()
    const now = Date.now()
    return now - createdAt <= 12 * 60 * 60 * 1000
  }

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

      const [bookingsRes, hotelsRes] = await Promise.all([
        fetch(`${apiUrl}/bookings`),
        fetch(`${apiUrl}/hotels`)
      ])

      const allBookings: Booking[] = await bookingsRes.json()
      const hotels: Hotel[] = await hotelsRes.json()

      const userBookings = allBookings.filter((booking) => 
        String(booking.userId) === String(userId)
      )

      const formattedBookings: DisplayBooking[] = userBookings.map((booking) => {
        const hotel = hotels.find((h) => h.id === String(booking.hotelId))
        const room = hotel?.rooms?.find((r) => r.id === booking.roomId)

        return {
          id: booking.id,
          propertyName: hotel?.title || "Unknown Hotel",
          location: hotel?.location || "Unknown Location",
          image: room?.image || hotel?.image || "/placeholder.svg",
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.total,
          status: booking.status,
          bookingId: `BK${booking.id.toUpperCase()}`,
          address: hotel?.location || "Unknown Address",
          roomType: room?.name || "Standard Room",
          nights: booking.nights || 1,
          pricePerNight: room?.price || Math.floor(booking.total / (booking.nights || 1)),
          guestName: currentUser?.name || "Guest",
          guestPhone: currentUser?.phoneNumber || "N/A",
          guestEmail: currentUser?.email,
          rating: booking.rating,
          review: booking.review,
          subtotal: booking.subtotal,
          tax: booking.tax,
          serviceFee: booking.serviceFee,
          paymentMethod: booking.paymentMethod,
          paymentDetails: booking.paymentDetails,
          createdAt: booking.createdAt,
        }
      })

      formattedBookings.sort((a, b) => 
        new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
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

  const handleRateBooking = async (bookingId: string, hotelId: string, rating: number, reviewText: string) => {
    try {
      if (!currentUser) {
        alert("Không tìm thấy thông tin người dùng!")
        return
      }

      // 1. Cập nhật booking với rating và review
      await fetch(`${apiUrl}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, review: reviewText }),
      })

      // 2. Lấy thông tin hotel hiện tại
      const hotelResponse = await fetch(`${apiUrl}/hotels/${hotelId}`)
      if (!hotelResponse.ok) throw new Error("Failed to fetch hotel")
      const hotel: Hotel = await hotelResponse.json()

      // 3. Tạo review mới với ID tự động tăng
      const newReviewId = hotel.reviews.length > 0 
        ? Math.max(...hotel.reviews.map(r => r.id)) + 1 
        : 1

      const newReview: Review = {
        id: newReviewId,
        author: currentUser.name || "Guest",
        avatar: currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "GU",
        rating: rating,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        text: reviewText,
        userId: currentUser.id,
        bookingId: bookingId
      }

      // 4. Cập nhật hotel với review mới và reviewsCount
      const updatedReviews = [...hotel.reviews, newReview]
      const updatedReviewsCount = updatedReviews.length

      // Tính lại rating trung bình
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0)
      const newAverageRating = Math.round((totalRating / updatedReviewsCount) * 10) / 10

      await fetch(`${apiUrl}/hotels/${hotelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          reviews: updatedReviews,
          reviewsCount: updatedReviewsCount,
          rating: newAverageRating
        }),
      })

      // 5. Refresh bookings để cập nhật UI
      await fetchBookings()
      setSelectedBooking(null)
      
      alert("✅ Đánh giá của bạn đã được gửi thành công!")
    } catch (err) {
      console.error("Error rating booking:", err)
      alert("❌ Không thể gửi đánh giá. Vui lòng thử lại.")
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      return
    }

    try {
      await fetch(`${apiUrl}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      })

      fetchBookings()
      setSelectedBooking(null)
    } catch (err) {
      console.error("Error cancelling booking:", err)
      alert("Không thể hủy đặt phòng. Vui lòng thử lại.")
    }
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
              { key: "Pending", label: "Chờ xác nhận" },
              { key: "Confirmed", label: "Đã xác nhận" },
              { key: "Completed", label: "Đã hoàn tất" },
              { key: "Cancelled", label: "Đã hủy" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
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
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.propertyName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{booking.propertyName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]?.color || STATUS_CONFIG.Pending.color}`}>
                      {STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]?.label || booking.status}
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

              <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors"
                >
                  Xem chi tiết
                </button>

                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Hủy đặt
                  </button>
                )}

                {booking.status === "Completed" && !booking.rating && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                  >
                    Đánh giá
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRate={(rating, review) => {
            // Tìm hotelId từ bookings gốc
            const originalBooking = bookings.find(b => b.id === selectedBooking.id)
            if (originalBooking) {
              // Extract hotelId từ booking (cần thêm vào DisplayBooking hoặc lấy từ API)
              fetch(`${apiUrl}/bookings/${selectedBooking.id}`)
                .then(res => res.json())
                .then(booking => {
                  handleRateBooking(selectedBooking.id, booking.hotelId, rating, review)
                })
            }
          }}
          onCancel={() => handleCancelBooking(selectedBooking.id)}
          canCancel={canCancelBooking(selectedBooking)}
        />
      )}
    </div>
  )
}

// Booking Detail Modal Component
function BookingDetailModal({
  booking,
  onClose,
  onRate,
  onCancel,
  canCancel
}: {
  booking: DisplayBooking
  onClose: () => void
  onRate: (rating: number, review: string) => void
  onCancel: () => void
  canCancel: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in">
      <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-4 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn đặt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <img
              src={booking.image || "/placeholder.svg"}
              alt={booking.propertyName}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold text-gray-900 mb-2">{booking.propertyName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              {booking.address}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Thông tin đặt phòng</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-xs mb-1">Nhận phòng</p>
                <p className="font-semibold text-gray-900">{booking.checkIn}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-xs mb-1">Trả phòng</p>
                <p className="font-semibold text-gray-900">{booking.checkOut}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-xs mb-1">Loại phòng</p>
                <p className="font-semibold text-gray-900">{booking.roomType}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-xs mb-1">Số đêm</p>
                <p className="font-semibold text-gray-900">{booking.nights} đêm</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Chi tiết thanh toán</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ${booking.pricePerNight.toLocaleString()} × {booking.nights} đêm
                </span>
                <span className="font-semibold text-gray-900">
                  ${booking.subtotal?.toLocaleString() || (booking.pricePerNight * booking.nights).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế</span>
                <span className="font-semibold text-gray-900">${booking.tax?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí dịch vụ</span>
                <span className="font-semibold text-gray-900">${booking.serviceFee?.toLocaleString() || 0}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-bold text-cyan-600 text-lg">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {booking.status === "Completed" && !booking.rating && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">Đánh giá khách sạn</h4>
              <RatingForm onSubmit={onRate} />
            </div>
          )}

          {booking.rating && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">Đánh giá của bạn</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= (booking.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{booking.review}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 pb-4">
            {canCancel && (
              <button
                onClick={onCancel}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Hủy đặt phòng
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Rating Form Component
function RatingForm({
  onSubmit,
}: {
  onSubmit: (rating: number, review: string) => void
}) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            onClick={() => setRating(star)} 
            className="transition-transform hover:scale-110"
          >
            <Star className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
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
        onClick={() => {
          if (!review.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!")
            return
          }
          onSubmit(rating, review)
        }}
        className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
      >
        Gửi đánh giá
      </button>
    </div>
  )
}