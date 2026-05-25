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

import {
  assignDepartmentAction,
  rejectReportAction,
  resolveReportAction,
  verifyReportAction,
} from "./actions"
import { categoryToLabel, priorityToUi, statusToUi } from "../report-mappers"

import { PriorityBadge, StatusBadge } from "@/components/dashboard/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { prisma } from "@/lib/prisma"
import { DepartmentStatus, ReportStatus } from "@/lib/generated/prisma/enums"
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

export default async function AdminReportReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [report, activeDepartments] = await Promise.all([
    prisma.report.findUnique({
      where: {
        id,
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
    }),
    prisma.department.findMany({
      where: {
        status: DepartmentStatus.ACTIVE,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  if (!report) {
    notFound()
  }

  const isFinalReport =
    report.status === ReportStatus.REJECTED || report.status === ReportStatus.RESOLVED

  const canVerify =
    report.status === ReportStatus.SUBMITTED || report.status === ReportStatus.REOPENED

  const canResolve =
    report.status === ReportStatus.ASSIGNED || report.status === ReportStatus.IN_PROGRESS

  const sla = getSlaDisplay({
    status: report.status,
    slaDueAt: report.slaDueAt,
  })

  const selectedActiveDepartment = activeDepartments.some(
    (department) => department.id === report.departmentId
  )
    ? report.departmentId ?? undefined
    : undefined

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="../" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Reports
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
                    Complete information about the reported issue.
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
                  Issue Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.images.length > 0 ? (
                  <div className="grid gap-3">
                    {report.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="Report evidence"
                        className="aspect-video w-full rounded-lg border object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No images uploaded for this report.
                      </p>
                    </div>
                  </div>
                )}
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
                <div className="relative flex aspect-video items-center justify-center rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive shadow-lg">
                        <MapPin className="h-5 w-5 text-destructive-foreground" />
                      </div>
                      <div className="mt-1 h-4 w-0.5 bg-destructive" />
                    </div>
                  </div>
                  <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    Map placeholder
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {report.address ?? "Location not provided"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Lat: {report.latitude}</span>
                    <span>Long: {report.longitude}</span>
                  </div>
                </div>
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
                Workflow Actions
              </CardTitle>
              <CardDescription>
                Update report review, assignment, rejection, or resolution status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFinalReport ? (
                <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  This report is final and no workflow actions are available.
                </p>
              ) : (
                <>
                  {canVerify ? (
                    <form action={verifyReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <Button type="submit" className="w-full gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Verify Report
                      </Button>
                    </form>
                  ) : null}

                  <form action={assignDepartmentAction} className="space-y-3">
                    <input type="hidden" name="reportId" value={report.id} />
                    <div className="space-y-2">
                      <Label htmlFor="departmentId">Department</Label>
                      <Select
                        name="departmentId"
                        defaultValue={selectedActiveDepartment}
                        disabled={activeDepartments.length === 0}
                      >
                        <SelectTrigger id="departmentId">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDepartments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {activeDepartments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No active departments are available.
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full gap-2"
                      disabled={activeDepartments.length === 0}
                    >
                      <Building2 className="h-4 w-4" />
                      {report.departmentId ? "Reassign Department" : "Assign Department"}
                    </Button>
                  </form>

                  {canResolve ? (
                    <form action={resolveReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <Button type="submit" className="w-full gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Resolve Report
                      </Button>
                    </form>
                  ) : null}

                  <form action={rejectReportAction} className="space-y-3 border-t pt-4">
                    <input type="hidden" name="reportId" value={report.id} />
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reject Reason</Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        placeholder="Explain why this report is being rejected..."
                        rows={3}
                        required
                      />
                    </div>
                    <Button type="submit" variant="destructive" className="w-full">
                      Reject Report
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

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
