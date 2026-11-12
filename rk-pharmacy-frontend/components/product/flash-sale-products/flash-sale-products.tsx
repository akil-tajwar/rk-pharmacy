'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GetProductType } from '@/utils/type'
import { fetchProducts } from '@/utils/api'
import CategoryProductsDisplay from '../category-product-display'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

const FlashSaleProducts = () => {
  const [products, setProducts] = useState<GetProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token] = useAtom(tokenAtom)

  const getProducts = useCallback(async () => {
    try {
      const res = await fetchProducts(token)
      const productsData = res.data ?? []

      // Filter for kids' products
      const flashSaleProducts = productsData.filter(
        (p: GetProductType) => p.product?.isFlashSale === true
      )

      setProducts(flashSaleProducts)
    } catch (err) {
      console.error(err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    getProducts()
  }, [getProducts])
  return (
    <CategoryProductsDisplay
      categoryType="Flash Sale"
      products={products}
      loading={loading}
      error={error}
    />
  )
}

export default FlashSaleProducts
