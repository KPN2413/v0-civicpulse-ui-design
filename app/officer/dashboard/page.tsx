import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Eye,
  MapPin,
  Percent,
} from "lucide-react"

import { categoryToLabel, priorityToUi, statusToUi } from "@/app/admin/reports/report-mappers"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentDbUser } from "@/lib/current-user"
import { UserRole, type ReportStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getSlaBadgeClassName, getSlaDisplay } from "@/lib/sla"

export const dynamic = "force-dynamic"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
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

export default async function OfficerDashboard() {
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
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      priority: true,
      address: true,
      createdAt: true,
      slaDueAt: true,
    },
  })

  const slaOverview = getSlaOverview(reports)
  const visibleReports = reports.slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome, {dbUser.name ?? "Officer"}!
        </h2>
        <p className="text-muted-foreground">
          Here are your assigned reports and their current SLA position.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Assigned Reports"
          value={reports.length}
          description="Assigned to you"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="Overdue Reports"
          value={slaOverview.overdue}
          description="Past SLA due date"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Within SLA"
          value={slaOverview.within}
          description="Active and on time"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Resolved Reports"
          value={slaOverview.resolved}
          description="Completed assignments"
          icon={CheckCircle}
          variant="accent"
        />
        <StatCard
          title="SLA Compliance"
          value={`${slaOverview.compliance}%`}
          description="Resolved or on time"
          icon={Percent}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assigned Issues
          </CardTitle>
          <CardDescription>Recent reports assigned to you for resolution</CardDescription>
        </CardHeader>
        <CardContent>
          {visibleReports.length > 0 ? (
            <div className="space-y-4">
              {visibleReports.map((report) => {
                const sla = getSlaDisplay({
                  status: report.status,
                  slaDueAt: report.slaDueAt,
                })

                return (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-primary">{report.id}</span>
                        <StatusBadge status={statusToUi(report.status)} />
                        <PriorityBadge priority={priorityToUi(report.priority)} />
                        <Badge
                          variant="outline"
                          className={getSlaBadgeClassName(sla.state)}
                        >
                          {sla.label}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{report.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.address ?? "Location not provided"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.createdAt)} at {formatTime(report.createdAt)}
                        </span>
                        <span>{categoryToLabel(report.category)}</span>
                        <span>{sla.timeText}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" asChild>
                      <Link href={`/officer/reports/${report.id}`}>
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No assigned reports yet
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Reports assigned to your officer account will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
