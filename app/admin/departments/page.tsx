import { DepartmentsClient, type DepartmentRow } from "./departments-client"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function getWorkload(assignedReports: number): DepartmentRow["workload"] {
  if (assignedReports >= 40) return "high"
  if (assignedReports >= 15) return "medium"
  return "low"
}

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      reports: {
        select: {
          id: true,
          status: true,
          priority: true,
          createdAt: true,
          resolvedAt: true,
        },
      },
    },
  })

  const departmentRows: DepartmentRow[] = departments.map((department) => {
    const assignedReports = department.reports.length

    const inProgress = department.reports.filter((report) =>
      ["ASSIGNED", "IN_PROGRESS"].includes(report.status)
    ).length

    const overdue = department.reports.filter((report) => {
      if (report.status === "RESOLVED" || report.status === "REJECTED") {
        return false
      }

      const ageInMs = Date.now() - report.createdAt.getTime()
      const ageInDays = ageInMs / (1000 * 60 * 60 * 24)

      if (report.priority === "HIGH" || report.priority === "CRITICAL") {
        return ageInDays > 1
      }

      if (report.priority === "MEDIUM") {
        return ageInDays > 3
      }

      return ageInDays > 7
    }).length

    const resolvedThisMonth = department.reports.filter((report) => {
      if (!report.resolvedAt) return false

      const now = new Date()

      return (
        report.resolvedAt.getMonth() === now.getMonth() &&
        report.resolvedAt.getFullYear() === now.getFullYear()
      )
    }).length

    return {
      id: department.id,
      name: department.name,
      description: department.description ?? "No description provided.",
      assignedReports,
      inProgress,
      overdue,
      resolvedThisMonth,
      avgResolutionTime: "N/A",
      status: department.status === "ACTIVE" ? "active" : "inactive",      workload: getWorkload(assignedReports),
    }
  })

  return <DepartmentsClient departments={departmentRows} />
}