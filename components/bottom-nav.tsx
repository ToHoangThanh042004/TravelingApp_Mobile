"use client"

import { Home, MapPin, Heart, User, Bookmark } from "lucide-react"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "map", icon: MapPin, label: "Map" },
    { id: "bookings", icon: Bookmark, label: "Bookings" },
    { id: "favorites", icon: Heart, label: "Favorites" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-4 transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={24} className={`transition-all duration-200 ${isActive ? "scale-110" : "scale-100"}`} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
              {isActive && <div className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full"></div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
