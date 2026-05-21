"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  Download,
  Eye,
  CheckSquare,
  XCircle,
  Building2,
  ArrowUpCircle,
  MoreHorizontal,
  MapPin,
  Calendar,
  CalendarRange,
  FileWarning,
  User,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge"
import { mockReports, mockDepartments } from "@/lib/mock-data"

// Extended mock data for admin reports page
const adminReports = [
  ...mockReports,
  {
    id: "RPT-009",
    title: "Broken footpath near bus stop",
    description: "Damaged tiles causing tripping hazard for commuters",
    category: "Footpaths",
    location: "Central Bus Stand, Platform 3",
    status: "pending" as const,
    priority: "medium" as const,
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    reportedBy: "Meera Gupta",
  },
  {
    id: "RPT-010",
    title: "Open manhole near school",
    description: "Manhole cover missing, extremely dangerous for pedestrians",
    category: "Drainage",
    location: "Near DPS School, Sector 8",
    status: "verified" as const,
    priority: "critical" as const,
    createdAt: "2024-01-15T06:30:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    reportedBy: "School Principal",
    department: "Public Works",
    slaDeadline: "2024-01-15T18:30:00Z",
  },
]

const stats = {
  total: adminReports.length,
  pendingVerification: adminReports.filter((r) => r.status === "pending").length,
  assigned: adminReports.filter((r) => r.status === "assigned" || r.status === "in-progress").length,
  overdue: adminReports.filter((r) => r.status === "overdue").length,
  resolved: adminReports.filter((r) => r.status === "resolved").length,
}

const categories = ["All", "Roads", "Garbage", "Water Supply", "Streetlights", "Traffic", "Drainage", "Footpaths"]
const statuses = ["All", "Pending", "Verified", "Assigned", "In Progress", "Resolved", "Rejected", "Overdue"]
const priorities = ["All", "Low", "Medium", "High", "Critical"]
const departments = ["All", ...mockDepartments.map((d) => d.name)]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getSlaStatus(report: typeof adminReports[0]): { label: string; variant: "destructive" | "warning" | "success" } | null {
  if (!report.slaDeadline) return null
  
  const deadline = new Date(report.slaDeadline)
  const now = new Date()
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (report.status === "overdue" || hoursRemaining < 0) {
    return { label: "Overdue", variant: "destructive" }
  } else if (hoursRemaining < 24) {
    return { label: "Due Soon", variant: "warning" }
  } else {
    return { label: "Within SLA", variant: "success" }
  }
}

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")

  const filteredReports = adminReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === "All" ||
      report.status.replace("-", " ").toLowerCase() === statusFilter.toLowerCase()
    
    const matchesCategory =
      categoryFilter === "All" || report.category === categoryFilter
    
    const matchesPriority =
      priorityFilter === "All" || report.priority.toLowerCase() === priorityFilter.toLowerCase()
    
    const matchesDepartment =
      departmentFilter === "All" || report.department === departmentFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDepartment
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">All Reports</h2>
          <p className="text-muted-foreground">
            Review, verify, assign, escalate, and track all civic issue reports.
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Reports"
          value={stats.total}
          description="All reports"
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
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Narrow down reports by status, category, priority, or department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports by ID, title, location, or citizen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <SelectTrigger className="w-[140px]">
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <CalendarRange className="h-4 w-4" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            Reports ({filteredReports.length})
          </CardTitle>
          <CardDescription>
            {filteredReports.length === adminReports.length
              ? "Showing all reports"
              : `Filtered ${filteredReports.length} of ${adminReports.length} reports`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No reports found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing filters or search terms.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("All")
                  setCategoryFilter("All")
                  setPriorityFilter("All")
                  setDepartmentFilter("All")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Report</TableHead>
                    <TableHead className="hidden lg:table-cell">Citizen</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead className="hidden xl:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">SLA</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const slaStatus = getSlaStatus(report)
                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-primary">{report.id}</span>
                            <span className="line-clamp-1 text-sm">{report.title}</span>
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
                            <span className="text-sm">{report.reportedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{report.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={report.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <PriorityBadge priority={report.priority} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {report.department ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="line-clamp-1 max-w-[120px]">{report.department}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {slaStatus ? (
                            <Badge
                              variant="outline"
                              className={
                                slaStatus.variant === "destructive"
                                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                                  : slaStatus.variant === "warning"
                                    ? "border-warning/20 bg-warning/10 text-warning"
                                    : "border-accent/20 bg-accent/10 text-accent"
                              }
                            >
                              {slaStatus.label}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(report.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/reports/${report.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <CheckSquare className="h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <XCircle className="h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Building2 className="h-4 w-4" />
                                Assign Department
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <ArrowUpCircle className="h-4 w-4" />
                                Escalate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
