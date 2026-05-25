import { AdminReportsClient, type AdminReportRow, type AdminReportsStats } from "./reports-client"
import { categoryToLabel, priorityToUi, statusToUi } from "./report-mappers"

import { prisma } from "@/lib/prisma"
import { ReportStatus } from "@/lib/generated/prisma/enums"

export const dynamic = "force-dynamic"

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
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

  const reportRows: AdminReportRow[] = reports.map((report) => ({
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
  }))

  const stats: AdminReportsStats = {
    total: reports.length,
    pendingReview: reports.filter(
      (report) =>
        report.status === ReportStatus.SUBMITTED ||
        report.status === ReportStatus.REOPENED
    ).length,
    inProgress: reports.filter((report) => report.status === ReportStatus.IN_PROGRESS).length,
    resolved: reports.filter((report) => report.status === ReportStatus.RESOLVED).length,
  }

  return <AdminReportsClient reports={reportRows} stats={stats} />
}
