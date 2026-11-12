import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForgotPassword() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-6xl font-bold mb-4 text-center">Forgot Password</h1>
      <p className="text-2xl mb-8 text-center">Please Contact System Admin</p>
      <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black">
        <Link href="/signin">Return to Sign In</Link>
      </Button>
    </div>
  )
}