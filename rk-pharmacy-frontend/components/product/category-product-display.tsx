'use client'

import { useState } from 'react'
import type { GetProductType } from '@/utils/type'
import ProductCard from './product-card'

interface CategoryProductsDisplayProps {
  categoryType: string
  products: GetProductType[]
  loading?: boolean
  error?: string
}

export default function CategoryProductsDisplay({
  categoryType,
  products,
  loading = false,
  error,
}: CategoryProductsDisplayProps) {
  const [selectedProduct, setSelectedProduct] = useState<GetProductType | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Banner */}
      <div className="bg-[#0d234b] text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center uppercase tracking-wide">
            {categoryType}
          </h1>
          <p className="text-center mt-4 text-lg md:text-xl text-blue-100">
            Explore our collection of {products.length} products
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500">
              We couldn&apos;t find any products in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}