export type DuplicateDetectionInput = {
  title?: string | null
  description?: string | null
  category: string
  latitude: number
  longitude: number
  createdAt?: Date | string | null
}

export type DuplicateCandidateInput = DuplicateDetectionInput & {
  id: string
}

export type DuplicateScoreResult = {
  score: number
  classification: "LIKELY_DUPLICATE" | "POSSIBLE_DUPLICATE" | "UNLIKELY_DUPLICATE"
  distanceMeters: number
  textSimilarity: number
  categoryMatch: boolean
  reasons: string[]
}

export type DuplicateDetectionOptions = {
  radiusMeters?: number
  possibleDuplicateThreshold?: number
  likelyDuplicateThreshold?: number
  includeUnlikely?: boolean
  recentWindowDays?: number
  now?: Date | string
}

const DEFAULT_OPTIONS = {
  radiusMeters: 200,
  possibleDuplicateThreshold: 0.55,
  likelyDuplicateThreshold: 0.75,
  recentWindowDays: 14,
} as const

const EARTH_RADIUS_METERS = 6_371_000
const MS_PER_DAY = 24 * 60 * 60 * 1000

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function toDate(value?: Date | string | null) {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getReportText(report: Pick<DuplicateDetectionInput, "title" | "description">) {
  return [report.title, report.description]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
}

function normalizeCategory(category: string) {
  return normalizeText(category).replace(/\s+/g, "_")
}

function resolveOptions(options: DuplicateDetectionOptions) {
  const radiusMeters =
    typeof options.radiusMeters === "number" && options.radiusMeters > 0
      ? options.radiusMeters
      : DEFAULT_OPTIONS.radiusMeters

  const possibleDuplicateThreshold = clampScore(
    options.possibleDuplicateThreshold ?? DEFAULT_OPTIONS.possibleDuplicateThreshold
  )

  const likelyDuplicateThreshold = Math.max(
    possibleDuplicateThreshold,
    clampScore(options.likelyDuplicateThreshold ?? DEFAULT_OPTIONS.likelyDuplicateThreshold)
  )

  const recentWindowDays =
    typeof options.recentWindowDays === "number" && options.recentWindowDays > 0
      ? options.recentWindowDays
      : DEFAULT_OPTIONS.recentWindowDays

  return {
    radiusMeters,
    possibleDuplicateThreshold,
    likelyDuplicateThreshold,
    recentWindowDays,
    now: toDate(options.now) ?? new Date(),
  }
}

function getLocationScore(distanceMeters: number, radiusMeters: number) {
  if (!Number.isFinite(distanceMeters)) return 0
  if (distanceMeters <= radiusMeters) return 1
  if (distanceMeters > radiusMeters * 2) return 0

  return clampScore(1 - (distanceMeters - radiusMeters) / radiusMeters)
}

function getRecencyScore(
  inputCreatedAt: Date | string | null | undefined,
  candidateCreatedAt: Date | string | null | undefined,
  now: Date,
  recentWindowDays: number
) {
  const candidateDate = toDate(candidateCreatedAt)

  if (!candidateDate) return 0

  const referenceDate = toDate(inputCreatedAt) ?? now
  const diffDays = Math.abs(referenceDate.getTime() - candidateDate.getTime()) / MS_PER_DAY

  return clampScore(1 - diffDays / recentWindowDays)
}

function getClassification(
  score: number,
  possibleDuplicateThreshold: number,
  likelyDuplicateThreshold: number
): DuplicateScoreResult["classification"] {
  if (score >= likelyDuplicateThreshold) return "LIKELY_DUPLICATE"
  if (score >= possibleDuplicateThreshold) return "POSSIBLE_DUPLICATE"
  return "UNLIKELY_DUPLICATE"
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function tokenizeText(text: string): string[] {
  const normalized = normalizeText(text)

  if (!normalized) return []

  return normalized.split(" ").filter((token) => token.length > 1)
}

export function calculateTextSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenizeText(a))
  const tokensB = new Set(tokenizeText(b))

  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let intersection = 0

  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection += 1
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : clampScore(intersection / union)
}

export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) {
    return Number.POSITIVE_INFINITY
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

export function calculateDuplicateScore(
  input: DuplicateDetectionInput,
  candidate: DuplicateCandidateInput,
  options: DuplicateDetectionOptions = {}
): DuplicateScoreResult {
  const resolvedOptions = resolveOptions(options)
  const categoryMatch = normalizeCategory(input.category) === normalizeCategory(candidate.category)
  const distanceMeters = calculateDistanceMeters(
    input.latitude,
    input.longitude,
    candidate.latitude,
    candidate.longitude
  )
  const textSimilarity = calculateTextSimilarity(
    getReportText(input),
    getReportText(candidate)
  )
  const locationScore = getLocationScore(distanceMeters, resolvedOptions.radiusMeters)
  const recencyScore = getRecencyScore(
    input.createdAt,
    candidate.createdAt,
    resolvedOptions.now,
    resolvedOptions.recentWindowDays
  )
  const score = clampScore(
    (categoryMatch ? 0.3 : 0) +
      locationScore * 0.35 +
      textSimilarity * 0.25 +
      recencyScore * 0.1
  )
  const classification = getClassification(
    score,
    resolvedOptions.possibleDuplicateThreshold,
    resolvedOptions.likelyDuplicateThreshold
  )
  const reasons: string[] = []

  if (categoryMatch) {
    reasons.push("Same issue category")
  } else {
    reasons.push("Different issue category")
  }

  if (Number.isFinite(distanceMeters) && distanceMeters <= resolvedOptions.radiusMeters) {
    reasons.push(`Within ${Math.round(distanceMeters)}m of the candidate report`)
  } else if (Number.isFinite(distanceMeters)) {
    reasons.push(`Candidate is ${Math.round(distanceMeters)}m away`)
  } else {
    reasons.push("Candidate location could not be compared")
  }

  if (textSimilarity >= 0.5) {
    reasons.push("Report text is highly similar")
  } else if (textSimilarity >= 0.25) {
    reasons.push("Report text has some overlap")
  } else {
    reasons.push("Report text similarity is low")
  }

  if (recencyScore > 0) {
    reasons.push("Candidate report is recent")
  }

  return {
    score,
    classification,
    distanceMeters,
    textSimilarity,
    categoryMatch,
    reasons,
  }
}

export function findDuplicateCandidates<TCandidate extends DuplicateCandidateInput>(
  input: DuplicateDetectionInput,
  candidates: readonly TCandidate[],
  options: DuplicateDetectionOptions = {}
): Array<DuplicateScoreResult & { candidate: TCandidate }> {
  return candidates
    .map((candidate) => ({
      candidate,
      ...calculateDuplicateScore(input, candidate, options),
    }))
    .filter(
      (result) =>
        options.includeUnlikely || result.classification !== "UNLIKELY_DUPLICATE"
    )
    .sort((a, b) => b.score - a.score)
}
