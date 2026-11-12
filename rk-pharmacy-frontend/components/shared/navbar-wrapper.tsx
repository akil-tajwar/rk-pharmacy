// components/shared/navbar-wrapper.tsx
'use client'

import Navbar from './navbar'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import type { GetProductType } from '@/utils/type'
import { useSearch } from '@/hooks/use-search'

interface NavbarWrapperProps {
  onSearchChange: (query: string, filteredProducts: GetProductType[]) => void
  isLoggedIn: boolean
  currentUser: string
  setIsLoginOpen: (open: boolean) => void
  setIsRegisterOpen: (open: boolean) => void
  handleLogout: () => void
  setIsCartOpen: (open: boolean) => void
  getTotalItems: () => number
  roleId: number | null
  onCategoryClick: (categoryId: number) => void
  onProductClick: (productId: number) => void
}

export default function NavbarWrapper({
  onSearchChange,
  isLoggedIn,
  currentUser,
  setIsLoginOpen,
  setIsRegisterOpen,
  handleLogout,
  setIsCartOpen,
  getTotalItems,
  roleId,
  onCategoryClick,
  onProductClick,
}: NavbarWrapperProps) {
  const { searchQuery, setSearchQuery, setFilteredProducts, allProducts } =
    useSearch()
  const [token] = useAtom(tokenAtom)

  // No need to fetch products here anymore - we'll use allProducts from context

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)

    // Filter products based on search query using allProducts from context
    const filtered = allProducts.filter(
      (product) =>
        product?.product?.name?.toLowerCase().includes(query.toLowerCase()) ||
        product?.product.categoryName?.toLowerCase()?.includes(query.toLowerCase())
    )

    // Update global search context
    setFilteredProducts(filtered)

    // Notify parent component about search changes (if needed)
    if (onSearchChange) {
      onSearchChange(query, filtered)
    }
  }

  const filteredProductsForDisplay = allProducts.filter(
    (product) =>
      product?.product?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product?.product.categoryName?.toLowerCase()?.includes(searchQuery.toLowerCase())
  )

  return (
    <Navbar
      searchQuery={searchQuery}
      setSearchQuery={handleSearchChange}
      filteredProducts={filteredProductsForDisplay}
      isLoggedIn={isLoggedIn}
      currentUser={currentUser}
      setIsLoginOpen={setIsLoginOpen}
      setIsRegisterOpen={setIsRegisterOpen}
      handleLogout={handleLogout}
      setIsCartOpen={setIsCartOpen}
      getTotalItems={getTotalItems}
      roleId={roleId}
      onCategoryClick={onCategoryClick}
      onProductClick={onProductClick}
    />
  )
}
