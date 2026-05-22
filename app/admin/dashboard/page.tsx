"use client"

import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Timer,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
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
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge"
import { mockReports } from "@/lib/mock-data"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Cell, Pie, PieChart as RechartsPieChart } from "recharts"

const stats = {
  total: mockReports.length,
  pendingVerification: mockReports.filter((r) => r.status === "pending").length,
  assigned: mockReports.filter((r) => r.status === "assigned" || r.status === "in-progress").length,
  overdue: mockReports.filter((r) => r.status === "overdue").length,
  resolved: mockReports.filter((r) => r.status === "resolved").length,
  avgResolutionTime: "2.4 days",
}

const categoryData = [
  { category: "Roads", count: 3, fill: "var(--color-chart-1)" },
  { category: "Garbage", count: 2, fill: "var(--color-chart-2)" },
  { category: "Water", count: 1, fill: "var(--color-chart-3)" },
  { category: "Streetlights", count: 1, fill: "var(--color-chart-4)" },
  { category: "Traffic", count: 1, fill: "var(--color-chart-5)" },
]

const priorityData = [
  { name: "Critical", value: 3, fill: "var(--color-destructive)" },
  { name: "High", value: 2, fill: "var(--color-chart-3)" },
  { name: "Medium", value: 2, fill: "var(--color-warning)" },
  { name: "Low", value: 1, fill: "var(--color-muted-foreground)" },
]

const categoryChartConfig = {
  count: {
    label: "Reports",
  },
  Roads: {
    label: "Roads",
    color: "var(--chart-1)",
  },
  Garbage: {
    label: "Garbage",
    color: "var(--chart-2)",
  },
  Water: {
    label: "Water",
    color: "var(--chart-3)",
  },
  Streetlights: {
    label: "Streetlights",
    color: "var(--chart-4)",
  },
  Traffic: {
    label: "Traffic",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const priorityChartConfig = {
  value: {
    label: "Reports",
  },
  Critical: {
    label: "Critical",
    color: "var(--destructive)",
  },
  High: {
    label: "High",
    color: "var(--chart-3)",
  },
  Medium: {
    label: "Medium",
    color: "var(--warning)",
  },
  Low: {
    label: "Low",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

const highPriorityReports = mockReports.filter(
  (r) => r.priority === "critical" || r.priority === "high"
)

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Overview</h2>
        <p className="text-muted-foreground">Manage and monitor all civic issue reports across the municipality.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Reports"
          value={stats.total}
          description="All time"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification}
          description="Awaiting review"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Assigned Reports"
          value={stats.assigned}
          description="Being processed"
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Overdue Reports"
          value={stats.overdue}
          description="SLA breached"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolved}
          description="Successfully closed"
          icon={CheckCircle}
          variant="accent"
        />
        <StatCard
          title="Avg. Resolution"
          value={stats.avgResolutionTime}
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
                  width={80}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
          <CardDescription>Critical and high priority reports requiring immediate attention</CardDescription>
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
              {highPriorityReports.map((report) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
