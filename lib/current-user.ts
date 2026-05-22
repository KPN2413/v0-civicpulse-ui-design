import { currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/generated/prisma/enums"

export async function getCurrentDbUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!primaryEmail) {
    throw new Error("Authenticated user does not have an email address")
  }

  const metadataRole = clerkUser.publicMetadata?.role

  const role =
    typeof metadataRole === "string" &&
    Object.values(UserRole).includes(metadataRole as UserRole)
      ? (metadataRole as UserRole)
      : UserRole.CITIZEN

  const name =
    clerkUser.fullName ||
    clerkUser.firstName ||
    clerkUser.username ||
    primaryEmail.split("@")[0]

  return prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },
    update: {
      email: primaryEmail,
      name,
      role,
    },
    create: {
      clerkId: clerkUser.id,
      email: primaryEmail,
      name,
      role,
    },
  })
}