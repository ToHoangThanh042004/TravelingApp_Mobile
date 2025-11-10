"use client"

import { Search } from "lucide-react"

export type SearchFilters = {
  location: string
  checkIn: string | null
  checkOut: string | null
  adults: number
  children: number
}

interface SearchBarProps {
  onOpenSearch: () => void
  filters?: SearchFilters
}

export function SearchBar({ onOpenSearch, filters }: SearchBarProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const getDateDisplay = () => {
    if (filters?.checkIn && filters?.checkOut) {
      return `${formatDate(filters.checkIn)} - ${formatDate(filters.checkOut)}`
    }
    return 'Add dates'
  }

  const getGuestsDisplay = () => {
    if (!filters) return 'Add guests'
    const total = filters.adults + filters.children
    if (total === 0) return 'Add guests'
    return `${total} guest${total > 1 ? 's' : ''}`
  }

  const locationDisplay = filters?.location || 'Anywhere'

  return (
    <button
      onClick={onOpenSearch}
      className="w-full bg-card border border-border rounded-full px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200"
    >
      <Search size={18} className="text-primary" />
      <div className="flex-1 text-left">
        <p className="text-xs text-muted-foreground">{locationDisplay}</p>
        <p className="text-sm font-medium text-foreground">
          {getDateDisplay()} · {getGuestsDisplay()}
        </p>
      </div>
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <Search size={16} className="text-primary-foreground" />
      </div>
    </button>
  )
}