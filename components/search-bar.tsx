"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  onOpenSearch: () => void
}

export function SearchBar({ onOpenSearch }: SearchBarProps) {
  return (
    <button
      onClick={onOpenSearch}
      className="w-full bg-card border border-border rounded-full px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow duration-200"
    >
      <Search size={18} className="text-primary" />
      <div className="flex-1 text-left">
        <p className="text-xs text-muted-foreground">Anywhere</p>
        <p className="text-sm font-medium text-foreground">23-31 May, 2 guests</p>
      </div>
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <Search size={16} className="text-primary-foreground" />
      </div>
    </button>
  )
}
