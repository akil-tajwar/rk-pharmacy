'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import type { GetProductType } from '@/utils/type'
import { fetchProductById, fetchProducts } from '@/utils/api'
import { useToast } from '@/hooks/use-toast'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import menCasualShirt from '../../../public/men-casual-shirt-size.jpeg'
import menFormalShirt from '../../../public/men-formal-shirt-size.jpeg'
import menPanjabi from '../../../public/men-panjabi-size.jpeg'
import menPayjama from '../../../public/men-payjama-size.jpg'
import littleKidsPanjabi from '../../../public/little-kids-panjabi-size.jpeg'
import growingKidsPanjabi from '../../../public/growing-kids-panjabi-size.jpeg'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import ProductCard from '../product-card'

export default function ProductDetails() {
  useInitializeUser()
  const params = useParams()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const id = Number(params.id)
  console.log('🚀 ~ ProductDetails ~ id:', id)
  const [token] = useAtom(tokenAtom)
  const [product, setProduct] = useState<GetProductType | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<GetProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const ALL_SIZES = ['M', 'L', 'XL', 'XXL']

  const getProductbyId = useCallback(async () => {
    const product = await fetchProductById(token, id)

    if (product.error || !product.data) {
      console.error('Error getting product:', product.error)
      toast({
        title: 'Error',
        description: product.error?.message || 'Failed to get product',
      })
    } else {
      setProduct(product.data)
      console.log('🚀 ~ ProductDetails ~ product.data:', product.data)
    }
  }, [token, id, toast])

  const getRelatedProducts = useCallback(
    async (currentProduct: GetProductType) => {
      const products = await fetchProducts(token)

      if (products.error || !products.data) {
        console.error('Error getting products:', products.error)
      } else {
        const filtered = products.data.filter(
          (p) =>
            p.product.categoryId === currentProduct.product.categoryId &&
            p.product.subCategoryId === currentProduct.product.subCategoryId &&
            p.product.id !== currentProduct.product.id
        )
        setRelatedProducts(filtered)
      }
    },
    [token]
  )

  useEffect(() => {
    setLoading(true)
    getProductbyId()
  }, [getProductbyId])

  useEffect(() => {
    if (product) {
      getRelatedProducts(product)
      setLoading(false)
    }
  }, [product, getRelatedProducts])

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  const images = product.photoUrls || []
  const discountedPrice =
    product.product.price * (1 - product.product.discount / 100)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const image = document.getElementById('zoom-image') as HTMLElement
    if (!image) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()

    const x = ((e.pageX - left) / width) * 100
    const y = ((e.pageY - top) / height) * 100

    image.style.transform = `scale(1.8)`
    image.style.transformOrigin = `${x}% ${y}%`
  }

  const resetZoom = () => {
    const image = document.getElementById('zoom-image') as HTMLElement
    if (!image) return
    image.style.transform = `scale(1)`
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Size Required',
        description: 'Please select a size before adding to cart.',
        variant: 'destructive',
      })
      return
    }

    if (!product) return

    addToCart(product, selectedSize, quantity)

    toast({
      title: 'Added to Cart',
      description: `${product.product.name} (Size: ${selectedSize}, Qty: ${quantity}) has been added to your cart.`,
    })

    // Reset selections
    setSelectedSize('')
    setQuantity(1)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="lg:w-4/5 mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2 order-first">
              {images.length > 0 ? (
                images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-20 rounded overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? 'border-foreground'
                        : 'border-muted-foreground/20'
                    }`}
                  >
                    <Image
                      src={image?.url}
                      alt="product"
                      className="w-full h-full object-cover border"
                      width={1280}
                      height={1280}
                    />
                  </button>
                ))
              ) : (
                <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    No images
                  </span>
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative">
              {product.product.discount > 0 && (
                <div className="absolute top-4 left-4 text-white bg-red-600 px-3 py-1 rounded text-sm font-semibold z-10">
                  -{product.product.discount}%
                </div>
              )}
              {images.length > 0 ? (
                <div
                  className="h-full overflow-hidden cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={resetZoom}
                >
                  <Image
                    src={images[selectedImage]?.url || '/placeholder.svg'}
                    alt={product.product.name}
                    className="w-full h-full object-cover rounded border transition-transform duration-300 ease-in-out"
                    width={1280}
                    height={1280}
                    id="zoom-image"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground">
                    No image available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-pretty">
                  {product.product.name}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Product Code: {product.product.productCode}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {product.product.subCategoryName}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {product.product.discount > 0 && (
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{Math.round(product.product.price)}
                  </span>
                )}
                <span className="text-3xl font-bold text-blue-600">
                  ৳{Math.round(discountedPrice)}
                </span>
              </div>
              {product.product.discount > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  You Save ৳
                  {Math.round(product.product.price - discountedPrice)} (
                  {product.product.discount}%)
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">
                SELECT SIZE:{' '}
                {selectedSize && (
                  <span className="text-[#0d234b]">({selectedSize})</span>
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {ALL_SIZES.map((size) => {
                  const isSizeAvailable =
                    product.product?.availableSize?.includes(
                      size as 'S' | 'M' | 'L' | 'XL' | 'XXL'
                    )

                  const isDisabled =
                    !product.product.isAvailable || !isSizeAvailable

                  return (
                    <button
                      key={size}
                      disabled={isDisabled}
                      onClick={() => !isDisabled && setSelectedSize(size)}
                      className={`
        px-5 py-2 border-2 rounded font-medium transition-all duration-200
        ${
          isDisabled
            ? 'border-gray-300 text-gray-400 line-through cursor-not-allowed opacity-60'
            : selectedSize === size
              ? 'border-[#0d234b] bg-[#0d234b] text-white scale-105'
              : 'border-gray-300 text-foreground hover:border-[#0d234b] hover:bg-[#c7d7f4]'
        }
      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 border-2 border-gray-300 rounded px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className=" hover:bg-gray-100 transition-colors border-r-2 pr-2 py-1 border-gray-300"
                  >
                    <Minus className="w-9 h-9 p-2" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className=" hover:bg-gray-100 transition-colors border-l-2 pl-2 py-1 border-gray-300"
                  >
                    <Plus className="w-9 h-9 p-2" />
                  </button>
                </div>

                <Button
                  variant={'default'}
                  className="w-full flex-1 group relative px-8 py-6 bg-[#0d234b] hover:bg-[#0d234b] text-white disabled:bg-gray-400  disabled:text-gray-600 text-lg rounded shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-[fade-up_0.8s_ease-out_1.2s_both]"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !product.product.isAvailable}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {product.product.isAvailable ? 'ADD TO CART' : 'Out of Stock'}
                </Button>
              </div>

              {!selectedSize && (
                <p className="text-sm text-red-500">
                  ⚠️ Please select a size to add to cart
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Size Chart</h3>
                <Image
                  src={
                    (product.product.sizeType === 'men panjabi' && menPanjabi) ||
                    (product.product.sizeType === 'men payjama' && menPayjama) ||
                    (product.product.sizeType === 'men formal shirt' && menFormalShirt) ||
                    (product.product.sizeType === 'men casual shirt' && menCasualShirt) ||
                    (product.product.sizeType === 'little kids panjabi' && littleKidsPanjabi) ||
                    (product.product.sizeType === 'growing kids panjabi' && growingKidsPanjabi) ||
                    '/placeholder.svg'
                  }
                  alt={`${product.product.sizeType} size chart`}
                  className="w-full h-full object-cover rounded border"
                  width={1280}
                  height={1280}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <div className="border-b">
            <div className="py-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Product Description:</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.product.description || 'No description available'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Care & Washing:</h3>
                  <p className="text-sm text-muted-foreground">
                    Machine wash cold, gentle cycle. Do not bleach. Tumble dry
                    low or hang dry when needed.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Note:</h3>
                  <p className="text-sm">
                    The color of the product may look slightly different because
                    of lighting and your device&apos;s screen settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscountedPrice =
                  relatedProduct.product.price *
                  (1 - relatedProduct.product.discount / 100)
                const mainImage = relatedProduct.photoUrls?.[0]?.url

                return (
                  <ProductCard
                    key={relatedProduct.product.id}
                    product={relatedProduct}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
