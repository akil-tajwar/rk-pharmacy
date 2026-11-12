'use client'

import React from 'react'
import { useCallback, useEffect, useState } from 'react'
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
import { Plus, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react'
import type { CreateCategoryType, GetCategoryType } from '@/utils/type'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/utils/api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popup } from '@/utils/popup'
import { CustomCombobox } from '@/utils/custom-combobox'
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

interface GroupedCategory {
  head: GetCategoryType
  children: GetCategoryType[]
}

function groupCategoriesByHead(
  categories: GetCategoryType[]
): GroupedCategory[] {
  const heads = categories.filter((cat) => cat.isCategoryHead === true)
  return heads.map((head) => ({
    head,
    children: categories.filter(
      (cat) => cat.categoryHeadId === head.id && cat.isCategoryHead === false
    ),
  }))
}

const Categories = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State for dialog visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedHeads, setExpandedHeads] = useState<Set<number>>(new Set())

  const [editingCategory, setEditingCategory] =
    useState<GetCategoryType | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for form data
  const [formData, setFormData] = useState<CreateCategoryType>({
    name: '',
    categoryType: 'men',
    isCategoryHead: false,
    categoryHeadId: null,
    sizeType: 'men panjabi',
  })

  // State for table data
  const [categories, setCategories] = useState<GetCategoryType[]>([])

  const fetchCategoriesData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await fetchCategories(token)
      console.log('🚀 ~ fetchCategories ~ response:', response)
      if (response?.error?.status === 401) {
        return
      } else {
        setCategories(response.data ?? [])
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      categoryType: 'men',
      isCategoryHead: false,
      categoryHeadId: null,
      sizeType: 'men panjabi',
    })
    setEditingCategory(null)
    setIsPopupOpen(false)
  }, [])

  const handleEdit = useCallback((category: GetCategoryType) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      categoryType: category.categoryType,
      isCategoryHead: category.isCategoryHead,
      categoryHeadId: category.categoryHeadId,
      sizeType: category.sizeType,
    })
    setIsPopupOpen(true)
  }, [])

  const handleDeleteClick = (productId: number) => {
    setCategoryToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!token || !categoryToDelete) return

    try {
      setIsLoading(true)
      await deleteCategory(categoryToDelete, token)
      await fetchCategoriesData() // This will properly refresh the categories
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (headId: number | undefined) => {
    if (headId === undefined) return
    setExpandedHeads((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(headId)) {
        newSet.delete(headId)
      } else {
        newSet.add(headId)
      }
      return newSet
    })
  }

  // Helper function to check if a category head has children
  const hasChildren = (categoryId: number | undefined): boolean => {
    if (categoryId === undefined) return false
    return categories.some(
      (cat) => cat.categoryHeadId === categoryId && !cat.isCategoryHead
    )
  }

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        setIsSubmitting(true)
        const payload: CreateCategoryType = {
          name: formData.name,
          categoryType: formData.categoryType,
          isCategoryHead: formData.isCategoryHead,
          categoryHeadId: formData.categoryHeadId,
          sizeType: formData.sizeType,
        }

        if (editingCategory) {
          if (editingCategory?.id !== undefined) {
            await updateCategory(token, editingCategory.id, payload)
          }
        } else {
          await createCategory(token, payload)
        }

        // Refresh the categories list
        fetchCategoriesData()

        // Reset form and close dialog
        resetForm()
      } catch (error) {
        console.error('Error saving category:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, token, fetchCategoriesData, resetForm, editingCategory]
  )

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      product: {
        ...prev,
        [name]: Number(value),
      },
    }))
  }

  const groupedCategories = groupCategoriesByHead(categories)
  let slNo = 1

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-400 p-2 rounded-md">
            <Plus className="bg-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Categories</h2>
        </div>
        <Button
          className="bg-blue-400 hover:bg-blue-500 text-black"
          onClick={() => {
            setEditingCategory(null)
            setFormData({
              name: '',
              categoryType: 'men',
              isCategoryHead: false,
              sizeType: 'men panjabi',
            })
            setIsPopupOpen(true)
          }}
        >
          Add Category
        </Button>
      </div>

      {/* Table for category data */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Sl No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category Type</TableHead>
              <TableHead>Category Head</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : groupedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              groupedCategories.map((group) => {
                const isExpanded =
                  group.head.id !== undefined &&
                  expandedHeads.has(group.head.id)
                const headSlNo = slNo
                slNo += 1
                const headHasChildren = hasChildren(group.head.id)

                return (
                  <React.Fragment key={`group-${group.head.id}`}>
                    {/* Category Head Row */}
                    <TableRow className="bg-blue-50 hover:bg-blue-100 font-semibold">
                      <TableCell>
                        <button
                          onClick={() => toggleExpanded(group.head.id)}
                          className="p-0 hover:bg-blue-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>{headSlNo}</TableCell>
                      <TableCell>{group.head.name}</TableCell>
                      <TableCell>{group.head.categoryType}</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Yes
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(group.head)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(group.head.id as number)
                          }
                          disabled={headHasChildren}
                          title={
                            headHasChildren
                              ? 'Cannot delete category head with subcategories'
                              : 'Delete category'
                          }
                        >
                          <Trash2
                            className={`w-4 h-4 ${headHasChildren ? 'text-gray-400' : 'text-red-600'}`}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Child Category Rows */}
                    {isExpanded &&
                      group.children.map((child) => {
                        const childSlNo = slNo
                        slNo += 1

                        return (
                          <TableRow
                            key={`child-${child.id}`}
                            className="bg-white hover:bg-gray-50"
                          >
                            <TableCell></TableCell>
                            <TableCell className="pl-12">{childSlNo}</TableCell>
                            <TableCell className="pl-12">
                              {child.name}
                            </TableCell>
                            <TableCell>{child.categoryType}</TableCell>
                            <TableCell>
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                No
                              </span>
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(child)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteClick(child.id as number)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog with form */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="sm:max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name*</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryType">Category Type</Label>
              <Select
                name="categoryType"
                value={formData.categoryType.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryType: value as 'men' | 'kids',
                  }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeType">Size Type</Label>
              <Select
                name="sizeType"
                value={formData.sizeType.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    sizeType: value as
                      | 'men panjabi'
                      | 'men payjama'
                      | 'men formal shirt'
                      | 'men casual shirt'
                      | 'little kids panjabi'
                      | 'growing kids panjabi',
                  }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men panjabi">Men Panjabi</SelectItem>
                  <SelectItem value="men payjama">Men Payjama</SelectItem>
                  <SelectItem value="men formal shirt">
                    Men Formal Shirt
                  </SelectItem>
                  <SelectItem value="men casual shirt">
                    Men Causal Shirt
                  </SelectItem>
                  <SelectItem value="little kids panjabi">
                    Little Kids Panjabi
                  </SelectItem>
                  <SelectItem value="growing kids panjabi">
                    Growing Kids Panjabi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!formData.isCategoryHead && (
              <div className="space-y-2">
                <Label htmlFor="categoryHeadId">Category Head*</Label>
                <CustomCombobox
                  items={categories
                    .filter((cat) => cat.isCategoryHead === true) // only heads
                    .map((cat) => ({
                      id: cat.id?.toString() || '0',
                      name: cat.name,
                    }))}
                  value={
                    formData.categoryHeadId
                      ? {
                          id: formData.categoryHeadId.toString(),
                          name:
                            categories.find(
                              (c) => c.id === formData.categoryHeadId
                            )?.name || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryHeadId: value ? Number(value.id) : null,
                    }))
                  }
                  placeholder="Select Category Head"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isCategoryHead"
              name="isCategoryHead"
              checked={formData.isCategoryHead}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isCategoryHead: checked as boolean,
                }))
              }
            />
            <Label htmlFor="isCategoryHead" className="cursor-pointer">
              Is Category Head
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Save Category'}
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
              category from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
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

export default Categories
