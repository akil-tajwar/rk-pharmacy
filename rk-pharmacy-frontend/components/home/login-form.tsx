"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, User, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { signIn } from "@/utils/api"

export type UserType = {
  userId: number
  username: string
  email: string
  fullName?: string
  roleId?: number
  // ...extend as needed
}

type SignInProps = {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: UserType) => void
  onSwitchToRegister: () => void
}

export default function SignIn({
  isOpen,
  onClose,
  onLogin,
  onSwitchToRegister,
}: SignInProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    try {
      const response = await signIn({ username, password })
      console.log("🚀 ~ handleSubmit ~ response:", response.data)

      const token = response?.data?.data?.token
      const user = response?.data?.data?.user

      if (!token || !user) {
        setError("Invalid credentials")
        toast({
          title: "Error",
          description: "Wrong username/password. Please contact Administrator",
          variant: "destructive", // ❌ error toast
        })
      } else {
        const typedUser: UserType = user as UserType
        localStorage.setItem("authToken", token)
        localStorage.setItem("currentUser", JSON.stringify(typedUser))

        toast({
          title: "Success",
          description: `Welcome back, ${typedUser.username || typedUser.username}!`,
          variant: "default", // ✅ success toast
        })

        onLogin(typedUser)
        onClose()
        router.push("/")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      const msg =
        typeof err === "string"
          ? err
          : typeof err?.message === "string"
          ? err.message
          : "An unexpected error occurred"
      setError(msg)
      toast({
        title: "Error",
        description: String(msg),
        variant: "destructive", // ❌ error toast
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
