'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search,
  User,
  ShoppingCart,
  X,
  ChevronDown,
  Menu,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchProducts } from '@/utils/api'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'
import type { GetCategoryType } from '@/utils/type'
import { useCart } from '@/hooks/use-cart'
import { fetchCategories } from '@/utils/api'

interface NavbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredProducts: any[]
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

export default function Navbar({
  searchQuery,
  setSearchQuery,
  filteredProducts,
  isLoggedIn,
  currentUser,
  setIsLoginOpen,
  setIsRegisterOpen,
  handleLogout,
  setIsCartOpen,
  roleId,
  onCategoryClick,
}: NavbarProps) {
  const [categories, setCategories] = useState<GetCategoryType[]>([])
  const [token] = useAtom(tokenAtom)

  const [hoverMenu, setHoverMenu] = useState<string | null>(null)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(
    null
  )

  const router = useRouter()
  const pathname = usePathname()
  const { cartItems } = useCart()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchCategories(token),
          fetchProducts(token),
        ])
        if (catRes?.data) setCategories(catRes.data)
      } catch (err) {
        console.error('Failed loading data', err)
      }
    }

    loadData()
  }, [token])

  // Close sidebar when clicking outside
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  const handleCategoryClick = (categoryId: number, categoryPath: string) => {
    setIsSidebarOpen(false)
    onCategoryClick(categoryId)
    router.push(categoryPath)
  }

  const handleCloseSearch = () => {
    setShowSearchOverlay(false)
    setSearchQuery('') // Reset search query
  }

  // Check if search should be hidden based on pathname
  const shouldHideSearch =
    pathname.includes('product-details') ||
    pathname.includes('thank-you') ||
    pathname.includes('checkout')

  return (
    <>
      {/* NAVBAR */}
      {!showSearchOverlay && (
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-11/12 mx-auto px-4 py-2 flex items-center justify-between">
            {/* LEFT SECTION - Hamburger + Logo */}
            <div className="flex items-center gap-3">
              {/* HAMBURGER MENU - Visible only on mobile/tablet */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-700 hover:text-blue-600"
                aria-label="Menu"
              >
                <Menu className="w-7 h-7" />
              </button>

              {/* Logo */}
              <Link href="/" className="">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* CATEGORY HOVER MENU - Desktop Only */}
            <div className="hidden lg:flex gap-6 text-gray-700 font-medium relative">
              <Link
                href={'/men-products'}
                onMouseEnter={() => setHoverMenu('men')}
                className="cursor-pointer hover:text-blue-600 flex items-center"
              >
                <p>Men</p> <ChevronDown className="w-5" />
              </Link>
              <Link
                href={'/kids-products'}
                onMouseEnter={() => setHoverMenu('kids')}
                className="cursor-pointer hover:text-blue-600 flex items-center"
              >
                <p>Kids</p> <ChevronDown className="w-5" />
              </Link>
              <Link
                href={'/flash-sale-products'}
                className="cursor-pointer hover:text-blue-600"
              >
                Flash Sale
              </Link>

              {/* HOVER DROPDOWN */}
              {hoverMenu &&
                (() => {
                  const categoryHeads = categories.filter(
                    (cat) =>
                      cat.isCategoryHead &&
                      cat.categoryHeadId === null &&
                      cat.categoryType === hoverMenu
                  )

                  return (
                    <div
                      className="
                absolute 
                top-[180%] 
                left-1/2 -translate-x-1/2
                bg-white border border-slate-200 shadow-lg 
                p-6 rounded-lg 
                w-[90vw] sm:w-[80vw] lg:w-[50vw]
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                gap-6 
                animate-slideDown
                z-50
              "
                      onMouseEnter={() => setHoverMenu(hoverMenu)}
                      onMouseLeave={() => setHoverMenu(null)}
                    >
                      {categoryHeads.map((categoryHead) => {
                        const subCategories = categories.filter(
                          (cat) =>
                            !cat.isCategoryHead &&
                            cat.categoryHeadId === categoryHead.id
                        )

                        return (
                          <div key={categoryHead.id}>
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">
                              {categoryHead.name}
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                              {subCategories.map((subCat) => (
                                <li
                                  key={subCat.id}
                                  onClick={() => onCategoryClick(subCat.id!)}
                                  className="hover:text-blue-600 cursor-pointer pl-3"
                                >
                                  <Link
                                    href={`/category-products/${subCat.id}`}
                                  >
                                    {subCat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-4">
              {/* SEARCH ICON - Hidden on product-details, thank-you, checkout pages */}
              {!shouldHideSearch && (
                <button
                  onClick={() => setShowSearchOverlay(true)}
                  className="text-gray-600 hover:text-blue-600"
                  aria-label="Search"
                >
                  <Search className="w-7 h-7" />
                </button>
              )}

              {/* CART */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-gray-600 hover:text-blue-600 relative"
                aria-label="Shopping cart"
              >
                {cartItems.length > 0 && (
                  <p className="absolute text-xs bg-red-600 rounded-full px-1 text-white right-0 top-0">
                    {cartItems.length}
                  </p>
                )}

                <ShoppingCart className="w-7 h-7" />
              </button>

              {/* USER DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-blue-600 outline-none">
                  <User className="w-7 h-7" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 p-2 bg-white border rounded-lg shadow-lg">
                  {!isLoggedIn ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>
                        Login
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsRegisterOpen(true)}>
                        Register
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem disabled>
                        Hi, {currentUser}
                      </DropdownMenuItem>
                      {roleId === 1 && (
                        <DropdownMenuItem
                          onClick={() => router.push('/dashboard/categories')}
                        >
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-4">
          {/* Men Category */}
          <div className="mb-2">
            <div className="relative">
              <div className="flex items-center">
                <div
                  className="flex-1 p-3 cursor-pointer"
                  onClick={() =>
                    setExpandedAccordion(
                      expandedAccordion === 'men' ? null : 'men'
                    )
                  }
                >
                  <Link
                    href="/men-products"
                    onClick={() => setIsSidebarOpen(false)}
                    className="font-medium text-gray-700 hover:text-blue-600"
                  >
                    Men
                  </Link>
                </div>
                <button
                  onClick={() =>
                    setExpandedAccordion(
                      expandedAccordion === 'men' ? null : 'men'
                    )
                  }
                  className="p-3"
                  aria-label="Toggle men submenu"
                >
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      expandedAccordion === 'men' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Men Accordion Content */}
              {expandedAccordion === 'men' && (
                <div className="ml-4 mt-2 space-y-1 animate-slideDown">
                  {categories
                    .filter(
                      (cat) =>
                        cat.isCategoryHead &&
                        cat.categoryHeadId === null &&
                        cat.categoryType === 'men'
                    )
                    .map((categoryHead) => {
                      const subCategories = categories.filter(
                        (cat) =>
                          !cat.isCategoryHead &&
                          cat.categoryHeadId === categoryHead.id
                      )

                      return (
                        <div key={categoryHead.id} className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2 px-3">
                            {categoryHead.name}
                          </h4>
                          <ul className="space-y-1">
                            {subCategories.map((subCat) => (
                              <li key={subCat.id}>
                                <button
                                  onClick={() =>
                                    handleCategoryClick(
                                      subCat.id!,
                                      `/category-products/${subCat.id}`
                                    )
                                  }
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
                                >
                                  {subCat.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Kids Category */}
          <div className="mb-2">
            <div className="relative">
              <div className="flex items-center">
                <div
                  onClick={() =>
                    setExpandedAccordion(
                      expandedAccordion === 'kids' ? null : 'kids'
                    )
                  }
                  className="flex-1 p-3 cursor-pointer"
                >
                  <Link
                    href="/kids-products"
                    onClick={() => setIsSidebarOpen(false)}
                    className="font-medium text-gray-700 hover:text-blue-600"
                  >
                    Kids
                  </Link>
                </div>
                <button
                  onClick={() =>
                    setExpandedAccordion(
                      expandedAccordion === 'kids' ? null : 'kids'
                    )
                  }
                  className="p-3"
                  aria-label="Toggle kids submenu"
                >
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      expandedAccordion === 'kids' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Kids Accordion Content */}
              {expandedAccordion === 'kids' && (
                <div className="ml-4 mt-2 space-y-1 animate-slideDown">
                  {categories
                    .filter(
                      (cat) =>
                        cat.isCategoryHead &&
                        cat.categoryHeadId === null &&
                        cat.categoryType === 'kids'
                    )
                    .map((categoryHead) => {
                      const subCategories = categories.filter(
                        (cat) =>
                          !cat.isCategoryHead &&
                          cat.categoryHeadId === categoryHead.id
                      )

                      return (
                        <div key={categoryHead.id} className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2 px-3">
                            {categoryHead.name}
                          </h4>
                          <ul className="space-y-1">
                            {subCategories.map((subCat) => (
                              <li key={subCat.id}>
                                <button
                                  onClick={() =>
                                    handleCategoryClick(
                                      subCat.id!,
                                      `/category-products/${subCat.id}`
                                    )
                                  }
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded"
                                >
                                  {subCat.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Flash Sale - No Accordion */}
          <div className="flex items-center justify-between p-3 cursor-pointer">
            <Link
              href="/flash-sale-products"
              onClick={() => setIsSidebarOpen(false)}
              className="font-medium text-gray-700 hover:text-blue-600"
            >
              Flash Sale
            </Link>
          </div>
        </div>
      </div>

      {/* FULLSCREEN SEARCH OVERLAY */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-white z-50 h-fit animate-slideDownFast p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Search Products {searchQuery && <span>(Found {filteredProducts.length})</span>}</h2>
            <button onClick={handleCloseSearch} aria-label="Close search">
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="relative w-full">
            <Input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 p-4 text-lg rounded-lg"
            />
            {searchQuery && (
              <div className="mt-3 text-gray-600 text-sm">
                {/* Found {filteredProducts.length} results */}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
