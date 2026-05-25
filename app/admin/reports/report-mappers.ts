import {
  IssueCategory,
  ReportPriority,
  ReportStatus,
} from "@/lib/generated/prisma/enums"

export type UiReportStatus =
  | "pending"
  | "verified"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "rejected"

export type UiReportPriority = "low" | "medium" | "high" | "critical"

export function statusToUi(status: ReportStatus): UiReportStatus {
  if (status === ReportStatus.VERIFIED) return "verified"
  if (status === ReportStatus.ASSIGNED) return "assigned"
  if (status === ReportStatus.IN_PROGRESS) return "in-progress"
  if (status === ReportStatus.RESOLVED) return "resolved"
  if (status === ReportStatus.REJECTED) return "rejected"
  return "pending"
}

export function priorityToUi(priority: ReportPriority): UiReportPriority {
  return priority.toLowerCase() as UiReportPriority
}

export function categoryToLabel(category: IssueCategory) {
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
