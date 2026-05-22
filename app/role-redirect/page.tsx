"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

type AppRole = "CITIZEN" | "DEPARTMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN"

function getDashboardPath(role?: string) {
  if (role === "SUPER_ADMIN") return "/super-admin/dashboard"
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "DEPARTMENT_OFFICER") return "/officer/dashboard"
  return "/citizen/dashboard"
}

export default function RoleRedirectPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace("/sign-in")
      return
    }

    const role = user?.publicMetadata?.role as AppRole | undefined
    router.replace(getDashboardPath(role))
  }, [isLoaded, isSignedIn, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Redirecting...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we open your CivicPulse dashboard.
        </p>
      </div>
    </div>
  )
}