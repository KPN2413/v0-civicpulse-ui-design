import {
  calculateDuplicateScore,
  findDuplicateCandidates,
  type DuplicateDetectionInput,
  type DuplicateScoreResult,
} from "@/lib/duplicate-detection"
import {
  type IssueCategory as IssueCategoryType,
  type ReportPriority,
  ReportStatus,
  type ReportStatus as ReportStatusType,
} from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

export type ReportDuplicateCandidate = {
  id: string
  title: string
  description: string
  category: IssueCategoryType
  status: ReportStatusType
  priority: ReportPriority
  latitude: number
  longitude: number
  createdAt: Date
  score: number
  classification: DuplicateScoreResult["classification"]
  distanceMeters: number
  textSimilarity: number
  categoryMatch: boolean
  reasons: string[]
}

export type FindPotentialDuplicateReportsOptions = {
  limit?: number
  lookbackDays?: number
  radiusMeters?: number
  includeUnlikely?: boolean
  excludeReportId?: string
}

const DEFAULT_LIMIT = 5
const DEFAULT_LOOKBACK_DAYS = 30
const DEFAULT_RADIUS_METERS = 200
const MAX_LIMIT = 25
const METERS_PER_DEGREE_LATITUDE = 111_320

function getBoundedNumber(value: number | undefined, fallback: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback
  }

  return Math.min(Math.floor(value), max)
}

function getLookbackDate(lookbackDays: number) {
  return new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
}

function getBoundingBox(latitude: number, longitude: number, radiusMeters: number) {
  if (![latitude, longitude, radiusMeters].every(Number.isFinite)) {
    return null
  }

  const latDelta = radiusMeters / METERS_PER_DEGREE_LATITUDE
  const lngScale = Math.cos((latitude * Math.PI) / 180)
  const lngDelta =
    Math.abs(lngScale) < 0.0001 ? 180 : radiusMeters / (METERS_PER_DEGREE_LATITUDE * lngScale)

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - Math.abs(lngDelta),
    maxLng: longitude + Math.abs(lngDelta),
  }
}

export async function findPotentialDuplicateReports(
  input: DuplicateDetectionInput,
  options: FindPotentialDuplicateReportsOptions = {}
): Promise<ReportDuplicateCandidate[]> {
  const limit = getBoundedNumber(options.limit, DEFAULT_LIMIT, MAX_LIMIT)
  const lookbackDays = getBoundedNumber(
    options.lookbackDays,
    DEFAULT_LOOKBACK_DAYS,
    365
  )
  const radiusMeters =
    typeof options.radiusMeters === "number" && options.radiusMeters > 0
      ? options.radiusMeters
      : DEFAULT_RADIUS_METERS
  const queryRadiusMeters = radiusMeters * 2
  const boundingBox = getBoundingBox(input.latitude, input.longitude, queryRadiusMeters)
  const scoringOptions = {
    radiusMeters,
    includeUnlikely: options.includeUnlikely,
    recentWindowDays: lookbackDays,
  }

  const reports = await prisma.report.findMany({
    where: {
      ...(options.excludeReportId
        ? {
            id: {
              not: options.excludeReportId,
            },
          }
        : {}),
      createdAt: {
        gte: getLookbackDate(lookbackDays),
      },
      status: {
        notIn: [ReportStatus.RESOLVED, ReportStatus.REJECTED],
      },
      ...(boundingBox
        ? {
            latitude: {
              gte: boundingBox.minLat,
              lte: boundingBox.maxLat,
            },
            longitude: {
              gte: boundingBox.minLng,
              lte: boundingBox.maxLng,
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: Math.max(limit * 10, 50),
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      priority: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  })

  const scoredCandidates = findDuplicateCandidates(
    input,
    reports.map((report) => ({
      id: report.id,
      title: report.title,
      description: report.description,
      category: report.category,
      latitude: report.latitude,
      longitude: report.longitude,
      createdAt: report.createdAt,
      report,
    })),
    scoringOptions
  )

  return scoredCandidates.slice(0, limit).map(({ candidate }) => {
    const scoreResult = calculateDuplicateScore(input, candidate, scoringOptions)

    return {
      id: candidate.report.id,
      title: candidate.report.title,
      description: candidate.report.description,
      category: candidate.report.category,
      status: candidate.report.status,
      priority: candidate.report.priority,
      latitude: candidate.report.latitude,
      longitude: candidate.report.longitude,
      createdAt: candidate.report.createdAt,
      score: scoreResult.score,
      classification: scoreResult.classification,
      distanceMeters: scoreResult.distanceMeters,
      textSimilarity: scoreResult.textSimilarity,
      categoryMatch: scoreResult.categoryMatch,
      reasons: scoreResult.reasons,
    }
  })
}
