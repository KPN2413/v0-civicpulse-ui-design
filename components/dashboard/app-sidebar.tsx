"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  Building2,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  BarChart3,
  Shield,
  Settings,
  PlusCircle,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

type AppSidebarProps = {
  userRole: "citizen" | "admin" | "officer" | "super-admin"
  userName: string
  userEmail: string
}

const citizenNavItems: NavItem[] = [
  { title: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
  { title: "Report Issue", href: "/citizen/report", icon: PlusCircle },
  { title: "My Reports", href: "/citizen/reports", icon: FileText },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
]

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "All Reports", href: "/admin/reports", icon: ClipboardList },
  { title: "Departments", href: "/admin/departments", icon: Users },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
]

const officerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
  { title: "Assigned Reports", href: "/officer/reports", icon: ClipboardList },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
]

const superAdminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/super-admin/users", icon: Users },
  { title: "All Reports", href: "/super-admin/reports", icon: ClipboardList },
  { title: "Departments", href: "/super-admin/departments", icon: Building2 },
  { title: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
  { title: "Audit Logs", href: "/super-admin/audit-logs", icon: Shield },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
]

const navItemsByRole = {
  citizen: citizenNavItems,
  admin: adminNavItems,
  officer: officerNavItems,
  "super-admin": superAdminNavItems,
}

export function AppSidebar({ userRole, userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname()
  const navItems = navItemsByRole[userRole]

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              CivicPulse
            </span>
            <span className="text-xs text-sidebar-foreground/60 capitalize">
              {userRole.replace("-", " ")}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {userName}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {userEmail}
            </span>
          </div>
        </div>

        <SignOutButton redirectUrl="/sign-in">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </SignOutButton>
      </SidebarFooter>
    </Sidebar>
  )
}