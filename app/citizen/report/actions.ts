"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentDbUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import {
  IssueCategory,
  ReportPriority,
  ReportStatus,
} from "@/lib/generated/prisma/enums"

const reportSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(1000),
  category: z.string().trim().min(1),
  address: z.string().trim().min(5).max(300),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

const categoryMap: Record<string, IssueCategory> = {
  "road-damage": IssueCategory.ROAD_DAMAGE,
  "garbage-overflow": IssueCategory.GARBAGE_OVERFLOW,
  "street-light-failure": IssueCategory.STREET_LIGHT,
  "water-leakage": IssueCategory.WATER_LEAKAGE,
  "drainage-problem": IssueCategory.DRAINAGE,
  "public-safety": IssueCategory.PUBLIC_SAFETY,
  other: IssueCategory.OTHER,
}

const departmentMap: Record<IssueCategory, string> = {
  ROAD_DAMAGE: "Roads & Infrastructure",
  GARBAGE_OVERFLOW: "Sanitation",
  STREET_LIGHT: "Street Lighting",
  WATER_LEAKAGE: "Water Supply",
  DRAINAGE: "Drainage",
  PUBLIC_SAFETY: "Public Safety",
  OTHER: "General Administration",
}

function getPriority(category: IssueCategory): ReportPriority {
  if (category === IssueCategory.PUBLIC_SAFETY) return ReportPriority.HIGH
  if (category === IssueCategory.WATER_LEAKAGE) return ReportPriority.MEDIUM
  if (category === IssueCategory.DRAINAGE) return ReportPriority.MEDIUM
  return ReportPriority.LOW
}

function getSlaDueAt(createdAt: Date, priority: ReportPriority) {
  const hoursByPriority: Record<ReportPriority, number> = {
    LOW: 24 * 7,
    MEDIUM: 24 * 3,
    HIGH: 24,
    CRITICAL: 24,
  }

  return new Date(createdAt.getTime() + hoursByPriority[priority] * 60 * 60 * 1000)
}

export async function createReportAction(formData: FormData) {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    return { success: false, error: "You must be signed in to submit a report." }
  }

  const parsed = reportSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    address: formData.get("address"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  })

  if (!parsed.success) {
    return { success: false, error: "Please fill all required report details correctly." }
  }

  const category = categoryMap[parsed.data.category]

  if (!category) {
    return { success: false, error: "Invalid report category." }
  }

  const priority = getPriority(category)
  const createdAt = new Date()
  const slaDueAt = getSlaDueAt(createdAt, priority)

  const department = await prisma.department.findFirst({
    where: {
      name: departmentMap[category],
      status: "ACTIVE",
    },
  })

  try {
    const report = await prisma.report.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category,
        priority,
        status: ReportStatus.SUBMITTED,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        address: parsed.data.address,
        createdAt,
        slaDueAt,
        citizenId: dbUser.id,
        departmentId: department?.id,
        statusHistory: {
          create: {
            newStatus: ReportStatus.SUBMITTED,
            note: "Report submitted by citizen.",
          },
        },
        auditLogs: {
          create: {
            action: "REPORT_CREATED",
            entity: "Report",
            entityId: "pending",
            userId: dbUser.id,
            details: {
              source: "citizen_portal",
            },
          },
        },
      },
    })

    await prisma.auditLog.updateMany({
      where: {
        reportId: report.id,
        entityId: "pending",
      },
      data: {
        entityId: report.id,
      },
    })

    revalidatePath("/citizen/reports")
    revalidatePath("/admin/reports")
    revalidatePath("/officer/reports")

    return { success: true, error: null, reportId: report.id }
  } catch {
    return { success: false, error: "Failed to submit report." }
  }
}
