import {
  officerAssignedEmail,
  reportResolvedEmail,
  reportStatusChangedEmail,
  reportSubmittedEmail,
} from "@/lib/email-templates"
import { sendTransactionalEmail } from "@/lib/email"

type EmailUser = {
  email?: string | null
  name?: string | null
}

type EmailReport = {
  id: string
  title: string
  category: string
  priority: string
  status: string
  address?: string | null
}

function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ?? ""
}

function buildReportUrl(path: string) {
  const baseUrl = getAppBaseUrl()

  return baseUrl ? `${baseUrl}${path}` : path
}

async function sendReportEmail({
  to,
  subject,
  html,
  text,
  context,
}: {
  to?: string | null
  subject: string
  html: string
  text: string
  context: string
}) {
  try {
    return await sendTransactionalEmail({
      to,
      subject,
      html,
      text,
    })
  } catch (error) {
    console.error(`Failed to send ${context} email`, {
      message: error instanceof Error ? error.message : "Unknown email error",
    })

    return { ok: false as const, error: "email_send_failed" as const }
  }
}

export function getCitizenReportEmailUrl(reportId: string) {
  return buildReportUrl(`/citizen/reports/${reportId}`)
}

export function getOfficerReportEmailUrl(reportId: string) {
  return buildReportUrl(`/officer/reports/${reportId}`)
}

export async function sendReportSubmittedEmail({
  report,
  citizen,
}: {
  report: EmailReport
  citizen: EmailUser
}) {
  const email = reportSubmittedEmail({
    citizenName: citizen.name,
    reportTitle: report.title,
    reportId: report.id,
    category: report.category,
    priority: report.priority,
    status: report.status,
    reportUrl: getCitizenReportEmailUrl(report.id),
  })

  return sendReportEmail({
    to: citizen.email,
    context: "report submitted",
    ...email,
  })
}

export async function sendReportStatusChangedEmail({
  report,
  citizen,
  previousStatus,
  newStatus,
  note,
}: {
  report: EmailReport
  citizen: EmailUser
  previousStatus: string
  newStatus: string
  note?: string | null
}) {
  const email = reportStatusChangedEmail({
    citizenName: citizen.name,
    reportTitle: report.title,
    reportId: report.id,
    previousStatus,
    newStatus,
    note,
    reportUrl: getCitizenReportEmailUrl(report.id),
  })

  return sendReportEmail({
    to: citizen.email,
    context: "report status changed",
    ...email,
  })
}

export async function sendReportResolvedEmail({
  report,
  citizen,
  resolutionNote,
}: {
  report: EmailReport
  citizen: EmailUser
  resolutionNote?: string | null
}) {
  const email = reportResolvedEmail({
    citizenName: citizen.name,
    reportTitle: report.title,
    reportId: report.id,
    resolutionNote,
    reportUrl: getCitizenReportEmailUrl(report.id),
  })

  return sendReportEmail({
    to: citizen.email,
    context: "report resolved",
    ...email,
  })
}

export async function sendOfficerAssignedEmail({
  report,
  officer,
}: {
  report: EmailReport
  officer: EmailUser
}) {
  const email = officerAssignedEmail({
    officerName: officer.name,
    reportTitle: report.title,
    reportId: report.id,
    category: report.category,
    priority: report.priority,
    address: report.address,
    reportUrl: getOfficerReportEmailUrl(report.id),
  })

  return sendReportEmail({
    to: officer.email,
    context: "officer assignment",
    ...email,
  })
}
