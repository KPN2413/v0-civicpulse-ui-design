import { redirect } from "next/navigation"

import { getCurrentDbUser } from "@/lib/current-user"
import { UserRole } from "@/lib/generated/prisma/enums"

function getDashboardPath(role: UserRole) {
  if (role === UserRole.SUPER_ADMIN) return "/super-admin/dashboard"
  if (role === UserRole.ADMIN) return "/admin/dashboard"
  if (role === UserRole.DEPARTMENT_OFFICER) return "/officer/dashboard"
  return "/citizen/dashboard"
}

export default async function RoleRedirectPage() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    redirect("/sign-in")
  }

  redirect(getDashboardPath(dbUser.role))
}