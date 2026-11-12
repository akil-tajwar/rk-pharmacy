// app/page.tsx or components/home/page.tsx
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import HeroSlider from './hero-slider'
import ProductCard from '../product/product-card'
import { fetchProducts } from '@/utils/api'
import { useToast } from '@/hooks/use-toast'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import type { GetProductType, GetCategoryType } from '@/utils/type'
import { Toaster } from '@/components/ui/toaster'
import { useSearch } from '@/hooks/use-search'
import { useRouter } from 'next/navigation'
import Loader from '@/utils/loader'
import { fetchCategories } from '@/utils/api'

export default function Home() {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const { toast } = useToast()
  const router = useRouter()
  const { searchQuery, filteredProducts, setAllProducts } = useSearch()

  const [products, setProducts] = useState<GetProductType[]>([])
  const [categories, setCategories] = useState<GetCategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedProduct, setSelectedProduct] = useState<GetProductType | null>(
    null
  )
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // Refs for scrolling
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({})
  const searchResultsRef = useRef<HTMLElement | null>(null)

  // Fetch categories
  const getCategories = useCallback(async () => {
    try {
      const res = await fetchCategories(token)
      setCategories(res.data ?? [])
    } catch (err) {
      console.error(err)
      setError('Failed to load categories')
    }
  }, [token])

  // Fetch products
  const getProducts = useCallback(async () => {
    try {
      const res = await fetchProducts(token)
      const productsData = res.data ?? []
      setProducts(productsData)
      setAllProducts(productsData)
    } catch (err) {
      console.error(err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [token, setAllProducts])

  useEffect(() => {
    getCategories()
    getProducts()
  }, [getCategories, getProducts])

  // Scroll to top when search query changes
  useEffect(() => {
    if (searchQuery && searchResultsRef.current) {
      searchResultsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [searchQuery])

  // Get subcategories for a category type
  const getSubCategories = (categoryType: 'men' | 'kids') => {
    return categories.filter(
      (cat) =>
        cat.categoryType === categoryType &&
        cat.isCategoryHead === false &&
        cat.categoryHeadId !== null
    )
  }

  // Get products for a specific subcategory
  const getProductsBySubCategory = (subCategoryId: number) => {
    return products.filter(
      (product) => product.product.subCategoryId === subCategoryId
    )
  }

  // Group products by category type and subcategory
  const menSubCategories = getSubCategories('men')
  const kidsSubCategories = getSubCategories('kids')

  const handleViewAllSubCategory = (subCategoryId: number) => {
    router.push(`/category-products/${subCategoryId}`)
  }

  if (loading)
    return (
      <div className="text-center mt-10 min-h-[45vh] flex items-center justify-center">
        <Loader />
      </div>
    )
  if (error) return <p className="text-center text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider - Hidden when searching */}
      {!searchQuery && <HeroSlider />}

      {/* Search Results */}
      {searchQuery && (
        <section
          ref={searchResultsRef}
          className="container mx-auto sm:px-3 pt-24 pb-8 md:pt-28 md:pb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results for &quot;{searchQuery}&quot; (
            {filteredProducts.length} items)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Product Collections */}
      {!searchQuery && (
        <main className="container mx-auto sm:px-3 pt-8 md:pt-12">
          {/* Men's Collection */}
          {menSubCategories.length > 0 && (
            <section
              ref={(el) => {
                categoryRefs.current['men'] = el
              }}
              id="men-collection"
              className="mb-12 md:mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Men&apos;s Collection
              </h2>

              {menSubCategories.map((subCategory) => {
                const subCategoryProducts = getProductsBySubCategory(
                  subCategory.id!
                )
                if (subCategoryProducts.length === 0) return null

                const limit = 4
                const displayedProducts = subCategoryProducts.slice(0, limit)
                const hasMore = subCategoryProducts.length > 4

                return (
                  <div key={subCategory.id} className="mb-8 md:mb-10">
                    <div className="flex justify-between items-center my-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                        {subCategory.name}
                      </h3>
                      {hasMore && (
                        <div className="hidden lg:block">
                          <Button
                            variant="outline"
                            className="text-sm text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-white px-4 py-2"
                            onClick={() =>
                              handleViewAllSubCategory(subCategory.id!)
                            }
                          >
                            View All
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {displayedProducts.map((product) => (
                        <ProductCard
                          key={product.product.id}
                          product={product}
                        />
                      ))}
                    </div>

                    {/* View All Button - only if more than 4 products */}
                    {hasMore && (
                      <>
                        {/* Desktop - right aligned */}

                        {/* Mobile - center aligned */}
                        <div className="md:hidden flex justify-center mt-4">
                          <Button
                            variant="outline"
                            className="text-sm text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-white px-4 py-2"
                            onClick={() =>
                              handleViewAllSubCategory(subCategory.id!)
                            }
                          >
                            View All
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {/* Kids Collection */}
          {kidsSubCategories.length > 0 && (
            <section
              ref={(el) => {
                categoryRefs.current['kids'] = el
              }}
              id="kids-collection"
              className="mb-12 md:mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Kid&apos;s Collection
              </h2>

              {kidsSubCategories.map((subCategory) => {
                const subCategoryProducts = getProductsBySubCategory(
                  subCategory.id!
                )
                if (subCategoryProducts.length === 0) return null

                const limit = 4
                const displayedProducts = subCategoryProducts.slice(0, limit)
                const hasMore = subCategoryProducts.length > 4

                return (
                  <div key={subCategory.id} className="mb-8 md:mb-10">
                    <div className="flex justify-between items-center my-4">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                        {subCategory.name}
                      </h3>
                      {hasMore && (
                        <div className="hidden lg:block">
                          <Button
                            variant="outline"
                            className="text-sm text-[#0d234b] border-[#0d234b] hover:bg-[#0d234b] hover:text-white bg-white px-4 py-2"
                            onClick={() =>
                              handleViewAllSubCategory(subCategory.id!)
                            }
                          >
                            View All
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {displayedProducts.map((product) => (
                        <ProductCard
                          key={product.product.id}
                          product={product}
                        />
                      ))}
                    </div>

                    {/* View All Button - only if more than 4 products */}
                    {hasMore && (
                      <>
                        {/* Desktop - right aligned */}
                        

                        {/* Mobile - center aligned */}
                        <div className="md:hidden flex justify-center mt-4">
                          <Button
                            variant="outline"
                            className="text-sm text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-white px-4 py-2"
                            onClick={() =>
                              handleViewAllSubCategory(subCategory.id!)
                            }
                          >
                            View All
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {menSubCategories.length === 0 && kidsSubCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products available at the moment.
              </p>
            </div>
          )}
        </main>
      )}

      <Toaster />
    </div>
  )
}
