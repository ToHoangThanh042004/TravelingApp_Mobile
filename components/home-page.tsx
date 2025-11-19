"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { SearchBar, SearchFilters } from "@/components/search-bar"
import { PropertyCard } from "@/components/property-card"
import { BottomNav } from "@/components/bottom-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Heart, MapPin, Camera } from "lucide-react"
import { motion } from "framer-motion"

// Dynamic imports - chỉ load khi cần
const SearchModal = dynamic(() => import("@/components/search-modal").then(mod => ({ default: mod.SearchModal })), { ssr: false })
const FilterModal = dynamic(() => import("@/components/filter-modal").then(mod => ({ default: mod.FilterModal })), { ssr: false })
const EditProfileModal = dynamic(() => import("./edit-profile-modal").then(mod => ({ default: mod.EditProfileModal })), { ssr: false })
const MyBookingsPage = dynamic(() => import("./my-bookings-page").then(mod => ({ default: mod.MyBookingsPage })), { ssr: false })
const HotelChatPage = dynamic(() => import("./hotel-chat-page").then(mod => ({ default: mod.HotelChatPage })), { ssr: false })

interface HomePageProps {
  onViewProperty: (id: string) => void
  onViewHotel: (id: string) => void
  favorites: string[]
  properties: any[]
  onViewFavorites?: () => void
  onViewMyBookings?: () => void
  onToggleFavorite: (id: string) => void
  onBackFromChat?: () => void
}

type User = {
  id: string
  phoneNumber?: string
  name?: string
  avatar?: string
}

export function HomePage({
  onViewProperty,
  onViewHotel,
  favorites,
  properties,
  onToggleFavorite,
  onBackFromChat,
}: HomePageProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [localFavorites, setLocalFavorites] = useState<string[]>(favorites || [])
  const [showBookings, setShowBookings] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const apiBase = "http://192.168.1.18:3001"

  // State cho search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: "",
    checkIn: null,
    checkOut: null,
    adults: 0,
    children: 0
  })

  // Sync localFavorites khi favorites thay đổi
  useEffect(() => {
    setLocalFavorites(favorites)
  }, [favorites])

  // Load user
  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUser = localStorage.getItem("authUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("authUser")
      }
    }
  }, [])

  // Xử lý toggle favorite
  const handleToggleFavorite = async (propertyId: string) => {
    if (!user) return

    const isFav = localFavorites.includes(propertyId)
    try {
      if (isFav) {
        const favEntry = await fetch(`${apiBase}/favorites?userId=${user.id}&propertyId=${propertyId}`)
          .then(r => r.json())
          .then(favs => favs[0])
        if (favEntry?.id) {
          await fetch(`${apiBase}/favorites/${favEntry.id}`, { method: "DELETE" })
        }
      } else {
        await fetch(`${apiBase}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, propertyId })
        })
      }
    } catch (err) {
      console.error("Sync favorite failed:", err)
    }

    onToggleFavorite(propertyId)
  }

  // Xử lý search
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters)
  }

  // Lọc properties theo search filters
  const filterProperties = () => {
    return properties.filter(property => {
      // Lọc theo location
      if (searchFilters.location && !property.location.includes(searchFilters.location)) {
        return false
      }

      // Lọc theo số khách (kiểm tra có phòng nào đủ sức chứa không)
      const totalGuests = searchFilters.adults + searchFilters.children
      if (totalGuests > 0) {
        const hasRoomForGuests = property.rooms?.some(
          (room: any) => room.maxGuests >= totalGuests && room.available
        )
        if (!hasRoomForGuests) return false
      }

      // TODO: Lọc theo ngày (cần kiểm tra bookings)
      // Hiện tại giả sử tất cả phòng available đều có thể book được

      return true
    })
  }

  const filteredProperties = filterProperties()
  const hasActiveFilters = searchFilters.location || searchFilters.checkIn ||
    (searchFilters.adults + searchFilters.children) > 0

  const handleTabChange = (tab: string) => {
    if (tab === "bookings") {
      setShowBookings(true)
    } else if (tab === "chat") {
      setShowChat(true)
    } else {
      setActiveTab(tab)
    }
  }

  const handleBackFromBookings = () => {
    setShowBookings(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authUser")
    setUser(null)
  }

  const handleClearFilters = () => {
    setSearchFilters({
      location: "",
      checkIn: null,
      checkOut: null,
      adults: 0,
      children: 0
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Xin mời đăng nhập</h1>
          <button
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
            onClick={() => alert("Login functionality here")}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  if (showBookings) {
    return <MyBookingsPage userId={user.id} apiUrl={apiBase} onBack={handleBackFromBookings} />
  }

  if (showChat) {
    return (
      <HotelChatPage
        hotelName="Sunrise Resort"
        onBack={() => {
          setShowChat(false)
          onBackFromChat?.()
          setActiveTab("home")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              onOpenSearch={() => setShowSearch(true)}
              filters={searchFilters}
            />
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === "home" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {hasActiveFilters
                  ? `${filteredProperties.length} stay${filteredProperties.length !== 1 ? 's' : ''} found`
                  : 'Popular stays'}
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid gap-4">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="cursor-pointer"
                    onClick={() => onViewHotel(property.id)}
                  >
                    <PropertyCard
                      property={property}
                      onToggleFavorite={() => handleToggleFavorite(property.id)}
                      isFavorite={localFavorites.includes(property.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No hotels found matching your criteria</p>
                <button
                  onClick={handleClearFilters}
                  className="text-primary font-medium hover:underline"
                >
                  Clear filters and see all
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">Your favorites</h2>
            {localFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No favorites yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {properties
                  .filter((p) => localFavorites.includes(p.id))
                  .map((property) => (
                    <div
                      key={property.id}
                      onClick={() => onViewProperty(property.id)}
                      className="cursor-pointer"
                    >
                      <PropertyCard
                        property={property}
                        onToggleFavorite={() => handleToggleFavorite(property.id)}
                        isFavorite={true}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-muted">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera />
                    </div>
                  )}
                </div>

                <h3 className="text-center font-semibold text-foreground mb-1">
                  {user?.name ?? "User"}
                </h3>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  {user?.phoneNumber ?? "No phone number"}
                </p>

                <div className="w-full flex flex-col gap-3">
                  <button
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    onClick={() => setShowEdit(true)}
                  >
                    Edit Profile
                  </button>

                  <button
                    className="w-full py-2 px-4 mt-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                    onClick={() => setShowChat(true)}
                  >
                    Chat With Hotel
                  </button>

                  <button
                    className="w-full py-2 px-4 mt-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                    onClick={() => setActiveTab("bookings")}
                  >
                    My Bookings
                  </button>

                  <button
                    className="w-full py-2 px-4 mt-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
          initialFilters={searchFilters}
        />
      )}

      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onApply={(filters) => {
            console.log("Filters applied:", filters)
            setShowFilter(false)
          }}
        />
      )}

      {showEdit && user && (
        <EditProfileModal
          user={user}
          apiBase={apiBase}
          onClose={() => setShowEdit(false)}
          onSaved={(u) => setUser(u)}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}