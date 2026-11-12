'use client'

import { FaFacebookF, FaWhatsapp, FaTiktok, FaInstagram } from 'react-icons/fa'
import { FaThreads } from 'react-icons/fa6'
import { CiYoutube } from 'react-icons/ci'
import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const phone = '+8801703133275'
  const [copied, setCopied] = useState(false)
  return (
    <footer className="bg-[#071327] text-white mt-12 sm:mt-16">
      <div className="lg:w-4/5 mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-400">
              Your trusted online store for quality fashion and kids clothing.
            </p>
            <div className="flex gap-3 items-center mt-6">
              <Link href="https://wa.me/+8801703133275" target="_blank">
                <FaWhatsapp className="w-7 h-7 text-white p-1 rounded-lg border border-[#25D366] bg-[#25D366]" />
              </Link>
              <Link
                href="https://www.facebook.com/benignfashion"
                target="_blank"
              >
                <FaFacebookF className="w-7 h-7 text-white p-1 rounded-lg border border-[#1877F2] bg-[#1877F2]" />
              </Link>

              <Link
                href="https://www.instagram.com/benignfashion25/?hl=en"
                target="_blank"
              >
                <FaInstagram
                  className=" w-7 h-7 p-1 rounded-lg text-white bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]
  "
                />
              </Link>

              <Link
                href="https://www.threads.com/@benignfashion25?hl=en"
                target="_blank"
              >
                <FaThreads className="w-7 h-7 text-white p-1 rounded-lg border border-black bg-black" />
              </Link>

              <Link
                href="https://www.youtube.com/@benignfashion"
                target="_blank"
              >
                <CiYoutube className="w-7 h-7 text-white p-1 rounded-lg border border-[#FF0000] bg-[#FF0000]" />
              </Link>

              <Link
                href="https://www.tiktok.com/@benign.fashion?is_from_webapp=1&sender_device=pc"
                target="_blank"
              >
                <FaTiktok className="w-7 h-7 text-white p-1 rounded-lg border border-[#010101] bg-[#010101]" />
              </Link>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: benignfashion@gmail.com</li>
              <li className="flex items-center gap-2">
                Phone: <span>{phone}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(phone)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className={`
      relative overflow-hidden text-xs px-1 rounded-md font-medium
      w-[75px] flex items-center justify-center
      transition-all duration-500 ease-out
      ${
        copied
          ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.8),0_0_40px_rgba(34,197,94,0.4)] border-2 border-green-300'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600 hover:border-gray-500 hover:shadow-lg'
      }
    `}
                >
                  <span
                    className={`relative z-10 flex items-center gap-1 ${copied ? 'animate-bounce' : ''}`}
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      'Copy'
                    )}
                  </span>
                  {copied && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[shimmer_0.5s_ease-in-out]" />
                  )}
                </button>
              </li>

              <li>
                Outlet-1: Shop no #423,Level 4,Finlay South City, Bahaddarhat
                Circle,Chattagram.
              </li>
              <li>
                Outlet-2: Shop #417-418 (4th Floor) Kohinoor City, Dampara,
                Chattogram
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-10 text-center text-gray-400">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Benign Fashion. All rights
            reserved.
          </p>
          <div className="text-xs text-gray-500">
            site by:{' '}
            <Link
              target="_blank"
              href={'https://akiltajwarchowdhury.netlify.app/'}
              className="text-green-700 hover:text-green-600"
            >
              Akil Tajwar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
