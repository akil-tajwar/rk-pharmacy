// components/shared/cart-sidebar.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { ShoppingCart, Plus, Minus, X, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CartSidebar() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart()
  const router = useRouter()

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar with slide-in animation */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-full sm:max-w-md 
          bg-white shadow-xl flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Shopping Cart ({cartItems.length})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
            className="h-10 w-10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 w-full bg-gray-50 border py-3 rounded-lg relative"
                >
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>

                  <Image
                    height={64}
                    width={64}
                    src={item.url || '/placeholder.svg'}
                    alt={item.name}
                    className="object-cover border rounded-md"
                  />
                  <div className="flex-1">
                    <div>
                      <h3 className="font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      {item.discount > 0 && (
                        <span className="text-xs text-slate-600 font-medium">
                          size - {item.size}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-5">
                      <p className="font-semibold text-lg">
                        ৳{Math.round(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center space-x-2 mr-3 border-2 rounded border-gray-300">
                        <button
                          className=" hover:bg-gray-100 transition-colors border-r-2 px-2 border-gray-300"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="w-7 h-7 p-2" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className=" hover:bg-gray-100 transition-colors border-l-2 px-2 border-gray-300"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="w-7 h-7 p-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-[#0d234b]">৳{Math.round(getTotalPrice())}</span>
          </div>
          <Button
            onClick={() => {
              router.push('/checkout')
              setIsCartOpen(false)
            }}
            disabled={cartItems.length === 0}
            className="w-full group relative px-8 py-4 bg-[#0d234b] hover:bg-[#0d234b] text-white rounded font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-[fade-up_0.8s_ease-out_1.2s_both]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span>Checkout</span>
          </Button>
        </div>
      </div>
    </>
  )
}
