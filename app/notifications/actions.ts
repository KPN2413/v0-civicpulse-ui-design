"use server"

import { revalidatePath } from "next/cache"

import { getCurrentDbUser } from "@/lib/current-user"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications"

export async function markNotificationAsRead(notificationId: string) {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    throw new Error("You must be signed in to update notifications.")
  }

  await markNotificationRead(notificationId, dbUser.id)
  revalidatePath("/notifications")
}

export async function markAllNotificationsAsRead() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    throw new Error("You must be signed in to update notifications.")
  }

  await markAllNotificationsRead(dbUser.id)
  revalidatePath("/notifications")
}
