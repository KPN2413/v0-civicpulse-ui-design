"use client"

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  MapPin,
  Percent,
  PieChart,
  Timer,
} from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart as RechartsPieChart, XAxis, YAxis } from "recharts"

import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type HighPriorityReport = {
  id: string
  title: string
  category: string
  status: "pending" | "verified" | "assigned" | "in-progress" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "critical"
  location: string
  createdAt: string
}

type AdminDashboardClientProps = {
  stats: {
    total: number
    overdue: number
    within: number
    resolved: number
    compliance: number
    averageResolution: string
  }
  categoryData: Array<{
    category: string
    count: number
    fill: string
  }>
  priorityData: Array<{
    name: string
    value: number
    fill: string
  }>
  highPriorityReports: HighPriorityReport[]
}

const categoryChartConfig = {
  count: {
    label: "Reports",
  },
} satisfies ChartConfig

const priorityChartConfig = {
  value: {
    label: "Reports",
  },
} satisfies ChartConfig

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function AdminDashboardClient({
  stats,
  categoryData,
  priorityData,
  highPriorityReports,
}: AdminDashboardClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Overview</h2>
        <p className="text-muted-foreground">
          Manage and monitor all civic issue reports across the municipality.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Reports"
          value={stats.total}
          description="All reports"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="Overdue Reports"
          value={stats.overdue}
          description="Past SLA due date"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Within SLA"
          value={stats.within}
          description="Active and on time"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolved}
          description="Successfully closed"
          icon={CheckCircle}
          variant="accent"
        />
        <StatCard
          title="SLA Compliance"
          value={`${stats.compliance}%`}
          description="Resolved or on time"
          icon={Percent}
          variant="warning"
        />
        <StatCard
          title="Avg. Resolution"
          value={stats.averageResolution}
          description="Time to resolve"
          icon={Timer}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Reports by Category
            </CardTitle>
            <CardDescription>Distribution of issues across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-[250px] w-full">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Priority Distribution
            </CardTitle>
            <CardDescription>Breakdown of reports by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityChartConfig} className="h-[250px] w-full">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            High Priority Issues
          </CardTitle>
          <CardDescription>Critical and high priority reports requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden md:table-cell">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {highPriorityReports.length > 0 ? (
                highPriorityReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-primary">{report.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{report.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{report.category}</TableCell>
                    <TableCell className="hidden max-w-[150px] truncate lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {report.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={report.priority} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No high priority reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
