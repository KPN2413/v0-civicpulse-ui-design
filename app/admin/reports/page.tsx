import { AdminReportsClient, type AdminReportRow, type AdminReportsStats } from "./reports-client"
import { categoryToLabel, priorityToUi, statusToUi } from "./report-mappers"

import { prisma } from "@/lib/prisma"
import { getSlaDisplay } from "@/lib/sla"

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

  const reportRows: AdminReportRow[] = reports.map((report) => {
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
      address: report.address,
      latitude: report.latitude,
      longitude: report.longitude,
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

  const stats: AdminReportsStats = {
    total: reportRows.length,
    overdue: reportRows.filter((report) => report.slaState === "overdue").length,
    within: reportRows.filter((report) => report.slaState === "within").length,
    resolved: reportRows.filter((report) => report.slaState === "resolved").length,
  }

  return <AdminReportsClient reports={reportRows} stats={stats} />
}
