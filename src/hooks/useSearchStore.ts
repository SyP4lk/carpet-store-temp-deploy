import { create } from "zustand"
import { RugProduct } from "@/types/product" // <-- sizning type joylashgan joyni to‘g‘rilang

interface SearchStore {
  // State
  isSearchOpen: boolean
  searchQuery: string
  searchResults: RugProduct[]
  isLoading: boolean

  // Actions
  openSearch: () => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: RugProduct[]) => void
  setLoading: (loading: boolean) => void

  // Search function
  searchProducts: (locale?: string) => Promise<void>
}

const useSearchStore = create<SearchStore>((set, get) => ({
  // State
  isSearchOpen: false,
  searchQuery: "",
  searchResults: [],
  isLoading: false,

  // Actions
  openSearch: () => set({ isSearchOpen: true }),

  closeSearch: () =>
    set({
      isSearchOpen: false,
      searchQuery: "",
      searchResults: [],
    }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSearchResults: (results: RugProduct[]) => set({ searchResults: results }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Search function
  searchProducts: async (locale: string = "en") => {
    const { searchQuery } = get()

    if (!searchQuery.trim()) {
      set({ searchResults: [] })
      return
    }

    set({ isLoading: true })

    try {
      const params = new URLSearchParams()
      params.append("query", searchQuery.trim())
      params.append("locale", locale)

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        set({ searchResults: data.products as RugProduct[] || [] })
      } else {
        console.error("Search error:", data.error)
        set({ searchResults: [] })
      }
    } catch (error) {
      console.error("Search failed:", error)
      set({ searchResults: [] })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useSearchStore
