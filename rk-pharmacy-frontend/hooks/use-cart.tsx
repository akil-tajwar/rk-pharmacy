// hooks/use-cart.tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import type { GetProductType } from '@/utils/type'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  url: string
  discount: number
  productCode: string
  size: string // Added size field
}

interface CartContextType {
  cartItems: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (product: GetProductType, size: string, quantity?: number) => void
  updateQuantity: (productId: number, size: string, newQuantity: number) => void
  removeFromCart: (productId: number, size: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getCartItemQuantity: (productId: number, size: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error)
          localStorage.removeItem('cart')
        }
      }
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isInitialized])

  const addToCart = (
    product: GetProductType,
    size: string,
    quantity: number = 1
  ) => {
    setCartItems((prevItems) => {
      // Find existing item with same product ID AND size
      const existingItem = prevItems.find(
        (item) => item.productId === product.product.id && item.size === size
      )

      if (existingItem) {
        // Update quantity if item with same size already exists
        return prevItems.map((item) =>
          item.productId === product.product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item with size
        const newItem: CartItem = {
          productId: product.product.id ?? 0,
          name: product.product.name,
          price: product.product.price * (1 - product.product.discount / 100),
          quantity: quantity,
          url: product.photoUrls?.[0]?.url || '',
          discount: product.product.discount,
          productCode: product.product.productCode ?? '',
          size: size,
        }
        return [...prevItems, newItem]
      }
    })
  }

  const updateQuantity = (
    productId: number,
    size: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: number, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartItemQuantity = (productId: number, size: string) => {
    const item = cartItems.find(
      (item) => item.productId === productId && item.size === size
    )
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
