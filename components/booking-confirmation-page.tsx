"use client"

import { ChevronLeft, AlertCircle, CreditCard, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

interface BookingConfirmationPageProps {
  onBack: () => void
  onConfirm: (paymentMethod: string, paymentDetails: any) => void
  bookingData: {
    hotelName: string
    location: string
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
  }
}

export function BookingConfirmationPage({ onBack, onConfirm, bookingData }: BookingConfirmationPageProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Card payment states
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  
  // Bank transfer states
  const [bankAccount, setBankAccount] = useState("")
  const [bankName, setBankName] = useState("")

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleConfirm = async () => {
    // Validate payment details
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert("Vui lòng điền đầy đủ thông tin thẻ!")
        return
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert("Số thẻ không hợp lệ!")
        return
      }
      if (cvv.length !== 3) {
        alert("CVV không hợp lệ!")
        return
      }
    } else if (paymentMethod === "bank") {
      if (!bankAccount || !bankName) {
        alert("Vui lòng điền đầy đủ thông tin chuyển khoản!")
        return
      }
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      const paymentDetails = paymentMethod === "card" 
        ? { 
            cardNumber: cardNumber.slice(-4), 
            cardName,
            type: "Credit Card"
          }
        : paymentMethod === "bank"
        ? {
            bankName,
            accountNumber: bankAccount.slice(-4),
            type: "Bank Transfer"
          }
        : {
            type: "PayPal"
          }

      onConfirm(paymentMethod, paymentDetails)
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Xác nhận thanh toán</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Property Summary */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <img 
            src={bookingData.roomImage || "/placeholder.svg"} 
            alt={bookingData.roomName}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-lg font-bold text-foreground mb-1">{bookingData.hotelName}</h2>
            <p className="text-sm text-muted-foreground mb-2">{bookingData.location}</p>
            <p className="text-sm font-semibold text-foreground">{bookingData.roomName}</p>
          </div>
        </div>

        {/* Your Trip */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Chi tiết đặt phòng</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Ngày nhận phòng</span>
              <p className="text-sm font-semibold text-foreground">{bookingData.checkIn}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Ngày trả phòng</span>
              <p className="text-sm font-semibold text-foreground">{bookingData.checkOut}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Số đêm</span>
              <p className="text-sm font-semibold text-foreground">{bookingData.nights} đêm</p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Phương thức thanh toán</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="card" id="card" />
                <CreditCard size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Thẻ tín dụng/ghi nợ</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="paypal" id="paypal" />
                <Wallet size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">PayPal</p>
                  <p className="text-xs text-muted-foreground">Nhanh chóng & an toàn</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="bank" id="bank" />
                <Wallet size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Chuyển khoản ngân hàng</p>
                  <p className="text-xs text-muted-foreground">Thanh toán trực tiếp</p>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Details Form */}
        {paymentMethod === "card" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Thông tin thẻ</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Số thẻ</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tên chủ thẻ</label>
              <input
                type="text"
                placeholder="NGUYEN VAN A"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Ngày hết hạn</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={3}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "bank" && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Thông tin chuyển khoản</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tên ngân hàng</label>
              <input
                type="text"
                placeholder="Vietcombank, ACB, Techcombank..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Số tài khoản</label>
              <input
                type="text"
                placeholder="1234567890"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Price Details */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Chi tiết giá</h3>
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ${bookingData.pricePerNight} × {bookingData.nights} đêm
              </span>
              <span className="text-sm font-semibold text-foreground">${bookingData.subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Thuế (10%)</span>
              <span className="text-sm font-semibold text-foreground">${bookingData.tax}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Phí dịch vụ (5%)</span>
              <span className="text-sm font-semibold text-foreground">${bookingData.serviceFee}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-foreground">Tổng cộng</span>
              <span className="text-lg font-bold text-primary">${bookingData.total}</span>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Bạn sẽ được thanh toán sau khi xác nhận đặt phòng thành công
          </p>
        </div>
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Đang xử lý..." : `Xác nhận thanh toán - $${bookingData.total}`}
        </Button>
      </div>
    </div>
  )
}