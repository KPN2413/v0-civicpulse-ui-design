"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Eye,
  FileWarning,
  MapPin,
  Search,
  User,
} from "lucide-react"

import type { UiReportPriority, UiReportStatus } from "@/app/admin/reports/report-mappers"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { ReportsAreaInsights } from "@/components/reports-area-insights"
import { ReportsMapOverview } from "@/components/reports-map-overview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSlaBadgeClassName, type SlaState } from "@/lib/sla"

export type OfficerReportRow = {
  id: string
  title: string
  category: string
  status: UiReportStatus
  priority: UiReportPriority
  address: string | null
  latitude: number | null
  longitude: number | null
  location: string
  citizenName: string
  citizenEmail: string
  departmentName: string
  officerName: string | null
  officerEmail: string | null
  createdAt: string
  resolvedAt: string | null
  slaDueAt: string | null
  slaState: SlaState
  slaLabel: string
  slaTimeText: string
}

export type OfficerReportsStats = {
  assigned: number
  overdue: number
  within: number
  resolved: number
}

type OfficerReportsClientProps = {
  reports: OfficerReportRow[]
  stats: OfficerReportsStats
}

const statuses = ["All", "Pending", "Verified", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorities = ["All", "Low", "Medium", "High", "Critical"]
const slaFilters: { label: string; value: "All" | SlaState }[] = [
  { label: "All SLA states", value: "All" },
  { label: "Overdue", value: "overdue" },
  { label: "Within SLA", value: "within" },
  { label: "Resolved", value: "resolved" },
  { label: "SLA not set", value: "not-set" },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function OfficerReportsClient({ reports, stats }: OfficerReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [slaFilter, setSlaFilter] = useState<"All" | SlaState>("All")

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(reports.map((report) => report.category)))],
    [reports]
  )

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const query = searchQuery.toLowerCase()

      const matchesSearch =
        report.title.toLowerCase().includes(query) ||
        report.id.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query) ||
        report.citizenName.toLowerCase().includes(query) ||
        report.citizenEmail.toLowerCase().includes(query) ||
        report.departmentName.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === "All" ||
        report.status.replace("-", " ").toLowerCase() === statusFilter.toLowerCase()

      const matchesCategory = categoryFilter === "All" || report.category === categoryFilter

      const matchesPriority =
        priorityFilter === "All" || report.priority.toLowerCase() === priorityFilter.toLowerCase()

      const matchesSla = slaFilter === "All" || report.slaState === slaFilter

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesSla
    })
  }, [reports, searchQuery, statusFilter, categoryFilter, priorityFilter, slaFilter])

  function clearFilters() {
    setSearchQuery("")
    setStatusFilter("All")
    setCategoryFilter("All")
    setPriorityFilter("All")
    setSlaFilter("All")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Assigned Reports</h2>
        <p className="text-muted-foreground">
          Review civic issues assigned directly to your officer account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Reports"
          value={stats.assigned}
          description="Assigned to you"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="Overdue Reports"
          value={stats.overdue}
          description="Past SLA due date"
          icon={FileWarning}
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
          title="Resolved"
          value={stats.resolved}
          description="Completed assignments"
          icon={CheckCircle}
          variant="accent"
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Narrow down assigned reports by status, category, priority, SLA state, or search term.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assigned reports by ID, title, location, citizen, or department..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={slaFilter}
                onValueChange={(value) => setSlaFilter(value as "All" | SlaState)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="SLA" />
                </SelectTrigger>
                <SelectContent>
                  {slaFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportsMapOverview reports={filteredReports} />

      <ReportsAreaInsights reports={filteredReports} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Assigned Issue Register ({filteredReports.length})
          </CardTitle>
          <CardDescription>
            {filteredReports.length === reports.length
              ? "Showing reports assigned to you"
              : `Filtered ${filteredReports.length} of ${reports.length} assigned reports`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
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
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No reports found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing filters or search terms.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">Report</TableHead>
                    <TableHead className="hidden lg:table-cell">Citizen</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status / SLA</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead className="hidden xl:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs text-primary">{report.id}</span>
                          <span className="line-clamp-1 text-sm font-medium">
                            {report.title}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{report.location}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {report.citizenName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {report.citizenEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{report.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={report.status} />
                          <Badge
                            variant="outline"
                            className={getSlaBadgeClassName(report.slaState)}
                          >
                            {report.slaLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.slaTimeText}
                          </span>
                          {report.slaDueAt ? (
                            <span className="text-xs text-muted-foreground">
                              SLA: {formatDate(report.slaDueAt)}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <PriorityBadge priority={report.priority} />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="line-clamp-1 max-w-[160px]">
                            {report.departmentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(report.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="gap-1.5" asChild>
                          <Link href={`/officer/reports/${report.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">View Details</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
