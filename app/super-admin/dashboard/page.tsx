import {
  AlertTriangle,
  Activity,
  Building2,
  CheckCircle,
  ClipboardList,
  Clock,
  MapPin,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/dashboard/stat-card"
import { mockDepartments, mockAuditLogs } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ReportStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getSlaDisplay } from "@/lib/sla"

export const dynamic = "force-dynamic"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const actionColors: Record<string, string> = {
  "Report Created": "bg-primary/10 text-primary",
  "Status Updated": "bg-accent/10 text-accent",
  "Priority Changed": "bg-warning/10 text-warning",
  "Report Resolved": "bg-accent/10 text-accent",
  "Report Rejected": "bg-destructive/10 text-destructive",
  "Department Updated": "bg-chart-5/10 text-chart-5",
  "User Created": "bg-primary/10 text-primary",
  "SLA Breach Alert": "bg-destructive/10 text-destructive",
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

export default async function SuperAdminDashboard() {
  const [totalUsers, totalDepartments, reports] = await Promise.all([
    prisma.user.count(),
    prisma.department.count(),
    prisma.report.findMany({
      select: {
        status: true,
        slaDueAt: true,
      },
    }),
  ])

  const slaOverview = getSlaOverview(reports)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">System Overview</h2>
        <p className="text-muted-foreground">
          Monitor all departments, users, and system-wide metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          description="Citizens & Officers"
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Departments"
          value={totalDepartments}
          description="Active departments"
          icon={Building2}
          variant="accent"
        />
        <StatCard
          title="Total Reports"
          value={reports.length}
          description="All time"
          icon={ClipboardList}
        />
        <StatCard
          title="SLA Compliance"
          value={`${slaOverview.compliance}%`}
          description="Resolved or on time"
          icon={Percent}
          variant="warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
          description="Successfully closed"
          icon={CheckCircle}
          variant="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Department Performance
            </CardTitle>
            <CardDescription>Resolution rate and efficiency metrics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Head</TableHead>
                  <TableHead>Resolution Rate</TableHead>
                  <TableHead className="hidden lg:table-cell">Avg. Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDepartments.map((dept) => {
                  const resolutionRate = Math.round((dept.resolvedReports / dept.totalReports) * 100)
                  return (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {dept.head}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={resolutionRate} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{resolutionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {dept.averageResolutionTime}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              City Issue Heatmap
            </CardTitle>
            <CardDescription>Geographic distribution of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Interactive Heatmap
                </p>
                <p className="text-xs text-muted-foreground">
                  Map integration will be added here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Audit Activity Feed
          </CardTitle>
          <CardDescription>Recent system activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {mockAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-3"
                >
                  <Badge
                    variant="outline"
                    className={actionColors[log.action] || "bg-muted text-muted-foreground"}
                  >
                    {log.action}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{log.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>By: {log.performedBy}</span>
                      <span>
                        {formatDate(log.performedAt)} at {formatTime(log.performedAt)}
                      </span>
                      <span className="font-mono">{log.targetId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
