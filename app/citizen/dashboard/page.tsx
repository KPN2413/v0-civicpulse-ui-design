import Link from "next/link"
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
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

// Filter reports for citizen view (simulated as reports by "Rahul Sharma")
const citizenReports = mockReports.filter(
  (report) => report.reportedBy === "Rahul Sharma" || report.reportedBy === "Priya Patel"
)

const stats = {
  total: citizenReports.length,
  pending: citizenReports.filter((r) => r.status === "pending" || r.status === "verified").length,
  resolved: citizenReports.filter((r) => r.status === "resolved").length,
  rejected: citizenReports.filter((r) => r.status === "rejected").length,
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function CitizenDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Rahul!</h2>
          <p className="text-muted-foreground">Here&apos;s an overview of your civic issue reports.</p>
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
          description="Issues submitted"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pending}
          description="Awaiting resolution"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolved}
          description="Successfully closed"
          icon={CheckCircle}
          variant="accent"
        />
        <StatCard
          title="Rejected Reports"
          value={stats.rejected}
          description="Not actionable"
          icon={XCircle}
          variant="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Reports
          </CardTitle>
          <CardDescription>Your most recent civic issue reports and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {citizenReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium text-primary">{report.id}</TableCell>
                  <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                    {report.title}
                  </TableCell>
                  <TableCell>{report.category}</TableCell>
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
