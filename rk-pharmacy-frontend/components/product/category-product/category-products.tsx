'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GetProductType } from '@/utils/type'
import { fetchProducts } from '@/utils/api'
import CategoryProductsDisplay from '../category-product-display'
import { useParams } from 'next/navigation'

export default function CategoryProduct() {
  const { subCategoryId } = useParams()
  console.log("🚀 ~ CategoryProduct ~ subCategoryId:", subCategoryId)
  const [products, setProducts] = useState<GetProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = 'your-token'

  const getProducts = useCallback(async () => {
    try {
      const res = await fetchProducts(token)
      const productsData = res.data ?? []
      console.log("🚀 ~ CategoryProduct ~ res.data:", res.data)

      // Filter for specific category
      const categoryProducts = productsData.filter(
        (p: GetProductType) => p.product.subCategoryId === Number(subCategoryId)
      )
      console.log("🚀 ~ CategoryProduct ~ categoryProducts:", categoryProducts)

      setProducts(categoryProducts)
    } catch (err) {
      console.error(err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [token, subCategoryId])

  useEffect(() => {
    getProducts()
  }, [getProducts])

  return (
    <CategoryProductsDisplay
      categoryType={products[0]?.product?.subCategoryName?? ''}
      products={products}
      loading={loading}
      error={error}
    />
  )
}
