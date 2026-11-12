// components/layout/layout-client-wrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import NavbarWrapper from '@/components/shared/navbar-wrapper'
import SignIn, { UserType } from '@/components/home/login-form'
import RegisterForm from '@/components/home/register-form'
import { useAtom } from 'jotai'
import { tokenAtom, userDataAtom } from '@/utils/user'
import { SearchProvider } from '@/hooks/use-search'
import { CartProvider, useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import CartSidebar from '@/components/shared/cart-sidebar'
import type { GetProductType } from '@/utils/type'
import { CheckoutProvider } from '@/hooks/use-checkout'
import { createOrder } from '@/utils/api'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [roleId, setRoleId] = useState<number | null>(null)

  // Modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Get cart controls from context
  const { setIsCartOpen, getTotalItems, cartItems, clearCart } = useCart()

  // Load user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser')
      const storedRoleId = localStorage.getItem('roleId')

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setIsLoggedIn(true)
          setCurrentUser(parsedUser.username)
          setRoleId(parsedUser.roleId ?? 0)
        } catch (err) {
          console.error('Failed to parse saved user:', err)
        }
      }

      if (storedRoleId) {
        setRoleId(Number.parseInt(storedRoleId))
      }
    }
  }, [])

  const handleLogin = async (user: UserType) => {
    setIsLoggedIn(true)
    setCurrentUser(user.username)
    setRoleId(user.roleId ?? 0)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('roleId', String(user.roleId ?? 0))
    setIsLoginOpen(false)

    toast({
      title: 'Login Successful!',
      description: `Welcome back, ${user.username}!`,
    })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser('')
    setRoleId(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('roleId')

    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    })

    router.push('/')
  }

  const handleRegister = (user: UserType) => {
    setIsRegisterOpen(false)
    toast({
      title: 'Registration Successful!',
      description: 'Please login with your credentials.',
    })
    setIsLoginOpen(true)
  }

  const handleOrderComplete = async () => {
    if (!token || !userData?.userId) {
      toast({
        title: 'Login Required',
        description: 'Please login to place an order.',
        variant: 'destructive',
      })
      setIsCheckoutOpen(false)
      setIsLoginOpen(true)
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Prepare order items from cart
      const orderDetails = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: (item.size || 'M') as 'M' | 'L' | 'XL' | 'XXL',
        amount: item.price * item.quantity,
        ordersMasterId: 0,
      }))

      // Calculate total from localStorage cart
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      // Create order via API
      const response = await createOrder(token, {
        orderMaster: {
          status: 'pending',
          address: '',
          method: 'bkash',
          fullName: '',
          division: '',
          district: '',
          phone: '',
          totalAmount: totalAmount,
        },
        orderDetails: orderDetails,
      })

      if (response?.orderMaster) {
        // Clear cart from localStorage
        clearCart()
        setIsCheckoutOpen(false)

        // toast({
        //   title: 'Order Placed Successfully!',
        //   description: `Total Amount: ৳${response.orderMaster.totalOrderAmount || totalAmount.toFixed(2)}. You will receive a confirmation call shortly.`,
        // })
      } else {
        toast({
          title: 'Order Failed',
          description: 'Failed to place order. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error('Failed to create order:', err)
      toast({
        title: 'Order Failed',
        description: err.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Dummy handlers for navbar - these aren't needed in layout
  const handleSearchChange = (query: string, filtered: GetProductType[]) => {
    // This is handled by SearchProvider context
  }

  const handleCategoryClick = (categoryId: number) => {
    // Not needed in layout level
  }

  const handleProductClick = (productId: number) => {
    // Not needed in layout level
  }

  return (
    <>
      <NavbarWrapper
        onSearchChange={handleSearchChange}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        setIsLoginOpen={setIsLoginOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        handleLogout={handleLogout}
        setIsCartOpen={setIsCartOpen}
        getTotalItems={getTotalItems}
        roleId={roleId}
        onCategoryClick={handleCategoryClick}
        onProductClick={handleProductClick}
      />

      <SignIn
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
      />

      <RegisterForm
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
      />

      <CartSidebar />

      {children}
    </>
  )
}

export default function LayoutClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SearchProvider>
      <CartProvider>
        <CheckoutProvider>
          <LayoutContent>{children}</LayoutContent>
        </CheckoutProvider>
      </CartProvider>
    </SearchProvider>
  )
}
