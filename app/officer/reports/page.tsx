import { notFound } from "next/navigation"

import {
  OfficerReportsClient,
  type OfficerReportRow,
  type OfficerReportsStats,
} from "./reports-client"
import { categoryToLabel, priorityToUi, statusToUi } from "@/app/admin/reports/report-mappers"

import { getCurrentDbUser } from "@/lib/current-user"
import { ReportPriority, ReportStatus, UserRole } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getSlaDisplay } from "@/lib/sla"

export const dynamic = "force-dynamic"

export default async function OfficerReportsPage() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser || dbUser.role !== UserRole.DEPARTMENT_OFFICER) {
    notFound()
  }

  const reports = await prisma.report.findMany({
    where: {
      officerId: dbUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      citizen: {
        select: {
          name: true,
          email: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      officer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const reportRows: OfficerReportRow[] = reports.map((report) => {
    const sla = getSlaDisplay({
      status: report.status,
      slaDueAt: report.slaDueAt,
    })

    return {
      id: report.id,
      title: report.title,
      category: categoryToLabel(report.category),
      status: statusToUi(report.status),
      priority: priorityToUi(report.priority),
      location: report.address ?? "Location not provided",
      citizenName: report.citizen.name ?? "Unnamed citizen",
      citizenEmail: report.citizen.email,
      departmentName: report.department?.name ?? "Unassigned",
      officerName: report.officer?.name ?? null,
      officerEmail: report.officer?.email ?? null,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString() ?? null,
      slaDueAt: sla.dueAt?.toISOString() ?? null,
      slaState: sla.state,
      slaLabel: sla.label,
      slaTimeText: sla.timeText,
    }
  })

  const stats: OfficerReportsStats = {
    open: reports.filter(
      (report) =>
        report.status !== ReportStatus.RESOLVED &&
        report.status !== ReportStatus.REJECTED
    ).length,
    inProgress: reports.filter((report) => report.status === ReportStatus.IN_PROGRESS).length,
    resolved: reports.filter((report) => report.status === ReportStatus.RESOLVED).length,
    highPriority: reports.filter(
      (report) =>
        report.priority === ReportPriority.HIGH ||
        report.priority === ReportPriority.CRITICAL
    ).length,
  }

  return <OfficerReportsClient reports={reportRows} stats={stats} />
}
