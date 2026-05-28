export type ReportLocationClusterInput = {
  id: string
  title: string
  category: string
  status: string
  priority: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

export type ReportLocationClusterReport = ReportLocationClusterInput & {
  latitude: number
  longitude: number
}

export type ReportLocationClusterCategory = {
  category: string
  count: number
}

export type ReportLocationCluster = {
  id: string
  centerLatitude: number
  centerLongitude: number
  reportCount: number
  reports: ReportLocationClusterReport[]
  topCategory: string | null
  categoryBreakdown: ReportLocationClusterCategory[]
  highestPriority: string
  representativeAddress: string | null
}

export type ReportLocationClusterOptions = {
  radiusMeters?: number
}

const DEFAULT_CLUSTER_RADIUS_METERS = 500
const EARTH_RADIUS_METERS = 6371000

const priorityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

function normalizePriority(priority: string) {
  return priority.trim().toLowerCase()
}

function getPriorityRank(priority: string) {
  return priorityRank[normalizePriority(priority)] ?? 0
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function isValidCoordinate(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

function calculateDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const deltaLatitude = toRadians(latitudeB - latitudeA)
  const deltaLongitude = toRadians(longitudeB - longitudeA)
  const fromLatitude = toRadians(latitudeA)
  const toLatitude = toRadians(latitudeB)

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function getValidReports(
  reports: readonly ReportLocationClusterInput[]
): ReportLocationClusterReport[] {
  return reports
    .filter(
      (report): report is ReportLocationClusterReport =>
        isValidCoordinate(report.latitude, report.longitude)
    )
    .slice()
    .sort(
      (a, b) =>
        a.latitude - b.latitude || a.longitude - b.longitude || a.id.localeCompare(b.id)
    )
}

function findParent(parents: number[], index: number): number {
  if (parents[index] !== index) {
    parents[index] = findParent(parents, parents[index])
  }

  return parents[index]
}

function unionReports(parents: number[], firstIndex: number, secondIndex: number) {
  const firstParent = findParent(parents, firstIndex)
  const secondParent = findParent(parents, secondIndex)

  if (firstParent === secondParent) return

  if (firstParent < secondParent) {
    parents[secondParent] = firstParent
  } else {
    parents[firstParent] = secondParent
  }
}

function getCategoryBreakdown(
  reports: readonly ReportLocationClusterReport[]
): ReportLocationClusterCategory[] {
  const categoryCounts = new Map<string, number>()

  reports.forEach((report) => {
    categoryCounts.set(report.category, (categoryCounts.get(report.category) ?? 0) + 1)
  })

  return Array.from(categoryCounts, ([category, count]) => ({ category, count })).sort(
    (a, b) => b.count - a.count || a.category.localeCompare(b.category)
  )
}

function getHighestPriority(reports: readonly ReportLocationClusterReport[]) {
  return reports.reduce((highestPriority, report) => {
    if (getPriorityRank(report.priority) > getPriorityRank(highestPriority)) {
      return report.priority
    }

    return highestPriority
  }, reports[0]?.priority ?? "low")
}

function getRepresentativeAddress(reports: readonly ReportLocationClusterReport[]) {
  const reportWithAddress = reports.find(
    (report) => typeof report.address === "string" && report.address.trim().length > 0
  )

  return reportWithAddress?.address?.trim() ?? null
}

function createCluster(reports: ReportLocationClusterReport[]): ReportLocationCluster {
  const centerLatitude =
    reports.reduce((total, report) => total + report.latitude, 0) / reports.length
  const centerLongitude =
    reports.reduce((total, report) => total + report.longitude, 0) / reports.length
  const categoryBreakdown = getCategoryBreakdown(reports)

  return {
    id: `cluster-${reports[0].id}`,
    centerLatitude,
    centerLongitude,
    reportCount: reports.length,
    reports,
    topCategory: categoryBreakdown[0]?.category ?? null,
    categoryBreakdown,
    highestPriority: getHighestPriority(reports),
    representativeAddress: getRepresentativeAddress(reports),
  }
}

export function getReportLocationClusters(
  reports: readonly ReportLocationClusterInput[],
  options: ReportLocationClusterOptions = {}
): ReportLocationCluster[] {
  const validReports = getValidReports(reports)
  const radiusMeters = Math.max(0, options.radiusMeters ?? DEFAULT_CLUSTER_RADIUS_METERS)

  if (validReports.length === 0) return []

  const parents = validReports.map((_, index) => index)

  for (let firstIndex = 0; firstIndex < validReports.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < validReports.length; secondIndex += 1) {
      const firstReport = validReports[firstIndex]
      const secondReport = validReports[secondIndex]
      const distanceMeters = calculateDistanceMeters(
        firstReport.latitude,
        firstReport.longitude,
        secondReport.latitude,
        secondReport.longitude
      )

      if (distanceMeters <= radiusMeters) {
        unionReports(parents, firstIndex, secondIndex)
      }
    }
  }

  const reportGroups = new Map<number, ReportLocationClusterReport[]>()

  validReports.forEach((report, index) => {
    const parent = findParent(parents, index)
    const group = reportGroups.get(parent)

    if (group) {
      group.push(report)
    } else {
      reportGroups.set(parent, [report])
    }
  })

  return Array.from(reportGroups.values())
    .map(createCluster)
    .sort(
      (a, b) =>
        b.reportCount - a.reportCount ||
        getPriorityRank(b.highestPriority) - getPriorityRank(a.highestPriority) ||
        a.centerLatitude - b.centerLatitude ||
        a.centerLongitude - b.centerLongitude ||
        a.id.localeCompare(b.id)
    )
}
