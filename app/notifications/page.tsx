import Link from "next/link"
import { redirect } from "next/navigation"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Inbox,
} from "lucide-react"

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./actions"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentDbUser } from "@/lib/current-user"
import { NotificationType } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const notificationTypeLabels: Record<NotificationType, string> = {
  REPORT_SUBMITTED: "Report submitted",
  REPORT_VERIFIED: "Report verified",
  REPORT_ASSIGNED: "Report assigned",
  REPORT_REASSIGNED: "Report reassigned",
  REPORT_REJECTED: "Report rejected",
  REPORT_RESOLVED: "Report resolved",
  REPORT_EVIDENCE_ADDED: "Evidence added",
  SLA_WARNING: "SLA warning",
  SLA_OVERDUE: "SLA overdue",
  SYSTEM: "System",
}

const notificationTypeClasses: Record<NotificationType, string> = {
  REPORT_SUBMITTED: "border-primary/20 bg-primary/10 text-primary",
  REPORT_VERIFIED: "border-primary/20 bg-primary/10 text-primary",
  REPORT_ASSIGNED: "border-chart-5/20 bg-chart-5/10 text-chart-5",
  REPORT_REASSIGNED: "border-chart-5/20 bg-chart-5/10 text-chart-5",
  REPORT_REJECTED: "border-destructive/20 bg-destructive/10 text-destructive",
  REPORT_RESOLVED: "border-accent/20 bg-accent/10 text-accent",
  REPORT_EVIDENCE_ADDED: "border-primary/20 bg-primary/10 text-primary",
  SLA_WARNING: "border-warning/20 bg-warning/10 text-warning",
  SLA_OVERDUE: "border-destructive/20 bg-destructive/10 text-destructive",
  SYSTEM: "border-border bg-muted text-muted-foreground",
}

function getNotificationIcon(type: NotificationType) {
  if (type === NotificationType.REPORT_RESOLVED) return CheckCircle
  if (type === NotificationType.REPORT_REJECTED) return AlertTriangle
  if (type === NotificationType.SLA_WARNING || type === NotificationType.SLA_OVERDUE) {
    return Clock
  }
  if (type === NotificationType.REPORT_ASSIGNED || type === NotificationType.REPORT_REASSIGNED) {
    return Inbox
  }

  return FileText
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function NotificationsPage() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    redirect("/sign-in")
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h2>
          <p className="text-muted-foreground">
            View report updates, assignment alerts, and activity for your account.
          </p>
        </div>

        {unreadCount > 0 ? (
          <form action={markAllNotificationsAsRead}>
            <Button type="submit" variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              Mark all as read
            </Button>
          </form>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {notifications.length - unreadCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[260px] items-center justify-center p-8 text-center">
            <div>
              <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No notifications yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Report activity and system updates will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const isUnread = !notification.readAt

            return (
              <Card
                key={notification.id}
                className={cn(isUnread ? "border-primary/30 bg-primary/5" : undefined)}
              >
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      {isUnread ? <Badge>Unread</Badge> : <Badge variant="outline">Read</Badge>}
                      <Badge
                        variant="outline"
                        className={notificationTypeClasses[notification.type]}
                      >
                        {notificationTypeLabels[notification.type]}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDateTime(notification.createdAt)}</span>
                      {notification.actor ? (
                        <span>
                          By {notification.actor.name ?? notification.actor.email ?? "System"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                    {notification.href ? (
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={notification.href}>
                          Open
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}

                    {isUnread ? (
                      <form action={markNotificationAsRead.bind(null, notification.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Mark as read
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
