"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface SearchModalProps {
  onClose: () => void
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [step, setStep] = useState<"location" | "dates" | "guests">("location")
  const [location, setLocation] = useState("Anywhere")
  const [startDate, setStartDate] = useState("23")
  const [endDate, setEndDate] = useState("31")
  const [adults, setAdults] = useState(0)
  const [children, setChildren] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date(2022, 1))

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const locations = [
    { name: "Anywhere", image: "/anywhere-travel.jpg" },
    { name: "Europe", image: "/europe-eiffel-tower.jpg" },
    { name: "Asia", image: "/asia-landscape-mountains.jpg" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="w-full bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {step === "location" && "Where to?"}
            {step === "dates" && "When staying"}
            {step === "guests" && "How many guests?"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === "location" && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {locations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setLocation(loc.name)
                      setStep("dates")
                    }}
                    className="flex flex-col gap-2 group cursor-pointer"
                  >
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={loc.image || "/placeholder.svg"}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-sm font-medium text-foreground text-center">{loc.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "dates" && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Choose dates
                </button>
                <button className="flex-1 py-3 px-4 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors">
                  Anytime
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-foreground" />
                  </button>
                  <h3 className="font-semibold text-foreground text-center flex-1">{monthName}</h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} className="text-foreground" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar().map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (day) setStartDate(String(day))
                      }}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                        day === null
                          ? "text-transparent"
                          : day === Number.parseInt(startDate) || day === Number.parseInt(endDate)
                            ? "bg-primary text-primary-foreground"
                            : day && Number.parseInt(startDate) < day && day < Number.parseInt(endDate)
                              ? "bg-primary/30 text-foreground"
                              : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 border border-border">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">
                  {Math.abs(Number.parseInt(endDate) - Number.parseInt(startDate))} days
                </span>
              </div>
            </div>
          )}

          {step === "guests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <span className="font-medium text-foreground">Adults</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(0, adults - 1))}
                    className="w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-foreground">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="font-medium text-foreground">Children</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-foreground">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
          <button
            onClick={() => {
              if (step === "location") setLocation("Anywhere")
              else if (step === "dates") {
                setStartDate("23")
                setEndDate("31")
              } else {
                setAdults(0)
                setChildren(0)
              }
            }}
            className="flex-1 py-3 px-4 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              if (step === "location") setStep("dates")
              else if (step === "dates") setStep("guests")
              else onClose()
            }}
            className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {step === "guests" ? "Search" : "Next"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
