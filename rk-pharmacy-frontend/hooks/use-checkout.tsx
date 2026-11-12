// hooks/use-checkout.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CheckoutContextType {
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  checkoutData: CheckoutData | null
  setCheckoutData: (data: CheckoutData | null) => void
}

interface CheckoutData {
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  notes?: string
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)

  return (
    <CheckoutContext.Provider
      value={{
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutData,
        setCheckoutData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
