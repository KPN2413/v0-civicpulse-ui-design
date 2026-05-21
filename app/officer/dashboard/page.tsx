import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  MessageSquarePlus,
  CheckCheck,
  MapPin,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge"
import { mockReports } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

// Filter reports assigned to this officer (simulated)
const assignedReports = mockReports.filter(
  (r) => r.status === "assigned" || r.status === "in-progress" || r.status === "overdue"
)

const stats = {
  assigned: assignedReports.length,
  inProgress: assignedReports.filter((r) => r.status === "in-progress").length,
  overdue: assignedReports.filter((r) => r.status === "overdue").length,
  resolvedThisWeek: 5, // Mock data
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getTimeRemaining(deadline: string) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  
  if (diff < 0) return "Overdue"
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h remaining`
  return `${hours}h remaining`
}

export default function OfficerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome, Suresh!</h2>
        <p className="text-muted-foreground">
          Here are your assigned reports. Complete them before the SLA deadline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Reports"
          value={stats.assigned}
          description="Total in queue"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          description="Currently working"
          icon={Clock}
          variant="accent"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          description="SLA breached"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatCard
          title="Resolved This Week"
          value={stats.resolvedThisWeek}
          description="Great progress!"
          icon={CheckCircle}
          variant="accent"
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assigned Issues
          </CardTitle>
          <CardDescription>Reports assigned to you for resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-primary">{report.id}</span>
                    <StatusBadge status={report.status} />
                    <PriorityBadge priority={report.priority} />
                    {report.slaDeadline && (
                      <Badge
                        variant="outline"
                        className={
                          report.status === "overdue"
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-warning/20 bg-warning/10 text-warning"
                        }
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {getTimeRemaining(report.slaDeadline)}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(report.createdAt)} at {formatTime(report.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.status === "assigned" && (
                    <Button size="sm" className="gap-1">
                      <Play className="h-3 w-3" />
                      Start Work
                    </Button>
                  )}
                  {report.status === "in-progress" && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageSquarePlus className="h-3 w-3" />
                        Add Update
                      </Button>
                      <Button size="sm" className="gap-1">
                        <CheckCheck className="h-3 w-3" />
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  {report.status === "overdue" && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageSquarePlus className="h-3 w-3" />
                        Add Update
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1">
                        <CheckCheck className="h-3 w-3" />
                        Resolve Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
