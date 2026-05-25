import { AdminDashboardClient } from "./dashboard-client"
import { categoryToLabel, priorityToUi, statusToUi } from "@/app/admin/reports/report-mappers"
import { ReportPriority, ReportStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getSlaDisplay } from "@/lib/sla"

export const dynamic = "force-dynamic"

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

function formatDuration(milliseconds: number) {
  const hours = Math.max(1, Math.round(milliseconds / (1000 * 60 * 60)))

  if (hours < 48) {
    return `${hours}h`
  }

  return `${Math.round(hours / 24)} days`
}

function getSlaOverview(
  reports: Array<{ status: ReportStatus; slaDueAt: Date | null }>
) {
  const states = reports.map((report) =>
    getSlaDisplay({
      status: report.status,
      slaDueAt: report.slaDueAt,
    }).state
  )

  const overdue = states.filter((state) => state === "overdue").length
  const within = states.filter((state) => state === "within").length
  const resolved = states.filter((state) => state === "resolved").length
  const denominator = states.filter((state) => state !== "not-set").length
  const compliance =
    denominator === 0 ? 0 : Math.round(((within + resolved) / denominator) * 100)

  return {
    overdue,
    within,
    resolved,
    compliance,
  }
}

export default async function AdminDashboard() {
  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      priority: true,
      address: true,
      createdAt: true,
      resolvedAt: true,
      slaDueAt: true,
    },
  })

  const slaOverview = getSlaOverview(reports)
  const resolvedDurations = reports
    .filter((report) => report.resolvedAt)
    .map((report) => report.resolvedAt!.getTime() - report.createdAt.getTime())

  const averageResolution =
    resolvedDurations.length === 0
      ? "No data"
      : formatDuration(
          resolvedDurations.reduce((total, duration) => total + duration, 0) /
            resolvedDurations.length
        )

  const categoryCounts = reports.reduce((counts, report) => {
    const label = categoryToLabel(report.category)
    counts.set(label, (counts.get(label) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  const categoryData = Array.from(categoryCounts.entries()).map(
    ([category, count], index) => ({
      category,
      count,
      fill: chartColors[index % chartColors.length],
    })
  )

  const priorityData = [
    {
      name: "Critical",
      value: reports.filter((report) => report.priority === ReportPriority.CRITICAL).length,
      fill: "var(--color-destructive)",
    },
    {
      name: "High",
      value: reports.filter((report) => report.priority === ReportPriority.HIGH).length,
      fill: "var(--color-chart-3)",
    },
    {
      name: "Medium",
      value: reports.filter((report) => report.priority === ReportPriority.MEDIUM).length,
      fill: "var(--color-warning)",
    },
    {
      name: "Low",
      value: reports.filter((report) => report.priority === ReportPriority.LOW).length,
      fill: "var(--color-muted-foreground)",
    },
  ]

  const highPriorityReports = reports
    .filter(
      (report) =>
        report.priority === ReportPriority.CRITICAL ||
        report.priority === ReportPriority.HIGH
    )
    .slice(0, 8)
    .map((report) => ({
      id: report.id,
      title: report.title,
      category: categoryToLabel(report.category),
      status: statusToUi(report.status),
      priority: priorityToUi(report.priority),
      location: report.address ?? "Location not provided",
      createdAt: report.createdAt.toISOString(),
    }))

  return (
    <AdminDashboardClient
      stats={{
        total: reports.length,
        overdue: slaOverview.overdue,
        within: slaOverview.within,
        resolved: slaOverview.resolved,
        compliance: slaOverview.compliance,
        averageResolution,
      }}
      categoryData={categoryData}
      priorityData={priorityData}
      highPriorityReports={highPriorityReports}
    />
  )
}
