// context/search-context.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { GetProductType } from '@/utils/type'

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredProducts: GetProductType[]
  setFilteredProducts: (products: GetProductType[]) => void
  allProducts: GetProductType[]
  setAllProducts: (products: GetProductType[]) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<GetProductType[]>([])
  const [allProducts, setAllProducts] = useState<GetProductType[]>([])

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filteredProducts,
        setFilteredProducts,
        allProducts,
        setAllProducts,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
