'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GetProductType } from '@/utils/type'
import { fetchProducts } from '@/utils/api'
import CategoryProductsDisplay from '../category-product-display'
import { useAtom } from 'jotai'
import { tokenAtom } from '@/utils/user'

export default function MenProducts() {
  const [products, setProducts] = useState<GetProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token] = useAtom(tokenAtom)

  const getProducts = useCallback(async () => {
    try {
      const res = await fetchProducts(token)
      const productsData = res.data ?? []
      console.log("🚀 ~ MenProducts ~ productsData:", productsData)

      // Filter for men's products
      const menProducts = productsData.filter(
        (p: GetProductType) => p.product?.categoryType === 'men'
      )
      console.log("🚀 ~ MenProducts ~ menProducts:", menProducts)

      setProducts(menProducts)
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
      categoryType="Men"
      products={products}
      loading={loading}
      error={error}
    />
  )
}
