"use client"

import { useUser } from "@clerk/nextjs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()

  const userName = isLoaded
    ? user?.fullName ||
      user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      "Super Admin User"
    : "Loading..."

  const userEmail = isLoaded
    ? user?.primaryEmailAddress?.emailAddress || "No email available"
    : "Loading..."

  return (
    <SidebarProvider>
      <AppSidebar
        userRole="super-admin"
        userName={userName}
        userEmail={userEmail}
      />

      <SidebarInset>
        <DashboardHeader title="Super Admin Console" />
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}