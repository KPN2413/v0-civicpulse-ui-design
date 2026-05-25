"use server"

import { revalidatePath } from "next/cache"

import { getCurrentDbUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import {
  DepartmentStatus,
  ReportStatus,
  UserRole,
} from "@/lib/generated/prisma/enums"

const FINAL_STATUSES = new Set<ReportStatus>([
  ReportStatus.REJECTED,
  ReportStatus.RESOLVED,
])

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key)

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required`)
  }

  return value.trim()
}

async function getWorkflowUser() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    throw new Error("You must be signed in to update a report")
  }

  if (dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Only admins can update report workflow status")
  }

  return dbUser
}

function revalidateReportPaths(reportId: string) {
  revalidatePath("/admin/reports")
  revalidatePath(`/admin/reports/${reportId}`)
  revalidatePath("/super-admin/reports")
  revalidatePath(`/super-admin/reports/${reportId}`)
}

export async function verifyReportAction(formData: FormData): Promise<void> {
  const reportId = getRequiredFormString(formData, "reportId")
  const user = await getWorkflowUser()

  await prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!report) {
      throw new Error("Report not found")
    }

    if (
      report.status !== ReportStatus.SUBMITTED &&
      report.status !== ReportStatus.REOPENED
    ) {
      throw new Error("Only submitted or reopened reports can be verified")
    }

    await tx.report.update({
      where: {
        id: report.id,
      },
      data: {
        status: ReportStatus.VERIFIED,
      },
    })

    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        oldStatus: report.status,
        newStatus: ReportStatus.VERIFIED,
        note: "Report verified by admin.",
      },
    })

    await tx.auditLog.create({
      data: {
        action: "REPORT_VERIFIED",
        entity: "Report",
        entityId: report.id,
        userId: user.id,
        reportId: report.id,
        details: {
          previousStatus: report.status,
          newStatus: ReportStatus.VERIFIED,
        },
      },
    })
  })

  revalidateReportPaths(reportId)
}

export async function assignDepartmentAction(formData: FormData): Promise<void> {
  const reportId = getRequiredFormString(formData, "reportId")
  const departmentId = getRequiredFormString(formData, "departmentId")
  const user = await getWorkflowUser()

  await prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        departmentId: true,
        firstAssignedAt: true,
        status: true,
      },
    })

    if (!report) {
      throw new Error("Report not found")
    }

    if (FINAL_STATUSES.has(report.status)) {
      throw new Error("Final reports cannot be assigned or reassigned")
    }

    const department = await tx.department.findFirst({
      where: {
        id: departmentId,
        status: DepartmentStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
      },
    })

    if (!department) {
      throw new Error("Active department not found")
    }

    const nextStatus =
      report.status === ReportStatus.SUBMITTED ||
      report.status === ReportStatus.VERIFIED ||
      report.status === ReportStatus.REOPENED
        ? ReportStatus.ASSIGNED
        : report.status

    const isReassignment = Boolean(report.departmentId)
    const firstAssignedAt = new Date()

    await tx.report.update({
      where: {
        id: report.id,
      },
      data: {
        departmentId: department.id,
        status: nextStatus,
        ...(!report.firstAssignedAt && nextStatus === ReportStatus.ASSIGNED
          ? { firstAssignedAt }
          : {}),
      },
    })

    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        oldStatus: report.status,
        newStatus: nextStatus,
        note: isReassignment
          ? `Report reassigned to ${department.name}.`
          : `Report assigned to ${department.name}.`,
      },
    })

    await tx.auditLog.create({
      data: {
        action: isReassignment ? "REPORT_REASSIGNED" : "REPORT_ASSIGNED",
        entity: "Report",
        entityId: report.id,
        userId: user.id,
        reportId: report.id,
        details: {
          previousStatus: report.status,
          newStatus: nextStatus,
          previousDepartmentId: report.departmentId,
          departmentId: department.id,
          departmentName: department.name,
        },
      },
    })
  })

  revalidateReportPaths(reportId)
}

export async function rejectReportAction(formData: FormData): Promise<void> {
  const reportId = getRequiredFormString(formData, "reportId")
  const reason = getRequiredFormString(formData, "reason")
  const user = await getWorkflowUser()

  await prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!report) {
      throw new Error("Report not found")
    }

    if (FINAL_STATUSES.has(report.status)) {
      throw new Error("Final reports cannot be rejected")
    }

    await tx.report.update({
      where: {
        id: report.id,
      },
      data: {
        status: ReportStatus.REJECTED,
      },
    })

    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        oldStatus: report.status,
        newStatus: ReportStatus.REJECTED,
        note: reason,
      },
    })

    await tx.auditLog.create({
      data: {
        action: "REPORT_REJECTED",
        entity: "Report",
        entityId: report.id,
        userId: user.id,
        reportId: report.id,
        details: {
          previousStatus: report.status,
          newStatus: ReportStatus.REJECTED,
          reason,
        },
      },
    })
  })

  revalidateReportPaths(reportId)
}

export async function resolveReportAction(formData: FormData): Promise<void> {
  const reportId = getRequiredFormString(formData, "reportId")
  const user = await getWorkflowUser()
  const resolvedAt = new Date()

  await prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!report) {
      throw new Error("Report not found")
    }

    if (
      report.status !== ReportStatus.ASSIGNED &&
      report.status !== ReportStatus.IN_PROGRESS
    ) {
      throw new Error("Only assigned or in-progress reports can be resolved")
    }

    await tx.report.update({
      where: {
        id: report.id,
      },
      data: {
        status: ReportStatus.RESOLVED,
        resolvedAt,
      },
    })

    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        oldStatus: report.status,
        newStatus: ReportStatus.RESOLVED,
        note: "Report marked as resolved by admin.",
      },
    })

    await tx.auditLog.create({
      data: {
        action: "REPORT_RESOLVED",
        entity: "Report",
        entityId: report.id,
        userId: user.id,
        reportId: report.id,
        details: {
          previousStatus: report.status,
          newStatus: ReportStatus.RESOLVED,
          resolvedAt: resolvedAt.toISOString(),
        },
      },
    })
  })

  revalidateReportPaths(reportId)
}
