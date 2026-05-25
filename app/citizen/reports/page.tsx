import { redirect } from "next/navigation"

import { CitizenReportsClient, type CitizenReportRow } from "./reports-client"
import { getCurrentDbUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import { getSlaDisplay } from "@/lib/sla"
import {
  IssueCategory,
  ReportPriority,
  ReportStatus,
} from "@/lib/generated/prisma/enums"

export const dynamic = "force-dynamic"

function statusToUi(status: ReportStatus): CitizenReportRow["status"] {
  if (status === ReportStatus.VERIFIED) return "verified"
  if (status === ReportStatus.ASSIGNED) return "assigned"
  if (status === ReportStatus.IN_PROGRESS) return "in-progress"
  if (status === ReportStatus.RESOLVED) return "resolved"
  if (status === ReportStatus.REJECTED) return "rejected"
  return "pending"
}

function priorityToUi(priority: ReportPriority): CitizenReportRow["priority"] {
  return priority.toLowerCase() as CitizenReportRow["priority"]
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

export default async function MyReportsPage() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    redirect("/sign-in")
  }

  const reports = await prisma.report.findMany({
    where: {
      citizenId: dbUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      department: true,
    },
  })

  const reportRows: CitizenReportRow[] = reports.map((report) => {
    const sla = getSlaDisplay({
      status: report.status,
      slaDueAt: report.slaDueAt,
    })

    return {
      id: report.id,
      title: report.title,
      description: report.description,
      category: categoryToLabel(report.category),
      location: report.address ?? "Location not provided",
      status: statusToUi(report.status),
      priority: priorityToUi(report.priority),
      createdAt: report.createdAt.toISOString(),
      slaDueAt: sla.dueAt?.toISOString() ?? null,
      slaState: sla.state,
      slaLabel: sla.label,
      slaTimeText: sla.timeText,
      department: report.department?.name ?? "Not assigned",
    }
  })

  return <CitizenReportsClient reports={reportRows} />
}
