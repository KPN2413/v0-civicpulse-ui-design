"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  Loader2,
  MapPin,
  PlusCircle,
  Search,
} from "lucide-react"

import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"
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

export type CitizenReportRow = {
  id: string
  title: string
  description: string
  category: string
  location: string
  status: "pending" | "verified" | "assigned" | "in-progress" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string
  slaDeadline: string
  department: string
}

type CitizenReportsClientProps = {
  reports: CitizenReportRow[]
}

const statuses = ["All", "Pending", "Verified", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorities = ["All", "Low", "Medium", "High", "Critical"]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function CitizenReportsClient({ reports }: CitizenReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(reports.map((report) => report.category)))]
  }, [reports])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const query = searchQuery.toLowerCase()

      const matchesSearch =
        report.title.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query) ||
        report.id.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === "All" ||
        report.status.toLowerCase().replace("-", " ") === statusFilter.toLowerCase()

      const matchesCategory = categoryFilter === "All" || report.category === categoryFilter

      const matchesPriority =
        priorityFilter === "All" || report.priority.toLowerCase() === priorityFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    })
  }, [reports, searchQuery, statusFilter, categoryFilter, priorityFilter])

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((report) => report.status === "pending" || report.status === "verified").length,
      inProgress: reports.filter((report) => report.status === "assigned" || report.status === "in-progress").length,
      resolved: reports.filter((report) => report.status === "resolved").length,
    }),
    [reports]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Reports</h2>
          <p className="text-muted-foreground">
            Track the status, priority, SLA deadline, and resolution progress of your submitted civic issues.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/citizen/report">
            <PlusCircle className="h-4 w-4" />
            Report New Issue
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={stats.total}
          description="All submitted issues"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          description="Awaiting verification"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          description="Being worked on"
          icon={Loader2}
          variant="default"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          description="Successfully closed"
          icon={CheckCircle}
          variant="accent"
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filter Reports
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Reports
          </CardTitle>
          <CardDescription>
            {filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"} found
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Priority</TableHead>
                    <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                    <TableHead className="hidden lg:table-cell">SLA Deadline</TableHead>
                    <TableHead className="hidden xl:table-cell">Department</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{report.title}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[200px] truncate">{report.location}</span>
                          </div>
                          <span className="text-xs text-primary">{report.id}</span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{report.category}</span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <PriorityBadge priority={report.priority} />
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          {formatDate(report.slaDeadline)}
                        </div>
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="max-w-[150px] truncate">{report.department}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="gap-1.5" asChild>
                          <Link href={`/citizen/reports/${report.id}`}>
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">No reports submitted yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Start by reporting a civic issue in your area.
              </p>
              <Button asChild className="gap-2">
                <Link href="/citizen/report">
                  <PlusCircle className="h-4 w-4" />
                  Report New Issue
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}