"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Copy,
  Eye,
  Shield,
  History,
  Save,
  CheckSquare,
  Circle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge"

// Mock report data for this review page
const mockReport = {
  id: "RPT-007",
  title: "Water leakage near colony gate",
  description:
    "Continuous water leakage near the colony entrance causing road damage and water wastage. The leak appears to be from the main supply line and has been ongoing for several days. Multiple residents have complained about the issue.",
  category: "Water Leakage",
  location: "Near Shanti Nagar Colony Gate, Sector 12",
  latitude: 28.6139,
  longitude: 77.209,
  status: "pending" as const,
  priority: "high" as const,
  createdAt: "2024-01-18T09:30:00Z",
  slaDeadline: "2024-01-20T09:30:00Z",
  citizen: {
    name: "Ravi Kumar",
    email: "ravi.kumar@email.com",
  },
}

const departments = [
  { value: "road-maintenance", label: "Road Maintenance Department" },
  { value: "waste-management", label: "Waste Management Department" },
  { value: "water-supply", label: "Water Supply Department" },
  { value: "street-light", label: "Street Light Department" },
  { value: "drainage", label: "Drainage Department" },
  { value: "public-safety", label: "Public Safety Department" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const duplicateReports = [
  {
    id: "RPT-004",
    title: "Water leakage beside main gate",
    distance: "120m",
    category: "Water Leakage",
    status: "in-progress" as const,
    similarity: 86,
  },
  {
    id: "RPT-011",
    title: "Pipe leakage near colony entrance",
    distance: "180m",
    category: "Water Leakage",
    status: "assigned" as const,
    similarity: 79,
  },
  {
    id: "RPT-015",
    title: "Road wet due to water pipe issue",
    distance: "250m",
    category: "Roads",
    status: "pending" as const,
    similarity: 65,
  },
]

const timelineSteps = [
  {
    label: "Report Submitted",
    status: "completed" as const,
    timestamp: "Jan 18, 2024 9:30 AM",
  },
  {
    label: "Admin Review Started",
    status: "completed" as const,
    timestamp: "Jan 18, 2024 10:15 AM",
  },
  {
    label: "Duplicate Check Completed",
    status: "completed" as const,
    timestamp: "Jan 18, 2024 10:16 AM",
  },
  {
    label: "Waiting for Verification",
    status: "current" as const,
    timestamp: null,
  },
  {
    label: "Department Assignment Pending",
    status: "pending" as const,
    timestamp: null,
  },
]

const auditActions = [
  {
    action: "Admin opened report",
    user: "Admin User",
    timestamp: "2 minutes ago",
  },
  {
    action: "Duplicate check completed",
    user: "System",
    timestamp: "5 minutes ago",
  },
  {
    action: "Priority auto-suggested as High",
    user: "System",
    timestamp: "5 minutes ago",
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getSlaInfo(deadline: string) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const totalHours = (deadlineDate.getTime() - new Date(mockReport.createdAt).getTime()) / (1000 * 60 * 60)
  const remainingHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const progress = Math.max(0, Math.min(100, ((totalHours - remainingHours) / totalHours) * 100))

  let status: "safe" | "warning" | "danger" = "safe"
  if (remainingHours < 0) {
    status = "danger"
  } else if (remainingHours < 24) {
    status = "warning"
  }

  return {
    remaining: remainingHours,
    progress,
    status,
    formattedRemaining:
      remainingHours < 0
        ? `Overdue by ${Math.abs(Math.floor(remainingHours))} hours`
        : remainingHours < 24
          ? `${Math.floor(remainingHours)} hours remaining`
          : `${Math.floor(remainingHours / 24)} days, ${Math.floor(remainingHours % 24)} hours remaining`,
  }
}

export default function AdminReportReviewPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedPriority, setSelectedPriority] = useState(mockReport.priority)
  const [internalNotes, setInternalNotes] = useState("")

  const slaInfo = getSlaInfo(mockReport.slaDeadline)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Reports
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Review Report</h2>
            <p className="text-muted-foreground">
              Verify issue details, assign department, set priority, and track SLA.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Report Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Report Details
                  </CardTitle>
                  <CardDescription>Complete information about the reported issue</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-primary">
                  {mockReport.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Issue Title and Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{mockReport.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mockReport.description}
                </p>
              </div>

              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{mockReport.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <StatusBadge status={mockReport.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <PriorityBadge priority={mockReport.priority} />
                </div>
              </div>

              {/* Citizen Info */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">Citizen Information</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{mockReport.citizen.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{mockReport.citizen.email}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{formatDate(mockReport.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SLA Deadline:</span>
                  <span className="font-medium">{formatDate(mockReport.slaDeadline)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image and Location Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Issue Photo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Issue Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Issue photo placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative flex aspect-video items-center justify-center rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive shadow-lg">
                        <MapPin className="h-5 w-5 text-destructive-foreground" />
                      </div>
                      <div className="mt-1 h-4 w-0.5 bg-destructive"></div>
                    </div>
                  </div>
                  <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    Map placeholder
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{mockReport.location}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Lat: {mockReport.latitude}</span>
                    <span>Long: {mockReport.longitude}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" />
                Report Timeline
              </CardTitle>
              <CardDescription>Track the progress of this report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {timelineSteps.map((step, index) => (
                  <div key={step.label} className="flex gap-4 pb-6 last:pb-0">
                    {/* Line connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                          step.status === "completed"
                            ? "border-accent bg-accent text-accent-foreground"
                            : step.status === "current"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.status === "current" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`h-full w-0.5 ${
                            step.status === "completed" ? "bg-accent" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <p
                        className={`font-medium ${
                          step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-sm text-muted-foreground">{step.timestamp}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duplicate Detection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Copy className="h-4 w-4 text-primary" />
                Possible Duplicate Reports
              </CardTitle>
              <CardDescription>
                These reports are near the same location and may describe a similar issue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {duplicateReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary">{report.id}</span>
                          <Badge variant="secondary" className="text-xs">
                            {report.category}
                          </Badge>
                        </div>
                        <span className="mt-0.5 text-sm font-medium">{report.title}</span>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.distance}
                          </span>
                          <StatusBadge status={report.status} className="text-xs" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`text-lg font-bold ${
                            report.similarity >= 80
                              ? "text-destructive"
                              : report.similarity >= 70
                                ? "text-warning"
                                : "text-muted-foreground"
                          }`}
                        >
                          {report.similarity}%
                        </span>
                        <p className="text-xs text-muted-foreground">similar</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Admin Action Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Admin Actions
              </CardTitle>
              <CardDescription>Take action on this report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Verify / Reject Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button className="gap-2 bg-accent hover:bg-accent/90">
                  <CheckSquare className="h-4 w-4" />
                  Verify
                </Button>
                <Button variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>

              {/* Department Assignment */}
              <div className="space-y-2">
                <Label htmlFor="department">Assign Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Escalate Button */}
              <Button variant="outline" className="w-full gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Escalate Report
              </Button>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add internal notes for this report..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Save Changes Button */}
              <Button className="w-full gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* SLA Tracking Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                SLA Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">{formatDate(mockReport.slaDeadline)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      slaInfo.status === "danger"
                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                        : slaInfo.status === "warning"
                          ? "border-warning/20 bg-warning/10 text-warning"
                          : "border-accent/20 bg-accent/10 text-accent"
                    }
                  >
                    {slaInfo.status === "danger"
                      ? "Overdue"
                      : slaInfo.status === "warning"
                        ? "Due Soon"
                        : "On Track"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time Progress</span>
                  <span className="font-medium">{Math.round(slaInfo.progress)}%</span>
                </div>
                <Progress
                  value={slaInfo.progress}
                  className={`h-2 ${
                    slaInfo.status === "danger"
                      ? "[&>div]:bg-destructive"
                      : slaInfo.status === "warning"
                        ? "[&>div]:bg-warning"
                        : "[&>div]:bg-accent"
                  }`}
                />
              </div>

              <div
                className={`rounded-lg p-3 ${
                  slaInfo.status === "danger"
                    ? "bg-destructive/10"
                    : slaInfo.status === "warning"
                      ? "bg-warning/10"
                      : "bg-accent/10"
                }`}
              >
                <div className="flex items-start gap-2">
                  {slaInfo.status !== "safe" && (
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        slaInfo.status === "danger" ? "text-destructive" : "text-warning"
                      }`}
                    />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      slaInfo.status === "danger"
                        ? "text-destructive"
                        : slaInfo.status === "warning"
                          ? "text-warning"
                          : "text-accent"
                    }`}
                  >
                    {slaInfo.formattedRemaining}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" />
                Recent Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{action.user}</span>
                        <span>-</span>
                        <span>{action.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
