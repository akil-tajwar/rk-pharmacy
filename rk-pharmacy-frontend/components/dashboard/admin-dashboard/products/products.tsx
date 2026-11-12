'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  ArrowUpDown,
  Search,
  Edit,
  GripVertical,
  X,
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type {
  CreateProductType,
  GetCategoryType,
  GetProductType,
} from '@/utils/type'
import {
  createProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
  deleteProduct,
} from '@/utils/api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { Popup } from '@/utils/popup'
import { CustomCombobox } from '@/utils/custom-combobox'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

type SortColumn = 'productCode' | 'name' | 'price' | 'discount' | 'isAvailable'
type SortDirection = 'asc' | 'desc'

interface ImageFile {
  id?: number
  file?: File
  url: string
  isExisting: boolean
}

const Products = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State for dialog visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [categories, setCategories] = useState<GetCategoryType[]>([])
  const [subCategories, setSubCategories] = useState<GetCategoryType[]>([])

  const [editingProduct, setEditingProduct] = useState<GetProductType | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  // Sorting, searching, and pagination state
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State for form data
  const [formData, setFormData] = useState<CreateProductType>({
    product: {
      productCode: '',
      name: '',
      description: '',
      price: 0,
      discount: 0,
      categoryId: 0,
      subCategoryId: 0,
      isAvailable: true,
      isFlashSale: false,
      availableSize: [],
    },
    photoUrls: [{ url: '' }],
  })

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // State for table data
  const [products, setProducts] = useState<GetProductType[]>([])

  const fetchCategoriesData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)

    try {
      const response = await fetchCategories(token)
      console.log('🚀 ~ fetchCategories ~ response:', response)

      if (response?.error?.status === 401) {
        return
      } else {
        const all = response.data ?? []

        const categoriesList = all.filter(
          (item) => item.isCategoryHead === true
        )
        const subCategoriesList = all.filter(
          (item) => item.isCategoryHead === false
        )

        setCategories(categoriesList)
        setSubCategories(subCategoriesList)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategoriesData()
  }, [fetchCategoriesData])

  const fetchProductsData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await fetchProducts(token)
      console.log('🚀 ~ fetchProducts ~ response:', response)
      if (response?.error?.status === 401) {
        return
      } else {
        setProducts(response.data ?? [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Fetch products on component mount
  useEffect(() => {
    fetchProductsData()
  }, [fetchProductsData])

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: checked,
        },
      }))
    } else if (name === 'price' || name === 'discount') {
      setFormData((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: Number.parseFloat(value) || 0,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: value,
        },
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoryId') {
      // Reset subcategory when category changes
      setFormData((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          categoryId: Number(value),
          subCategoryId: 0, // Reset subcategory
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        product: {
          ...prev.product,
          [name]: Number(value),
        },
      }))
    }
  }

  // Handle multiple file selection
  const handleMultipleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const newImageFiles: ImageFile[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }))

    setImageFiles((prev) => [...prev, ...newImageFiles])
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => {
      const newFiles = [...prev]
      // Revoke object URL to prevent memory leaks
      if (
        !newFiles[index].isExisting &&
        newFiles[index].url.startsWith('blob:')
      ) {
        URL.revokeObjectURL(newFiles[index].url)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...imageFiles]
    const draggedImage = newImages[draggedIndex]

    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setImageFiles(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const resetForm = useCallback(() => {
    setFormData({
      product: {
        productCode: '',
        name: '',
        description: '',
        price: 0,
        discount: 0,
        categoryId: 0,
        subCategoryId: 0,
        isAvailable: true,
        isFlashSale: false,
        availableSize: [],
      },
      photoUrls: [{ url: '' }],
    })

    // Clean up object URLs
    imageFiles.forEach((img) => {
      if (!img.isExisting && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })

    setImageFiles([])
    setEditingProduct(null)
    setIsPopupOpen(false)
  }, [imageFiles])

  const handleEdit = useCallback((product: GetProductType) => {
    setEditingProduct(product)
    setFormData({
      product: {
        id: product.product.id,
        productCode: product.product.productCode || '',
        name: product.product.name,
        description: product.product.description || '',
        price: product.product.price,
        discount: product.product.discount,
        categoryId: product.product.categoryId,
        subCategoryId: product.product.subCategoryId,
        isAvailable: product.product.isAvailable,
        isFlashSale: product.product.isFlashSale,
        availableSize: product.product.availableSize,
      },
      photoUrls:
        product.photoUrls.length > 0 ? product.photoUrls : [{ url: '' }],
    })

    // Load existing images
    const existingImages: ImageFile[] = product.photoUrls
      .filter((photo) => photo.url)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        isExisting: true,
      }))

    setImageFiles(existingImages)
    setIsPopupOpen(true)
  }, [])

  // Handle delete
  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!token || !productToDelete) return

    try {
      setIsLoading(true)
      await deleteProduct(token, productToDelete)
      await fetchProductsData()
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!token) return

      try {
        setIsSubmitting(true)

        const form = new FormData()

        // Build photoUrls array in the correct format
        const photoUrlsData = imageFiles.map((img, index) => {
          if (img.isExisting) {
            // Existing image from database
            return {
              id: img.id,
              url: img.url,
              // Keep the order based on current position
            }
          } else {
            // New image - will be uploaded
            return {
              url: '', // Backend will fill this after upload
            }
          }
        })

        // Create the complete product data structure
        const productData: CreateProductType = {
          product: formData.product,
          photoUrls: photoUrlsData,
        }

        // Add product data as JSON
        console.log('Product data to send:', productData)
        form.append('product', JSON.stringify(productData.product))
        form.append('photoUrls', JSON.stringify(photoUrlsData))

        // Append new image files (backend should match these with empty url entries)
        const newFiles = imageFiles.filter((img) => img.file)
        newFiles.forEach((img) => {
          if (img.file) {
            form.append('photoFiles', img.file)
          }
        })

        // Debug: Check what's in FormData
        console.log('=== FormData contents ===')
        for (let pair of form.entries()) {
          console.log(pair[0], ':', pair[1])
        }
        console.log('========================')

        if (editingProduct && editingProduct.product.id !== undefined) {
          await updateProduct(token, editingProduct.product.id, form)
        } else {
          await createProduct(token, form)
        }

        await fetchProductsData()
        resetForm()
      } catch (error) {
        console.error('Error saving product:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, token, fetchProductsData, resetForm, editingProduct, imageFiles]
  )

  // Filtering products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products

    return products.filter((product) => {
      const categoryName =
        categories.find((cat) => cat.id === product.product.categoryId)?.name ||
        ''
      const subCategoryName =
        subCategories.find((sub) => sub.id === product.product.subCategoryId)
          ?.name || ''

      return (
        product.product.productCode
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.product.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product.price?.toString().includes(searchTerm) ||
        product.product.discount?.toString().includes(searchTerm)
      )
    })
  }, [products, searchTerm, categories, subCategories])

  // Sorting products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      if (sortColumn === 'price' || sortColumn === 'discount') {
        return sortDirection === 'asc'
          ? Number(a.product[sortColumn]) - Number(b.product[sortColumn])
          : Number(b.product[sortColumn]) - Number(a.product[sortColumn])
      }
      if (sortColumn === 'isAvailable') {
        return sortDirection === 'asc'
          ? Number(a.product.isAvailable) - Number(b.product.isAvailable)
          : Number(b.product.isAvailable) - Number(a.product.isAvailable)
      }
      return sortDirection === 'asc'
        ? String(a.product[sortColumn] || '').localeCompare(
            String(b.product[sortColumn] || '')
          )
        : String(b.product[sortColumn] || '').localeCompare(
            String(a.product[sortColumn] || '')
          )
    })
    return sorted
  }, [filteredProducts, sortColumn, sortDirection])

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProducts, currentPage])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-400 p-2 rounded-md">
            <Plus className="bg-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Products</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-blue-400 hover:bg-blue-500 text-black"
            onClick={() => {
              setEditingProduct(null)
              setFormData({
                product: {
                  productCode: '',
                  name: '',
                  description: '',
                  price: 0,
                  discount: 0,
                  categoryId: 0,
                  subCategoryId: 0,
                  isAvailable: true,
                  isFlashSale: false,
                  availableSize: [],
                },
                photoUrls: [{ url: '' }],
              })
              setImageFiles([])
              setIsPopupOpen(true)
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Table for product data */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead>Sl No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead
                onClick={() => handleSort('productCode')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Product Code</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('name')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('price')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('discount')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Discount</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('isAvailable')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Available</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product, index) => (
                <TableRow key={product.product.id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <Link href={`/product-details/${product.product.id}`}>
                      {product.photoUrls && product.photoUrls.length > 0 ? (
                        <Image
                          src={product.photoUrls[0].url || '/placeholder.svg'}
                          alt={product.product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>{product.product.productCode || '-'}</TableCell>
                  <TableCell><Link href={`/product-details/${product.product.id}`} className='text-blue-800 font-semibold'>{product.product.name}</Link></TableCell>
                  <TableCell>৳{product.product.price}</TableCell>
                  <TableCell>{product.product.discount}%</TableCell>
                  <TableCell>
                    {product.product.isAvailable ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Yes
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteClick(product.product.id as number)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Dialog with form */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="sm:max-w-2xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Basic Product Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productCode">Product Code</Label>
              <Input
                id="productCode"
                name="productCode"
                type="text"
                value={formData.product.productCode || ''}
                onChange={handleInputChange}
                placeholder="Enter product code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name*</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.product.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price*</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.product.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                value={formData.product.discount}
                onChange={handleInputChange}
                placeholder="Enter discount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category*</Label>
              <CustomCombobox
                items={categories
                  .filter((cat) => cat.id !== undefined)
                  .map((cat) => ({
                    id: cat?.id?.toString() || '0',
                    name: cat.name || 'Unnamed item',
                  }))}
                value={
                  formData.product.categoryId
                    ? {
                        id: formData.product.categoryId.toString(),
                        name:
                          categories?.find(
                            (i) => i.id === formData.product.categoryId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange('categoryId', value ? value.id : '0')
                }
                placeholder="Select category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategoryId">Sub Category*</Label>
              <CustomCombobox
                items={subCategories
                  .filter(
                    (cat) =>
                      cat.id !== undefined &&
                      cat.categoryHeadId === formData.product.categoryId
                  )
                  .map((cat) => ({
                    id: cat?.id?.toString() || '0',
                    name: cat.name || 'Unnamed item',
                  }))}
                value={
                  formData.product.subCategoryId
                    ? {
                        id: formData.product.subCategoryId.toString(),
                        name:
                          subCategories?.find(
                            (i) => i.id === formData.product.subCategoryId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange('subCategoryId', value ? value.id : '0')
                }
                placeholder="Select category"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.product.description || ''}
                onChange={handleInputChange}
                placeholder="Enter product description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isAvailable"
                name="isAvailable"
                checked={formData.product.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    product: {
                      ...prev.product,
                      isAvailable: checked as boolean,
                    },
                  }))
                }
              />
              <Label htmlFor="isAvailable" className="cursor-pointer">
                Is Available
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isFlashSale"
                name="isFlashSale"
                checked={formData.product.isFlashSale}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    product: {
                      ...prev.product,
                      isFlashSale: checked as boolean,
                    },
                  }))
                }
              />
              <Label htmlFor="isFlashSale" className="cursor-pointer">
                Is Flash Sale
              </Label>
            </div>

            <div className="flex flex-col gap-2 space-y-2 py-3">
              <Label className="font-semibold">Available Sizes</Label>
              <div className="flex flex-wrap gap-4">
                {['M', 'L', 'XL', 'XXL'].map((size) => (
                  <div key={size} className="flex items-center gap-2">
                    <Checkbox
                      id={size}
                      name="availableSize"
                      checked={formData.product.availableSize.includes(
                        size as 'M' | 'L' | 'XL' | 'XXL'
                      )}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => {
                          const sizes = new Set(prev.product.availableSize)

                          if (checked) {
                            sizes.add(size as 'M' | 'L' | 'XL' | 'XXL')
                          } else {
                            sizes.delete(size as 'M' | 'L' | 'XL' | 'XXL')
                          }

                          return {
                            ...prev,
                            product: {
                              ...prev.product,
                              availableSize: Array.from(sizes),
                            },
                          }
                        })
                      }
                    />
                    <Label htmlFor={size} className="cursor-pointer">
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">Product Photos</Label>

            {/* File Input for Multiple Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="product-images"
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select Images (Multiple)
              </Label>
              <Input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500">
                You can select multiple images at once. Drag to reorder.
              </p>
            </div>

            {/* Image Preview Grid with Drag and Drop */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imageFiles.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${
                      draggedIndex === index
                        ? 'border-blue-400 opacity-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.url}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Order Badge */}
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>

                      {/* Drag Handle */}
                      <div className="absolute top-2 right-2 bg-white/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-gray-600" />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Existing Image Badge */}
                      {image.isExisting && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingProduct
                  ? 'Update Product'
                  : 'Save Product'}
            </Button>
          </DialogFooter>
        </form>
      </Popup>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Products
