import { ReportStatus } from "@/lib/generated/prisma/enums"

export type SlaState = "resolved" | "not-set" | "overdue" | "within"

export type SlaDisplay = {
  state: SlaState
  label: string
  timeText: string
  dueAt: Date | null
}

type SlaDisplayInput = {
  status: ReportStatus
  slaDueAt?: Date | string | null
  now?: Date
}

const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_HOURS = 24

function parseDate(value?: Date | string | null) {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function pluralize(value: number, unit: "hour" | "day") {
  return `${value} ${unit}${value === 1 ? "" : "s"}`
}

function formatSlaDuration(milliseconds: number) {
  const hours = Math.max(1, Math.ceil(milliseconds / HOUR_IN_MS))

  if (hours < DAY_IN_HOURS * 2) {
    return pluralize(hours, "hour")
  }

  return pluralize(Math.ceil(hours / DAY_IN_HOURS), "day")
}

export function getSlaDisplay({
  status,
  slaDueAt,
  now = new Date(),
}: SlaDisplayInput): SlaDisplay {
  const dueAt = parseDate(slaDueAt)

  if (status === ReportStatus.RESOLVED) {
    return {
      state: "resolved",
      label: "Resolved",
      timeText: "Report resolved",
      dueAt,
    }
  }

  if (!dueAt) {
    return {
      state: "not-set",
      label: "SLA not set",
      timeText: "No due date recorded",
      dueAt: null,
    }
  }

  const difference = dueAt.getTime() - now.getTime()

  if (difference < 0) {
    return {
      state: "overdue",
      label: "Overdue",
      timeText: `Overdue by ${formatSlaDuration(Math.abs(difference))}`,
      dueAt,
    }
  }

  return {
    state: "within",
    label: "Within SLA",
    timeText: `Due in ${formatSlaDuration(difference)}`,
    dueAt,
  }
}

export function getSlaBadgeClassName(state: SlaState) {
  const classes: Record<SlaState, string> = {
    resolved: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
    "not-set": "bg-muted text-muted-foreground border-border hover:bg-muted/80",
    overdue: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    within: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  }

  return classes[state]
}
