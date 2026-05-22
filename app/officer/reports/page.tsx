import Link from "next/link"
import { AlertTriangle, CalendarClock, CheckCircle, Clock, Eye, FileText, Search, Wrench } from "lucide-react"
import { mockReports } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/dashboard/stat-card"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"

function formatDate(dateString?: string) {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

const assignedReports = mockReports.filter((report) => report.assignedTo || report.status === "assigned" || report.status === "in-progress" || report.status === "overdue")

export default function OfficerReportsPage() {
  const inProgress = assignedReports.filter((report) => report.status === "in-progress").length
  const overdue = assignedReports.filter((report) => report.status === "overdue").length
  const resolved = mockReports.filter((report) => report.status === "resolved").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Assigned Reports</h2>
          <p className="text-muted-foreground">Manage civic issues assigned to your department and update resolution progress.</p>
        </div>
        <Button className="gap-2"><FileText className="h-4 w-4" /> Export Assigned Reports</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Assigned" value={assignedReports.length} description="Department workload" icon={FileText} variant="default" />
        <StatCard title="In Progress" value={inProgress} description="Work currently active" icon={Wrench} variant="accent" />
        <StatCard title="Due Soon" value={overdue + 1} description="Needs quick action" icon={CalendarClock} variant="warning" />
        <StatCard title="Resolved This Week" value={resolved} description="Completed reports" icon={CheckCircle} variant="accent" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search assigned reports by status, priority, SLA, and category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search assigned reports..." className="pl-9" />
            </div>
            <Select><SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="assigned">Assigned</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="All Priority" /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="SLA Status" /></SelectTrigger><SelectContent><SelectItem value="within">Within SLA</SelectItem><SelectItem value="due-soon">Due Soon</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Issue Register</CardTitle>
          <CardDescription>Reports that require department action.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Report</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>SLA Deadline</TableHead><TableHead>Location</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {assignedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell><div className="font-medium">{report.title}</div><div className="text-xs text-muted-foreground">{report.id}</div></TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell><PriorityBadge priority={report.priority} /></TableCell>
                  <TableCell><StatusBadge status={report.status} /></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />{formatDate(report.slaDeadline)}</div></TableCell>
                  <TableCell className="max-w-48 truncate">{report.location}</TableCell>
                  <TableCell><Button asChild size="sm" variant="outline"><Link href={`/officer/reports/${report.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><AlertTriangle className="mb-3 h-5 w-5 text-destructive" /><div className="text-2xl font-bold">{overdue}</div><p className="text-sm text-muted-foreground">Overdue issues</p></CardContent></Card>
        <Card><CardContent className="pt-6"><CalendarClock className="mb-3 h-5 w-5 text-warning" /><div className="text-2xl font-bold">3</div><p className="text-sm text-muted-foreground">Today&apos;s target</p></CardContent></Card>
        <Card><CardContent className="pt-6"><Wrench className="mb-3 h-5 w-5 text-primary" /><div className="text-2xl font-bold">{inProgress}</div><p className="text-sm text-muted-foreground">Active jobs</p></CardContent></Card>
        <Card><CardContent className="pt-6"><CheckCircle className="mb-3 h-5 w-5 text-accent" /><div className="text-2xl font-bold">{resolved}</div><p className="text-sm text-muted-foreground">Weekly resolved</p></CardContent></Card>
      </div>
    </div>
  )
}
