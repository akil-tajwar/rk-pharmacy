'use client'

import * as React from 'react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { CheckCircle, Trash2, ArrowUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
import { fetchAllOrders, confirmOrder, deleteOrder } from '@/utils/api'
import type { GetOrderType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

type SortColumn =
  | 'fullName'
  | 'phone'
  | 'division'
  | 'district'
  | 'totalAmount'
  | 'method'
  | 'createdAt'
  | 'status'
  | 'transactionId'
  | 'address'
type SortDirection = 'asc' | 'desc'

export default function OrdersToConfirm() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const { toast } = useToast()

  // State variables
  const [orders, setOrders] = useState<GetOrderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Confirm order dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const fetchOrdersData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await fetchAllOrders(token)
      console.log('🚀 ~ fetchOrders ~ response:', response)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else {
        // Filter only pending orders
        const pendingOrders = (response.data ?? []).filter(
          (order) => order.orderMaster.status === 'pending'
        )
        setOrders(pendingOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, router, toast])

  useEffect(() => {
    fetchOrdersData()
  }, [fetchOrdersData])

  // Filtering orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders

    return orders.filter((order) => {
      return (
        order.orderMaster.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.phone
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.division
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.district
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.method
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.transactionId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.orderMaster.totalAmount?.toString().includes(searchTerm)
      )
    })
  }, [orders, searchTerm])

  // Sorting orders
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders]
    sorted.sort((a, b) => {
      if (sortColumn === 'totalAmount') {
        return sortDirection === 'asc'
          ? Number(a.orderMaster[sortColumn]) -
              Number(b.orderMaster[sortColumn])
          : Number(b.orderMaster[sortColumn]) -
              Number(a.orderMaster[sortColumn])
      }
      if (sortColumn === 'createdAt') {
        const dateA = new Date(a.orderMaster.createdAt || '').getTime()
        const dateB = new Date(b.orderMaster.createdAt || '').getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      return sortDirection === 'asc'
        ? String(a.orderMaster[sortColumn] || '').localeCompare(
            String(b.orderMaster[sortColumn] || '')
          )
        : String(b.orderMaster[sortColumn] || '').localeCompare(
            String(a.orderMaster[sortColumn] || '')
          )
    })
    return sorted
  }, [filteredOrders, sortColumn, sortDirection])

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedOrders, currentPage])

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleConfirmClick = (orderId: number) => {
    setOrderToConfirm(orderId)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmOrder = async () => {
    if (!orderToConfirm || !token) return

    try {
      setIsConfirming(true)
      const response = await confirmOrder(token, orderToConfirm)

      if ((response as any).error) {
        console.error('Error confirming order:', (response as any).error)
        toast({
          title: 'Error',
          description:
            (response as any).error?.message || 'Failed to confirm order',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Order confirmed successfully',
        })
        fetchOrdersData()
      }
    } catch (error) {
      console.error('Error confirming order:', error)
      toast({
        title: 'Error',
        description: 'Failed to confirm order',
        variant: 'destructive',
      })
    } finally {
      setIsConfirming(false)
      setIsConfirmDialogOpen(false)
      setOrderToConfirm(null)
    }
  }

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete || !token) return

    try {
      setIsDeleting(true)
      const response = await deleteOrder(orderToDelete, token)

      if (response.error) {
        console.error('Error deleting order:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to delete order',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Order deleted successfully',
        })
        fetchOrdersData()
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto py-10">
      <div className="flex justify-between items-center m-4 mb-6">
        <h1 className="text-2xl font-bold">Orders to Confirm</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead>Sl No</TableHead>
              <TableHead
                onClick={() => handleSort('fullName')}
                className="cursor-pointer"
              >
                  <span>Customer Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('phone')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Phone</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('division')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Division</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('district')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>District</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('method')}
                className="cursor-pointer"
              >
                Payment Method
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('transactionId')}
                className="cursor-pointer"
              >
                Transaction ID
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('totalAmount')}
                className="cursor-pointer"
              >
                Total Amount
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('createdAt')}
                className="cursor-pointer"
              >
                  <span>Order Date</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('address')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Address</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort('status')}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>status</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No pending orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => (
                <TableRow key={order.orderMaster.id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{order.orderMaster.fullName}</TableCell>
                  <TableCell>{order.orderMaster.phone}</TableCell>
                  <TableCell>{order.orderMaster.division}</TableCell>
                  <TableCell>{order.orderMaster.district}</TableCell>
                  <TableCell className="uppercase">
                    {order.orderMaster.method}
                  </TableCell>
                  <TableCell>
                    {order.orderMaster.transactionId || '-'}
                  </TableCell>
                  <TableCell>৳{order.orderMaster.totalAmount}</TableCell>
                  <TableCell>
                    {formatDate(order.orderMaster.createdAt)}
                  </TableCell>
                  <TableCell className="">
                    {order.orderMaster.address}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${order.orderMaster.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.orderMaster.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : order.orderMaster.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.orderMaster.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleConfirmClick(order.orderMaster.id!)
                        }
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(order.orderMaster.id!)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
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

      {/* Confirm Order Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this order? This action will
              change the order status to confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              disabled={isConfirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConfirming ? 'Confirming...' : 'Confirm Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
