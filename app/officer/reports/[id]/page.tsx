import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Circle,
  FileText,
  History,
  Image as ImageIcon,
  Mail,
  MapPin,
  Shield,
  User,
  UserCheck,
} from "lucide-react"

import { categoryToLabel, priorityToUi, statusToUi } from "@/app/admin/reports/report-mappers"
import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { ReportEvidenceGallery, type ReportEvidenceItem } from "@/components/report-evidence-gallery"
import { ReportLocationMap } from "@/components/report-location-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentDbUser } from "@/lib/current-user"
import { ReportStatus, UserRole } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getSlaBadgeClassName, getSlaDisplay } from "@/lib/sla"

export const dynamic = "force-dynamic"

function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusLabel(status: ReportStatus) {
  const labels: Record<ReturnType<typeof statusToUi>, string> = {
    pending: "Pending",
    verified: "Verified",
    assigned: "Assigned",
    "in-progress": "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  }

  return labels[statusToUi(status)]
}

export default async function OfficerReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dbUser = await getCurrentDbUser()

  if (!dbUser || dbUser.role !== UserRole.DEPARTMENT_OFFICER) {
    notFound()
  }

  const report = await prisma.report.findFirst({
    where: {
      id,
      officerId: dbUser.id,
    },
    include: {
      citizen: {
        select: {
          name: true,
          email: true,
        },
      },
      department: {
        select: {
          name: true,
          description: true,
        },
      },
      officer: {
        select: {
          name: true,
          email: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      images: {
        orderBy: {
          createdAt: "asc",
        },
      },
      attachments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!report) {
    notFound()
  }

  const sla = getSlaDisplay({
    status: report.status,
    slaDueAt: report.slaDueAt,
  })

  const timelineItems =
    report.statusHistory.length > 0
      ? report.statusHistory
      : [
          {
            id: "current-status",
            oldStatus: null,
            newStatus: report.status,
            note: "Current report status.",
            createdAt: report.createdAt,
            reportId: report.id,
          },
        ]
  const evidence: ReportEvidenceItem[] = [
    ...report.attachments.map((attachment) => ({
      id: attachment.id,
      url: attachment.url,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
    })),
    ...report.images.map((image) => ({
      id: `image-${image.id}`,
      url: image.imageUrl,
      fileName: "Report image",
    })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/officer/reports" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Assigned Reports
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {report.title}
            </h2>
            <p className="text-muted-foreground">
              Report ID: <span className="font-mono text-primary">{report.id}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={statusToUi(report.status)} />
          <PriorityBadge priority={priorityToUi(report.priority)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Report Details
                  </CardTitle>
                  <CardDescription>
                    Current assignment and issue information from PostgreSQL.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-primary">
                  {report.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm leading-relaxed text-foreground">
                  {report.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{categoryToLabel(report.category)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <StatusBadge status={statusToUi(report.status)} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <PriorityBadge priority={priorityToUi(report.priority)} />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">
                  Citizen Information
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {report.citizen.name ?? "Unnamed citizen"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{report.citizen.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {report.department?.name ?? "Unassigned"}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned Officer</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    {report.officer?.name ?? "Not assigned"}
                  </div>
                  {report.officer?.email ? (
                    <p className="mt-1 text-xs text-muted-foreground">{report.officer.email}</p>
                  ) : null}
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(report.createdAt)}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    {report.resolvedAt ? formatDateTime(report.resolvedAt) : "Not resolved yet"}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">SLA Due</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {sla.dueAt ? formatDateTime(sla.dueAt) : "Not set"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={getSlaBadgeClassName(sla.state)}>
                      {sla.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{sla.timeText}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Evidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportEvidenceGallery evidence={evidence} showTitle={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ReportLocationMap
                  latitude={report.latitude}
                  longitude={report.longitude}
                  address={report.address}
                  mapClassName="aspect-video h-auto"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" />
                Status Timeline
              </CardTitle>
              <CardDescription>Recorded status changes for this report.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timelineItems.map((item, index) => (
                  <div key={item.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                          index === timelineItems.length - 1
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-accent bg-accent text-accent-foreground"
                        }`}
                      >
                        {index === timelineItems.length - 1 ? (
                          <Circle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      {index < timelineItems.length - 1 ? (
                        <div className="h-full w-0.5 bg-border" />
                      ) : null}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={statusToUi(item.newStatus)} />
                        {item.oldStatus ? (
                          <span className="text-xs text-muted-foreground">
                            from {statusLabel(item.oldStatus)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-foreground">
                        {item.note ?? "Status updated."}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Assignment Summary
              </CardTitle>
              <CardDescription>Current routing and ownership data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Department</p>
                <p className="mt-1 text-foreground">
                  {report.department?.name ?? "Unassigned"}
                </p>
                {report.department?.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report.department.description}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Officer</p>
                <p className="mt-1 text-foreground">
                  {report.officer?.name ?? "Not assigned"}
                </p>
                {report.officer?.email ? (
                  <p className="mt-1 text-xs text-muted-foreground">{report.officer.email}</p>
                ) : null}
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Created</p>
                <p className="mt-1 text-foreground">{formatDateTime(report.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Resolved</p>
                <p className="mt-1 text-foreground">
                  {report.resolvedAt ? formatDateTime(report.resolvedAt) : "Not resolved yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" />
                Audit Logs
              </CardTitle>
              <CardDescription>Recent system and admin log entries.</CardDescription>
            </CardHeader>
            <CardContent>
              {report.auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {report.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {log.user?.name ?? log.user?.email ?? "System"} - {log.entity}
                          {log.entityId ? ` ${log.entityId}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No audit logs recorded for this report yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
