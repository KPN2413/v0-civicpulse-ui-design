import { NotificationType, UserRole } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export type CreateNotificationInput = {
  userId?: string | null
  type: NotificationType
  title: string
  message: string
  href?: string | null
  reportId?: string | null
  actorId?: string | null
}

type AdminNotificationInput = Omit<CreateNotificationInput, "userId">

export function getReportNotificationHref(role: UserRole, reportId: string) {
  if (role === UserRole.SUPER_ADMIN) return `/super-admin/reports/${reportId}`
  if (role === UserRole.ADMIN) return `/admin/reports/${reportId}`
  if (role === UserRole.DEPARTMENT_OFFICER) return `/officer/reports/${reportId}`
  return `/citizen/reports/${reportId}`
}

async function getValidActorId(actorId?: string | null) {
  if (!actorId) return null

  const actor = await prisma.user.findUnique({
    where: {
      id: actorId,
    },
    select: {
      id: true,
    },
  })

  return actor?.id ?? null
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.userId) return null

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      role: true,
    },
  })

  if (!user) return null

  const actorId = await getValidActorId(input.actorId)
  const href =
    input.href ??
    (input.reportId ? getReportNotificationHref(user.role, input.reportId) : null)

  return prisma.notification.create({
    data: {
      userId: user.id,
      type: input.type,
      title: input.title,
      message: input.message,
      href,
      reportId: input.reportId ?? null,
      actorId,
    },
  })
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  const notifications = await Promise.all(inputs.map((input) => createNotification(input)))

  return notifications.filter((notification) => notification !== null)
}

export async function notifyAdmins(input: AdminNotificationInput) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      role: true,
    },
  })

  return Promise.all(
    admins.map((admin) =>
      createNotification({
        ...input,
        userId: admin.id,
        href:
          input.href ??
          (input.reportId ? getReportNotificationHref(admin.role, input.reportId) : null),
      })
    )
  )
}

export async function getUnreadNotificationCount(userId: string) {
  if (!userId) return 0

  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  })
}

export async function markNotificationRead(notificationId: string, userId: string) {
  if (!notificationId || !userId) return null

  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })
}

export async function markAllNotificationsRead(userId: string) {
  if (!userId) return null

  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })
}
