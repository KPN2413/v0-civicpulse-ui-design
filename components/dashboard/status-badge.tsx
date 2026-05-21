import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: "pending" | "verified" | "assigned" | "in-progress" | "resolved" | "rejected" | "overdue"
  className?: string
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  verified: {
    label: "Verified",
    className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  assigned: {
    label: "Assigned",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20 hover:bg-chart-5/20",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

type PriorityBadgeProps = {
  priority: "low" | "medium" | "high" | "critical"
  className?: string
}

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  high: {
    label: "High",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20 hover:bg-chart-3/20",
  },
  critical: {
    label: "Critical",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
