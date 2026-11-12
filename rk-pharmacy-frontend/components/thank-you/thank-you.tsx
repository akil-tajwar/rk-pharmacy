'use client'

import React from 'react'
import {
  ShoppingCart,
  Sparkles,
  Check,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const ThankYou = () => {
  const router = useRouter()
  return (
    <div className="flex items-center justify-center h-[82vh]">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Success Icon */}
        <div className="relative inline-block mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-400/20 to-gray-400/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-28 h-28 rounded-full bg-gradient-to-r from-gray-400/30 to-gray-400/30 animate-pulse"
              style={{ animationDuration: '1.5s' }}
            />
          </div>

          {/* Main icon container */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-50 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border border-gray-200/50 animate-[scale-in_0.6s_ease-out]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400/0 to-gray-400/20 animate-[spin_3s_linear_infinite]" />
            <Check
              className="w-12 h-12 text-green-600 relative z-10 animate-[check-draw_0.8s_ease-out_0.3s_both]"
              strokeWidth={3}
            />
          </div>

          {/* Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 animate-[sparkle_1s_ease-in-out_0.5s_both]" />
          <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-400 animate-[sparkle_1s_ease-in-out_0.7s_both]" />
          <Sparkles className="absolute top-0 -left-4 w-4 h-4 text-sky-400 animate-[sparkle_1s_ease-in-out_0.9s_both]" />
        </div>

        {/* Thank you text */}
        <h2 className="text-5xl font-bold mb-4 animate-[fade-up_0.8s_ease-out_0.4s_both]">
          <span className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 bg-clip-text text-transparent">
            Thank You
          </span>
        </h2>

        <p className="text-xl text-gray-700 mb-3 font-light animate-[fade-up_0.8s_ease-out_0.6s_both]">
          for choosing us
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-[fade-up_0.8s_ease-out_0.8s_both]">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
        </div>

        <p className="text-gray-600 mb-10 leading-relaxed max-w-md mx-auto animate-[fade-up_0.8s_ease-out_1s_both]">
          We appreciate your trust in our service. Your satisfaction is our
          priority, and we look forward to serving you again.
        </p>

        {/* Continue Shopping Button */}
        <button
          onClick={() => router.push('/')}
          className="group relative px-8 py-4 bg-[#0d234b] hover:bg-[#0d234b] text-white text-lg rounded font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-[fade-up_0.8s_ease-out_1.2s_both]"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <span className="relative flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Continue Shopping
          </span>
        </button>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-gray-300/40 animate-[float_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-gray-300/40 animate-[float_5s_ease-in-out_1s_infinite]" />
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-sky-300/30 animate-[float_6s_ease-in-out_2s_infinite]" />
        </div>

        <style jsx>{`
          @keyframes scale-in {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes check-draw {
            0% {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              stroke-dasharray: 100;
              stroke-dashoffset: 0;
              opacity: 1;
            }
          }

          @keyframes sparkle {
            0%,
            100% {
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            50% {
              transform: scale(1) rotate(180deg);
              opacity: 1;
            }
          }

          @keyframes fade-up {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0) translateX(0);
            }
            33% {
              transform: translateY(-20px) translateX(10px);
            }
            66% {
              transform: translateY(-10px) translateX(-10px);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default ThankYou
