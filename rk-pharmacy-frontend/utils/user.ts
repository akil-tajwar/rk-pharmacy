'use client'

import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GetUsersType } from './type'


// Atom for full user data
export const userDataAtom = atom<GetUsersType | null>(null)
export const tokenAtom = atom<string>('')
export const isUserLoadingAtom = atom(true)

// Hook to initialize user from localStorage
export const useInitializeUser = () => {
  const setUserData = useSetAtom(userDataAtom)
  const setToken = useSetAtom(tokenAtom)
  const setIsLoading = useSetAtom(isUserLoadingAtom)
  const router = useRouter()

  useEffect(() => {
    const loadUser = () => {
      try {
        setIsLoading(true)
        const mainToken =  localStorage.getItem('authToken')
        if (mainToken) {
          setToken(`Bearer ${mainToken}`)
        } else {
          setToken('')
        }
        console.log('maintoken:asdasasdasdasdd ',mainToken)

        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const parsedUser = JSON.parse(userStr)
          if (parsedUser) {
            setUserData(parsedUser)
          } else {
            setUserData(null)
          }
        } else {
          setUserData(null)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setUserData(null)
        setToken('')
      } finally {
        setIsLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      loadUser()
    }
  }, [setUserData, setToken, setIsLoading, router])
}
