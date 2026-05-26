"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentDbUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import { findPotentialDuplicateReports } from "@/lib/report-duplicates"
import {
  IssueCategory,
  ReportPriority,
  ReportStatus,
} from "@/lib/generated/prisma/enums"

type UiReportStatus =
  | "pending"
  | "verified"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "rejected"

type DuplicateWarningReport = {
  title: string
  category: string
  status: UiReportStatus
  classification: "LIKELY_DUPLICATE" | "POSSIBLE_DUPLICATE" | "UNLIKELY_DUPLICATE"
  score: number
  distanceMeters: number
  reasons: string[]
}

const coordinateSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => Number(value))
  .pipe(z.number().finite())

const reportSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(1000),
  category: z.string().trim().min(1),
  address: z.string().trim().min(5).max(300),
  latitude: coordinateSchema.pipe(z.number().min(-90).max(90)),
  longitude: coordinateSchema.pipe(z.number().min(-180).max(180)),
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

function categoryToLabel(category: IssueCategory) {
  const labels: Record<IssueCategory, string> = {
    ROAD_DAMAGE: "Road Damage",
    GARBAGE_OVERFLOW: "Garbage Overflow",
    STREET_LIGHT: "Street Light",
    WATER_LEAKAGE: "Water Leakage",
    DRAINAGE: "Drainage",
    PUBLIC_SAFETY: "Public Safety",
    OTHER: "Other",
  }

  return labels[category]
}

function statusToUi(status: ReportStatus): UiReportStatus {
  if (status === ReportStatus.VERIFIED) return "verified"
  if (status === ReportStatus.ASSIGNED) return "assigned"
  if (status === ReportStatus.IN_PROGRESS) return "in-progress"
  if (status === ReportStatus.RESOLVED) return "resolved"
  if (status === ReportStatus.REJECTED) return "rejected"
  return "pending"
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
  const confirmDuplicate = formData.get("confirmDuplicate") === "true"

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
    const fieldErrors = parsed.error.flatten().fieldErrors

    if (fieldErrors.latitude || fieldErrors.longitude) {
      return { success: false, error: "Please select the issue location on the map." }
    }

    return { success: false, error: "Please fill all required report details correctly." }
  }

  const category = categoryMap[parsed.data.category]

  if (!category) {
    return { success: false, error: "Invalid report category." }
  }

  const priority = getPriority(category)
  const createdAt = new Date()
  const slaDueAt = getSlaDueAt(createdAt, priority)

  if (!confirmDuplicate) {
    const duplicates = await findPotentialDuplicateReports(
      {
        title: parsed.data.title,
        description: parsed.data.description,
        category,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        createdAt,
      },
      {
        limit: 3,
      }
    )

    if (duplicates.length > 0) {
      return {
        success: false,
        error: null,
        duplicateWarning: true,
        duplicates: duplicates.map<DuplicateWarningReport>((duplicate) => ({
          title: duplicate.title,
          category: categoryToLabel(duplicate.category),
          status: statusToUi(duplicate.status),
          classification: duplicate.classification,
          score: duplicate.score,
          distanceMeters: duplicate.distanceMeters,
          reasons: duplicate.reasons,
        })),
      }
    }
  }

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
