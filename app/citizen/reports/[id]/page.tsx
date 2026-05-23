import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  History,
  MapPin,
} from "lucide-react"

import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentDbUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import {
  IssueCategory,
  ReportPriority,
  ReportStatus,
} from "@/lib/generated/prisma/enums"

export const dynamic = "force-dynamic"

function statusToUi(status: ReportStatus) {
  if (status === ReportStatus.VERIFIED) return "verified"
  if (status === ReportStatus.ASSIGNED) return "assigned"
  if (status === ReportStatus.IN_PROGRESS) return "in-progress"
  if (status === ReportStatus.RESOLVED) return "resolved"
  if (status === ReportStatus.REJECTED) return "rejected"
  return "pending"
}

function priorityToUi(priority: ReportPriority) {
  return priority.toLowerCase() as "low" | "medium" | "high" | "critical"
}

function categoryToLabel(category: IssueCategory) {
  const labels: Record<IssueCategory, string> = {
    ROAD_DAMAGE: "Road Damage",
    GARBAGE_OVERFLOW: "Garbage Overflow",
    STREET_LIGHT: "Street Light",
    WATER_LEAKAGE: "Water Leakage",
    DRAINAGE: "Drainage",
    PUBLIC_SAFETY: "Public Safety",
    OTHER: "Other",
  }

  return labels[category]
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getSlaDeadline(createdAt: Date, priority: ReportPriority) {
  const deadline = new Date(createdAt)

  if (priority === ReportPriority.HIGH || priority === ReportPriority.CRITICAL) {
    deadline.setDate(deadline.getDate() + 1)
    return deadline
  }

  if (priority === ReportPriority.MEDIUM) {
    deadline.setDate(deadline.getDate() + 3)
    return deadline
  }

  deadline.setDate(deadline.getDate() + 7)
  return deadline
}

export default async function CitizenReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    redirect("/sign-in")
  }

  const { id } = await params

  const report = await prisma.report.findFirst({
    where: {
      id,
      citizenId: dbUser.id,
    },
    include: {
      department: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      images: true,
    },
  })

  if (!report) {
    notFound()
  }

  const slaDeadline = getSlaDeadline(report.createdAt, report.priority)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 gap-2">
            <Link href="/citizen/reports">
              <ArrowLeft className="h-4 w-4" />
              Back to My Reports
            </Link>
          </Button>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {report.title}
          </h2>
          <p className="text-muted-foreground">
            Report ID: <span className="font-mono text-primary">{report.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={statusToUi(report.status)} />
          <PriorityBadge priority={priorityToUi(report.priority)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Report Details
              </CardTitle>
              <CardDescription>
                Full details of the submitted civic issue.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-foreground">{report.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge variant="outline" className="mt-1">
                    {categoryToLabel(report.category)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {report.department?.name ?? "Not assigned"}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(report.createdAt)}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">SLA Deadline</p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(slaDeadline)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <div className="mt-1 flex items-start gap-2 text-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>{report.address ?? "Location not provided"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lat: {report.latitude}, Lng: {report.longitude}
                    </p>
                  </div>
                </div>
              </div>

              {report.images.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Images</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {report.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="Report evidence"
                        className="h-40 rounded-lg border object-cover"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No image uploaded yet. Image upload will be connected in the media step.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Status Timeline
              </CardTitle>
              <CardDescription>
                Updates recorded for this report.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {report.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {report.statusHistory.map((item) => (
                    <div key={item.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={statusToUi(item.newStatus)} />
                      </div>
                      <p className="mt-2 text-sm text-foreground">
                        {item.note ?? "Status updated."}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No status history available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}