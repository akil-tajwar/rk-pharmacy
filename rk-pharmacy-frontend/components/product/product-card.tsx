'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useState } from 'react'
import type { GetProductType } from '@/utils/type'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: GetProductType
  // onProductClick: (product: GetProductType) => void
}

const ALL_SIZES = ['M', 'L', 'XL', 'XXL']

export default function ProductCard({
  product,
  // onProductClick,
}: ProductCardProps) {
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')

  const { addToCart } = useCart()
  const { toast } = useToast()

  const firstImage =
    product.photoUrls?.[0]?.url || '/diverse-products-still-life.png'

  // const handleProductClick = () => {
  //   onProductClick(product)
  // }

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation()
    setSelectedSize(size)

    // Add to cart immediately when size is selected
    addToCart(product, size, 1)

    // toast({
    //   title: 'Added to Cart',
    //   description: `${product.product.name} (Size: ${size}) has been added to your cart.`,
    // })

    // Reset after a short delay
    setTimeout(() => {
      setSelectedSize('')
      setIsButtonHovered(false)
    }, 500)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col">
      {/* Image Section with hover zoom */}
      <Link
        href={`/product-details/${product.product.id}`}
        className="aspect-square relative overflow-hidden bg-gray-100"
        // onClick={handleProductClick}
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <Image
          height={300}
          width={300}
          src={firstImage || '/placeholder.svg'}
          alt={product.product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isImageHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {product.product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.product.discount}%
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="cursor-pointer">
          <Link
            href={`/product-details/${product.product.id}`}
            className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base"
          >
            {product.product.name}
          </Link>

          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
            {product.product.subCategoryName}
          </p>

          <div className="flex items-center justify-between mb-3 mt-auto">
            <div className="flex items-start md:items-center flex-col md:flex-row space-x-2">
              <span className="text-base md:text-lg font-bold text-gray-900">
                ৳
                {Math.round(
                  product.product.price * (1 - product.product.discount / 100)
                )}
              </span>

              {product.product.discount > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ৳{Math.round(product.product.price)}
                </span>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded h-full ${
                product.product.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.product.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => {
            if (!selectedSize) {
              setIsButtonHovered(false)
            }
          }}
          className="w-full relative h-10 md:h-11 overflow-hidden"
        >
          {/* === ADD TO CART VIEW === */}
          <Button
            disabled={!product.product.isAvailable}
            onClick={(e) => e.stopPropagation()}
            className={`
    absolute inset-0 w-full text-white
    text-sm md:text-base font-semibold
    bg-[#0d234b]
    disabled:bg-gray-400  disabled:text-gray-600
    transition-all duration-500 ease-in-out
    ${(isButtonHovered && product.product.isAvailable) ? '-translate-y-full' : 'translate-y-0'}
  `}
          >
            <span className="block">Add to Cart</span>
          </Button>

          {/* === SIZE BUTTONS VIEW === */}
          {product.product.isAvailable && (
            <div
              className={`
      absolute inset-0 rounded-md flex items-center justify-center gap-1 px-2
      font-semibold
    bg-[#0d234b]
    disabled:bg-gray-400  disabled:text-gray-600
    transition-all duration-500 ease-in-out
      ${(isButtonHovered && product.product.isAvailable) ? 'translate-y-0' : 'translate-y-full'}
    `}
            >
              {ALL_SIZES.map((size) => {
                const isAvailable = product.product?.availableSize?.includes(
                  size as 'M' | 'L' | 'XL' | 'XXL'
                )

                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={(e) => isAvailable && handleSizeSelect(e, size)}
                    className={`
            px-2 py-1 text-xs font-semibold rounded transition-all duration-200 
            ${
              isAvailable
                ? selectedSize === size
                  ? 'bg-white text-gray-600 scale-110'
                  : 'bg-white text-gray-700 hover:bg-white hover:text-gray-600'
                : 'bg-gray-300 text-gray-900 line-through cursor-not-allowed opacity-60'
            }
          `}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
