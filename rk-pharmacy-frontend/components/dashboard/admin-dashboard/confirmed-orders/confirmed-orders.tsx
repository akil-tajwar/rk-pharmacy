'use client'

import * as React from 'react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { ArrowUpDown, CheckCircle, Search } from 'lucide-react'
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
import { completeOrder, fetchAllOrders } from '@/utils/api'
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
  | 'address'
  | 'status'
  | 'transactionId'
type SortDirection = 'asc' | 'desc'

export default function ConfirmedOrders() {
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

  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [orderToComplete, setOrderToComplete] = useState<number | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

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
        // Filter only confirmed orders
        const confirmedOrders = (response.data ?? []).filter(
          (order) =>
            order.orderMaster.status === 'confirmed' ||
            order.orderMaster.status === 'delivered'
        )
        setOrders(confirmedOrders)
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

  const handleCompleteClick = (orderId: number) => {
    setOrderToComplete(orderId)
    setIsCompleteDialogOpen(true)
  }

  const handleCompleteOrder = async () => {
    if (!orderToComplete || !token) return

    try {
      setIsCompleting(true)

      const response = await completeOrder(token, orderToComplete)

      if ((response as any)?.error) {
        toast({
          title: 'Error',
          description:
            (response as any).error?.message || 'Failed to complete order',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Order marked as delivered',
        })
        fetchOrdersData()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete order',
        variant: 'destructive',
      })
    } finally {
      setIsCompleting(false)
      setIsCompleteDialogOpen(false)
      setOrderToComplete(null)
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
        <h1 className="text-2xl font-bold">Confirmed Orders</h1>
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
                <div className="flex items-center gap-1">
                  <span>Customer Name</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
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
                <div className="flex items-center gap-1">
                  <span>Order Date</span>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
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
                <TableCell colSpan={10} className="text-center py-4">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No confirmed orders found
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
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={order.orderMaster.status === 'delivered'}
                      onClick={() => handleCompleteClick(order.orderMaster.id!)}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
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
      <AlertDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this order as delivered? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteOrder}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? 'Completing...' : 'Complete Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
