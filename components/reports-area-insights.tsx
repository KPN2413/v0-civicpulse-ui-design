import { Layers, MapPin, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getReportLocationClusters,
  type ReportLocationCluster,
  type ReportLocationClusterInput,
} from "@/lib/report-location-clusters"
import { cn } from "@/lib/utils"

type ReportsAreaInsightsProps = {
  reports: readonly ReportLocationClusterInput[]
  className?: string
}

const priorityStyles: Record<string, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium: "border-warning/20 bg-warning/10 text-warning",
  high: "border-chart-3/20 bg-chart-3/10 text-chart-3",
  critical: "border-destructive/20 bg-destructive/10 text-destructive",
}

const priorityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatCoordinate(value: number) {
  return value.toFixed(4)
}

function getPriorityRank(priority: string) {
  return priorityRank[priority.trim().toLowerCase()] ?? 0
}

function getPriorityClassName(priority: string) {
  return priorityStyles[priority.trim().toLowerCase()] ?? "border-border text-muted-foreground"
}

function getAreaLabel(cluster: ReportLocationCluster) {
  return (
    cluster.representativeAddress ??
    `Area near ${formatCoordinate(cluster.centerLatitude)}, ${formatCoordinate(
      cluster.centerLongitude
    )}`
  )
}

function formatCategoryCount(count: number) {
  return `${count} ${count === 1 ? "category" : "categories"}`
}

function getHighestPriorityCluster(clusters: readonly ReportLocationCluster[]) {
  return clusters.reduce<ReportLocationCluster | null>((highestCluster, cluster) => {
    if (!highestCluster) return cluster

    const clusterRank = getPriorityRank(cluster.highestPriority)
    const highestRank = getPriorityRank(highestCluster.highestPriority)

    if (clusterRank !== highestRank) {
      return clusterRank > highestRank ? cluster : highestCluster
    }

    if (cluster.reportCount !== highestCluster.reportCount) {
      return cluster.reportCount > highestCluster.reportCount ? cluster : highestCluster
    }

    return cluster.id.localeCompare(highestCluster.id) < 0 ? cluster : highestCluster
  }, null)
}

export function ReportsAreaInsights({ reports, className }: ReportsAreaInsightsProps) {
  const clusters = getReportLocationClusters(reports)
  const mappedReportCount = clusters.reduce((total, cluster) => total + cluster.reportCount, 0)
  const highestPriorityCluster = getHighestPriorityCluster(clusters)
  const topClusters = clusters.slice(0, 4)

  if (clusters.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex min-h-[180px] items-center justify-center p-6 text-center">
          <div>
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No area insights available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Area Insights
        </CardTitle>
        <CardDescription>
          Nearby report groups based on mapped locations in the current filtered view.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Active report areas</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{clusters.length}</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Mapped reports</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{mappedReportCount}</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Highest priority area</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={getPriorityClassName(highestPriorityCluster?.highestPriority ?? "")}
              >
                {formatLabel(highestPriorityCluster?.highestPriority ?? "Not set")}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {highestPriorityCluster
                  ? `${highestPriorityCluster.reportCount} report${
                      highestPriorityCluster.reportCount === 1 ? "" : "s"
                    }`
                  : "No mapped reports"}
              </span>
            </div>
            {highestPriorityCluster ? (
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                {getAreaLabel(highestPriorityCluster)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {topClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {cluster.reportCount} report{cluster.reportCount === 1 ? "" : "s"}
                  </span>
                  <Badge variant="secondary">
                    {cluster.topCategory ? formatLabel(cluster.topCategory) : "Mixed categories"}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {getAreaLabel(cluster)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getPriorityClassName(cluster.highestPriority)}
                >
                  {formatLabel(cluster.highestPriority)}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {formatCategoryCount(cluster.categoryBreakdown.length)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
