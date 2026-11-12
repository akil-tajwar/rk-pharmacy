'use client'

import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import React, { useState, useEffect } from 'react'
import { getUserByUserId, fetchOrdersByUserId, updateUser } from '@/utils/api'
import { GetUsersType } from '@/utils/type'
import {
  User,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
} from 'lucide-react'
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
import { CustomCombobox } from '@/utils/custom-combobox'
import { locationData } from '@/utils/constants'
import { toast } from '@/hooks/use-toast'
import formatDate from '@/utils/formatDate'

type TabType = 'user-info' | 'my-orders'

export default function Profile() {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const [activeTab, setActiveTab] = useState<TabType>('user-info')
  const [userInfo, setUserInfo] = useState<GetUsersType | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    division: '',
    district: '',
    address: '',
  })

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true)
        const response = await getUserByUserId(token, userData?.userId ?? 0)
        setUserInfo(response.data)
        console.log('🚀 ~ fetchUserInfo ~ response:', response)

        // Initialize edit form data
        setEditFormData({
          fullName: response.data?.fullName || '',
          email: response.data?.email || '',
          phone: response.data?.phone || '',
          division: response.data?.division || '',
          district: response.data?.district || '',
          address: response.data?.address || '',
        })
      } catch (error) {
        // console.error('Failed to fetch user info:', error)
        // toast({
        //   title: 'Error',
        //   description: 'Failed to load user information',
        //   variant: 'destructive',
        // })
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [userData?.userId, token])

  // Fetch orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab !== 'my-orders' || !userData?.userId || !token) return

      try {
        setLoading(true)
        const response = await fetchOrdersByUserId(token, userData?.userId)
        console.log('🚀 ~ fetchOrders ~ userData?.userId:', userData?.userId)
        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data
              ? [response.data]
              : []
        )
        console.log('🚀 ~ fetchOrders ~ response.data:', response.data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [activeTab, userData?.userId, token])

  // Get available districts
  const getAvailableDistricts = () => {
    if (!editFormData.division) return []
    return (
      locationData.districts[
        editFormData.division as keyof typeof locationData.districts
      ] || []
    )
  }

  // Handle division change
  const handleDivisionChange = (value: { id: string; name: string } | null) => {
    setEditFormData((prev) => ({
      ...prev,
      division: value?.id || '',
      district: '', // Reset district when division changes
    }))
  }

  // Handle district change
  const handleDistrictChange = (value: { id: string; name: string } | null) => {
    setEditFormData((prev) => ({
      ...prev,
      district: value?.id || '',
    }))
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!userData?.userId || !token) return

    try {
      setLoading(true)

      // Update user
      const updateResponse = await updateUser(
        token,
        userData.userId,
        editFormData
      )

      // Check if the update was actually successful
      if (updateResponse.error) {
        console.log("🚀 ~ handleSaveChanges ~ updateResponse:", updateResponse)
        toast({
          title: 'Error',
          description: (updateResponse.error?.details as any).message,
          variant: 'destructive',
        })
        return
      }

      // Refresh user info only if update was successful
      const response = await getUserByUserId(token, userData.userId)
      setUserInfo(response.data)
      setIsEditing(false)

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditFormData({
      fullName: userInfo?.fullName || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      division: userInfo?.division || '',
      district: userInfo?.district || '',
      address: userInfo?.address || '',
    })
    setIsEditing(false)
  }

  // Get first letter for avatar
  const getInitial = () => {
    return (
      userInfo?.fullName?.charAt(0).toUpperCase() ||
      userInfo?.username?.charAt(0).toUpperCase() ||
      'U'
    )
  }

  if (loading && !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="lg:w-4/5 mx-auto">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Header Section - Now on the left */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-28 ">
              <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
              </div>

              <div className="px-6 pb-6">
                <div className="flex flex-col items-center -mt-16">
                  {/* Avatar */}
                  <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-7xl font-bold shadow-2xl ring-4 ring-white transform transition-transform group-hover:scale-105">
                      {getInitial()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {userInfo?.fullName || 'User'}
                    </h1>
                    <p className="text-gray-500 text-base mb-3">
                      @{userInfo?.username || 'username'}
                    </p>
                    {userInfo?.createdAt && (
                      <div className="inline-flex items-center gap-1.5 text-gray-700 text-sm font-medium bg-gray-50 px-4 py-2 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {formatDate(String(userInfo.createdAt))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content - Now on the right */}
          <div className="lg:col-span-8">
            {/* Tab Navigation - Now at the top */}
            <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('user-info')}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'user-info'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">User Info</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-orders')}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'my-orders'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">My Orders</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* User Info Tab */}
              {activeTab === 'user-info' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Personal Information
                    </h2>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveChanges}
                          disabled={loading}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-6">
                      {/* Read-only view */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo?.fullName || 'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Username
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo?.username || 'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo?.email || 'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo?.phone || 'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Division
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {locationData.divisions.find(
                              (d) => d.id === userInfo?.division
                            )?.name || 'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            District
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {(userInfo?.division &&
                              locationData.districts[
                                userInfo.division as keyof typeof locationData.districts
                              ]?.find((d) => d.id === userInfo?.district)
                                ?.name) ||
                              'Not provided'}
                          </p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address
                          </Label>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo?.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Edit mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={editFormData.fullName}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editFormData.email}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter your email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editFormData.phone}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Division</Label>
                          <CustomCombobox
                            items={locationData.divisions}
                            value={
                              editFormData.division
                                ? {
                                    id: editFormData.division,
                                    name:
                                      locationData.divisions.find(
                                        (d) => d.id === editFormData.division
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={handleDivisionChange}
                            placeholder="Select division"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>District</Label>
                          <CustomCombobox
                            items={getAvailableDistricts()}
                            value={
                              editFormData.district
                                ? {
                                    id: editFormData.district,
                                    name:
                                      getAvailableDistricts().find(
                                        (d) => d.id === editFormData.district
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={handleDistrictChange}
                            placeholder="Select district"
                            disabled={!editFormData.division}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <textarea
                            id="address"
                            value={editFormData.address}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            placeholder="Enter your complete address"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* My Orders Tab */}
              {activeTab === 'my-orders' && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order History
                  </h2>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No orders yet</p>
                      <p className="text-gray-400 text-sm">
                        Your order history will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-scroll">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Sl No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Total Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {index + 1}.
                              </TableCell>
                              <TableCell>
                                {formatDate(order.orderMaster.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {order.orderDetails &&
                                  order.orderDetails.length > 0 ? (
                                    order.orderDetails.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="text-sm text-gray-600"
                                        >
                                          {item.productName || 'Product'} (
                                          {item.size}) x {item.quantity}
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      No items
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    order.orderMaster.status === 'delivered'
                                      ? 'bg-green-100 text-green-700'
                                      : order.orderMaster.status ===
                                          'processing'
                                        ? 'bg-blue-100 text-blue-700'
                                        : order.orderMaster.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {order.orderMaster.status?.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-bold text-blue-600">
                                ৳{Math.round(order.orderMaster.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
