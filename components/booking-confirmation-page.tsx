"use client"

import { ChevronLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

interface BookingConfirmationPageProps {
  onBack: () => void
  onConfirm: () => void
}

export function BookingConfirmationPage({ onBack, onConfirm }: BookingConfirmationPageProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")

  const bookingDetails = {
    property: "Balian Treehouse",
    location: "Bali, Indonesia",
    checkIn: "May 23, 2024",
    checkOut: "May 31, 2024",
    nights: 8,
    guests: 2,
    pricePerNight: 120,
    subtotal: 960,
    taxes: 96,
    fees: 48,
    total: 1104,
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Confirm analysis</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Property Summary */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{bookingDetails.property}</h2>
              <p className="text-sm text-muted-foreground">{bookingDetails.location}</p>
            </div>
            <span className="text-2xl font-bold text-primary">${bookingDetails.pricePerNight}</span>
          </div>
          <p className="text-xs text-muted-foreground">per night</p>
        </div>

        {/* Your Trip */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Your trip</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Dates</span>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{bookingDetails.checkIn}</p>
                <p className="text-xs text-muted-foreground">to {bookingDetails.checkOut}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Guests</span>
              <p className="text-sm font-semibold text-foreground">{bookingDetails.guests} guests</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Duration</span>
              <p className="text-sm font-semibold text-foreground">{bookingDetails.nights} nights</p>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Payment options</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="card" id="card" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Credit or debit card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="paypal" id="paypal" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">PayPal</p>
                  <p className="text-xs text-muted-foreground">Fast and secure</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <RadioGroupItem value="bank" id="bank" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Bank transfer</p>
                  <p className="text-xs text-muted-foreground">Direct bank payment</p>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Price Details */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Price details</h3>
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                ${bookingDetails.pricePerNight} x {bookingDetails.nights} nights
              </span>
              <span className="text-sm font-semibold text-foreground">${bookingDetails.subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxes</span>
              <span className="text-sm font-semibold text-foreground">${bookingDetails.taxes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Service fee</span>
              <span className="text-sm font-semibold text-foreground">${bookingDetails.fees}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">${bookingDetails.total}</span>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            You won't be charged until you confirm your booking
          </p>
        </div>
      </div>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-4 bg-card border-t border-border">
        <Button
          onClick={onConfirm}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200"
        >
          Book now
        </Button>
      </div>
    </div>
  )
}
