"use client"

import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  FileText,
  Image as ImageIcon,
  Timer,
  MessageSquare,
  Copy,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { StatusBadge, PriorityBadge } from "@/components/dashboard/status-badge"

// Mock report data
const reportData = {
  id: "RPT-001",
  title: "Pothole near Main Road",
  description:
    "Large pothole causing traffic slowdown and safety risk near the main road junction. Multiple vehicles have been damaged and there have been near-miss accidents reported by commuters.",
  category: "Road Damage",
  status: "in-progress" as const,
  priority: "high" as const,
  createdAt: "2024-01-15T10:30:00Z",
  slaDeadline: "2024-01-18T10:30:00Z",
  department: "Road Maintenance Department",
  location: {
    address: "MG Road, Near Metro Station, Bangalore",
    latitude: "12.9716",
    longitude: "77.5946",
  },
}

// Mock timeline data
const timelineSteps = [
  {
    title: "Report Submitted",
    description: "Citizen submitted the issue report",
    date: "Jan 15, 2024 - 10:30 AM",
    status: "completed" as const,
  },
  {
    title: "Admin Review Started",
    description: "Report received by admin for verification",
    date: "Jan 15, 2024 - 11:45 AM",
    status: "completed" as const,
  },
  {
    title: "Report Verified",
    description: "Issue verified and marked as valid",
    date: "Jan 15, 2024 - 02:15 PM",
    status: "completed" as const,
  },
  {
    title: "Assigned to Department",
    description: "Routed to Road Maintenance Department",
    date: "Jan 16, 2024 - 09:00 AM",
    status: "completed" as const,
  },
  {
    title: "Work In Progress",
    description: "Repair work has begun on site",
    date: "Jan 17, 2024 - 10:00 AM",
    status: "current" as const,
  },
  {
    title: "Resolution Pending",
    description: "Awaiting completion and verification",
    date: "Estimated: Jan 18, 2024",
    status: "pending" as const,
  },
]

// Mock department updates
const departmentUpdates = [
  {
    message: "Road maintenance team assigned to the issue",
    date: "Jan 16, 2024 - 09:30 AM",
  },
  {
    message: "Officer inspection completed - repair work approved",
    date: "Jan 16, 2024 - 03:45 PM",
  },
  {
    message: "Repair work scheduled for Jan 17, 2024",
    date: "Jan 17, 2024 - 08:00 AM",
  },
]

// Mock related reports
const relatedReports = [
  {
    id: "RPT-045",
    title: "Road crack near bus stop",
    distance: "150m away",
    status: "verified" as const,
  },
  {
    id: "RPT-052",
    title: "Damaged road divider",
    distance: "200m away",
    status: "pending" as const,
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function TimelineStep({
  title,
  description,
  date,
  status,
  isLast,
}: {
  title: string
  description: string
  date: string
  status: "completed" | "current" | "pending"
  isLast: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            status === "completed"
              ? "border-accent bg-accent text-accent-foreground"
              : status === "current"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 bg-background text-muted-foreground"
          }`}
        >
          {status === "completed" ? (
            <CheckCircle className="h-4 w-4" />
          ) : status === "current" ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {!isLast && (
          <div
            className={`h-full w-0.5 ${
              status === "completed" ? "bg-accent" : "bg-muted-foreground/30"
            }`}
          />
        )}
      </div>
      <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
        <p
          className={`font-medium ${
            status === "pending" ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p
          className={`mt-1 text-xs ${
            status === "current" ? "text-primary font-medium" : "text-muted-foreground"
          }`}
        >
          {date}
        </p>
      </div>
    </div>
  )
}

export default function ReportDetailsPage() {
  const slaProgress = 65 // Percentage of SLA time elapsed
  const timeRemaining = "1 day, 4 hours"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit gap-2">
          <Link href="/citizen/reports">
            <ArrowLeft className="h-4 w-4" />
            Back to My Reports
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Report Details</h2>
          <p className="text-muted-foreground">
            Track issue status, department assignment, SLA deadline, and resolution progress.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Issue Information Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{reportData.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">{reportData.id}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{reportData.category}</Badge>
                  <StatusBadge status={reportData.status} />
                  <PriorityBadge priority={reportData.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Description</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {reportData.description}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted On</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(reportData.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA Deadline</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(reportData.slaDeadline)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Department</p>
                    <p className="text-sm font-medium text-foreground">{reportData.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image and Location Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Issue Photo Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Issue Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/30">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Photo attached to report</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Location Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative flex aspect-video items-center justify-center rounded-lg border bg-muted/50">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive shadow-lg">
                      <MapPin className="h-5 w-5 text-destructive-foreground" />
                    </div>
                    <div className="mt-1 h-3 w-0.5 bg-destructive" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-foreground">{reportData.location.address}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Lat: {reportData.location.latitude}</span>
                    <span>Lng: {reportData.location.longitude}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Status Timeline
              </CardTitle>
              <CardDescription>Track the progress of your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timelineSteps.map((step, index) => (
                  <TimelineStep
                    key={step.title}
                    title={step.title}
                    description={step.description}
                    date={step.date}
                    status={step.status}
                    isLast={index === timelineSteps.length - 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resolution Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Resolution note will appear here after the department marks this issue as
                  resolved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* SLA Tracking Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="h-4 w-4 text-primary" />
                SLA Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SLA Deadline</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(reportData.slaDeadline)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Remaining</span>
                <span className="text-sm font-medium text-foreground">{timeRemaining}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <Badge
                    variant="outline"
                    className="border-accent/20 bg-accent/10 text-accent hover:bg-accent/20"
                  >
                    Within SLA
                  </Badge>
                </div>
                <Progress value={slaProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{slaProgress}% of SLA time elapsed</p>
              </div>
            </CardContent>
          </Card>

          {/* Department Updates Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Department Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentUpdates.map((update, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm text-foreground">{update.message}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                    {index < departmentUpdates.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Reports Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Related Reports
              </CardTitle>
              <CardDescription>2 nearby reports may be related to this issue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{report.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{report.id}</span>
                        <span className="text-xs text-muted-foreground">• {report.distance}</span>
                      </div>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Need Help?</p>
                  <p className="text-xs text-muted-foreground">
                    Contact our support team if you have questions about your report.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs text-primary">
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
