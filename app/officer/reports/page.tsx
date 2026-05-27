import { notFound } from "next/navigation"

import {
  OfficerReportsClient,
  type OfficerReportRow,
  type OfficerReportsStats,
} from "./reports-client"
import { categoryToLabel, priorityToUi, statusToUi } from "@/app/admin/reports/report-mappers"

import { getCurrentDbUser } from "@/lib/current-user"
import { UserRole } from "@/lib/generated/prisma/enums"
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

  const stats: OfficerReportsStats = {
    assigned: reportRows.length,
    overdue: reportRows.filter((report) => report.slaState === "overdue").length,
    within: reportRows.filter((report) => report.slaState === "within").length,
    resolved: reportRows.filter((report) => report.slaState === "resolved").length,
  }

  return <OfficerReportsClient reports={reportRows} stats={stats} />
}
