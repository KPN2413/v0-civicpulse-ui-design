"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getCurrentDbUser } from "@/lib/current-user"
import { uploadReportEvidenceImage } from "@/lib/cloudinary"
import { createNotification, notifyAdmins } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { findPotentialDuplicateReports } from "@/lib/report-duplicates"
import {
  IssueCategory,
  NotificationType,
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

const MAX_EVIDENCE_FILES = 3
const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024
const acceptedEvidenceTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

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

function getEvidenceFiles(formData: FormData) {
  return formData
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function validateEvidenceFiles(files: File[]) {
  if (files.length > MAX_EVIDENCE_FILES) {
    return `Please upload no more than ${MAX_EVIDENCE_FILES} evidence images.`
  }

  const invalidType = files.find((file) => !acceptedEvidenceTypes.has(file.type))

  if (invalidType) {
    return "Evidence uploads must be image files in JPG, PNG, WEBP, or GIF format."
  }

  const oversizedFile = files.find((file) => file.size > MAX_EVIDENCE_FILE_SIZE)

  if (oversizedFile) {
    return "Each evidence image must be 5 MB or smaller."
  }

  return null
}

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("Cloudinary is not configured")) {
    return error.message
  }

  return "Failed to upload evidence images. Please try again or submit without images."
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

  const evidenceFiles = getEvidenceFiles(formData)
  const evidenceError = validateEvidenceFiles(evidenceFiles)

  if (evidenceError) {
    return { success: false, error: evidenceError }
  }

  const department = await prisma.department.findFirst({
    where: {
      name: departmentMap[category],
      status: "ACTIVE",
    },
  })

  let uploadedEvidence: {
    file: File
    upload: Awaited<ReturnType<typeof uploadReportEvidenceImage>>
  }[] = []

  try {
    uploadedEvidence = await Promise.all(
      evidenceFiles.map(async (file) => ({
        file,
        upload: await uploadReportEvidenceImage(file),
      }))
    )
  } catch (error) {
    return { success: false, error: getUploadErrorMessage(error) }
  }

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
        attachments:
          uploadedEvidence.length > 0
            ? {
                create: uploadedEvidence.map(({ file, upload }) => ({
                  url: upload.url,
                  publicId: upload.publicId,
                  fileName: file.name || "report-evidence",
                  fileType: file.type || "image",
                  fileSize: file.size,
                })),
              }
            : undefined,
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

    try {
      await Promise.all([
        createNotification({
          userId: dbUser.id,
          type: NotificationType.REPORT_SUBMITTED,
          title: "Report submitted",
          message: "Your report has been submitted successfully.",
          reportId: report.id,
          actorId: dbUser.id,
        }),
        notifyAdmins({
          type: NotificationType.REPORT_SUBMITTED,
          title: "New report submitted",
          message: "A new citizen report needs review.",
          reportId: report.id,
          actorId: dbUser.id,
        }),
      ])

      if (uploadedEvidence.length > 0) {
        await notifyAdmins({
          type: NotificationType.REPORT_EVIDENCE_ADDED,
          title: "Evidence attached",
          message: "A report includes supporting evidence.",
          reportId: report.id,
          actorId: dbUser.id,
        })
      }
    } catch (error) {
      console.error("Failed to create report notifications", error)
    }

    revalidatePath("/citizen/reports")
    revalidatePath(`/citizen/reports/${report.id}`)
    revalidatePath("/admin/reports")
    revalidatePath("/officer/reports")
    revalidatePath("/notifications")

    return { success: true, error: null, reportId: report.id }
  } catch {
    return { success: false, error: "Failed to submit report." }
  }
}
