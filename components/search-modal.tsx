"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react"

// Debounce hook
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export type SearchFilters = {
  location: string
  checkIn: string | null
  checkOut: string | null
  adults: number
  children: number
}

interface SearchModalProps {
  onClose: () => void
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

// Danh sách tỉnh thành Việt Nam
const VIETNAM_PROVINCES = [
  { code: 'HN', name: 'Hanoi' },
  { code: 'HCM', name: 'Ho Chi Minh City' },
  { code: 'DN', name: 'Da Nang' },
  { code: 'HP', name: 'Hai Phong' },
  { code: 'CT', name: 'Can Tho' },
  { code: 'NT', name: 'Nha Trang' },
  { code: 'HL', name: 'Ha Long' },
  { code: 'PQ', name: 'Phu Quoc' },
  { code: 'HA', name: 'Hoi An' },
  { code: 'DL', name: 'Da Lat' },
  { code: 'VT', name: 'Vung Tau' },
  { code: 'QN', name: 'Quy Nhon' },
  { code: 'HU', name: 'Hue' },
  { code: 'SL', name: 'Sa Pa' },
  { code: 'MC', name: 'Moc Chau' }
]

export function SearchModal({ onClose, onSearch, initialFilters }: SearchModalProps) {
  const [step, setStep] = useState<"location" | "dates" | "guests">("location")
  const [location, setLocation] = useState(initialFilters?.location || "")
  const [checkIn, setCheckIn] = useState<string | null>(initialFilters?.checkIn || null)
  const [checkOut, setCheckOut] = useState<string | null>(initialFilters?.checkOut || null)
  const [adults, setAdults] = useState(initialFilters?.adults || 0)
  const [children, setChildren] = useState(initialFilters?.children || 0)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Lọc tỉnh thành theo tìm kiếm với debounced value
  const filteredProvinces = VIETNAM_PROVINCES.filter(p =>
    p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  )

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Kiểm tra ngày có trong quá khứ không
  const isPastDate = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset giờ về 00:00:00
    
    const dateToCheck = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    dateToCheck.setHours(0, 0, 0, 0)
    
    return dateToCheck < today
  }

  // Kiểm tra có thể chuyển về tháng trước không
  const canGoPrevMonth = () => {
    const today = new Date()
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    
    // Cho phép quay về tháng hiện tại, không cho quay về tháng trước đó
    return prevMonth.getFullYear() >= today.getFullYear() && 
           prevMonth.getMonth() >= today.getMonth()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Thêm các ô trống đầu tháng
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Thêm các ngày trong tháng
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const handleDateClick = (day: number) => {
    // Không cho phép chọn ngày trong quá khứ
    if (isPastDate(day)) {
      return
    }

    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split('T')[0]

    if (!checkIn || (checkIn && checkOut)) {
      // Chọn ngày check-in mới
      setCheckIn(selectedDate)
      setCheckOut(null)
    } else if (checkIn && !checkOut) {
      // Chọn ngày check-out
      if (new Date(selectedDate) > new Date(checkIn)) {
        setCheckOut(selectedDate)
      } else {
        // Nếu chọn ngày trước check-in, đặt lại check-in
        setCheckIn(selectedDate)
        setCheckOut(null)
      }
    }
  }

  const isDateInRange = (day: number) => {
    if (!checkIn || !checkOut) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date > new Date(checkIn) && date < new Date(checkOut)
  }

  const isDateSelected = (day: number) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split('T')[0]
    return dateStr === checkIn || dateStr === checkOut
  }

  const handleSearch = () => {
    onSearch({
      location,
      checkIn,
      checkOut,
      adults,
      children
    })
    onClose()
  }

  const handleClear = () => {
    if (step === "location") {
      setLocation("")
      setSearchQuery("")
    } else if (step === "dates") {
      setCheckIn(null)
      setCheckOut(null)
    } else {
      setAdults(0)
      setChildren(0)
    }
  }

  const getNightCount = () => {
    if (!checkIn || !checkOut) return 0
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="w-full bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {step === "location" && "Where to?"}
            {step === "dates" && "When's your trip?"}
            {step === "guests" && "Who's coming?"}
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
                <MapPin className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProvinces.map((province) => (
                  <button
                    key={province.code}
                    onClick={() => {
                      setLocation(province.name)
                      setStep("dates")
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  >
                    <MapPin size={20} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{province.name}, Vietnam</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "dates" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className={`p-2 rounded-lg transition-colors ${
                      canGoPrevMonth() 
                        ? 'hover:bg-muted' 
                        : 'opacity-30 cursor-not-allowed'
                    }`}
                    disabled={!canGoPrevMonth()}
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
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar().map((day, idx) => {
                    const isPast = day ? isPastDate(day) : false
                    const isDisabled = !day || isPast

                    return (
                      <button
                        key={idx}
                        onClick={() => day && !isPast && handleDateClick(day)}
                        disabled={isDisabled}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          day === null
                            ? "invisible"
                            : isPast
                              ? "text-muted-foreground/30 cursor-not-allowed line-through"
                              : isDateSelected(day)
                                ? "bg-primary text-primary-foreground"
                                : isDateInRange(day)
                                  ? "bg-primary/30 text-foreground"
                                  : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {checkIn && checkOut && (
                <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 border border-border">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-semibold text-foreground">
                    {getNightCount()} night{getNightCount() > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {step === "guests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <div className="font-medium text-foreground">Adults</div>
                  <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                </div>
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
                <div>
                  <div className="font-medium text-foreground">Children</div>
                  <div className="text-sm text-muted-foreground">Ages 2-12</div>
                </div>
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
            onClick={handleClear}
            className="flex-1 py-3 px-4 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => {
              if (step === "location") setStep("dates")
              else if (step === "dates") setStep("guests")
              else handleSearch()
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