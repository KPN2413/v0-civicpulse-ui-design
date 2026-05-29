type EmailContent = {
  subject: string
  html: string
  text: string
}

type ReportSubmittedEmailInput = {
  citizenName?: string | null
  reportTitle: string
  reportId: string
  category: string
  priority: string
  status: string
  reportUrl?: string
}

type ReportStatusChangedEmailInput = {
  citizenName?: string | null
  reportTitle: string
  reportId: string
  previousStatus: string
  newStatus: string
  note?: string | null
  reportUrl?: string
}

type ReportResolvedEmailInput = {
  citizenName?: string | null
  reportTitle: string
  reportId: string
  resolutionNote?: string | null
  reportUrl?: string
}

type OfficerAssignedEmailInput = {
  officerName?: string | null
  reportTitle: string
  reportId: string
  category: string
  priority: string
  address?: string | null
  reportUrl?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatValue(value?: string | null, fallback = "Not provided") {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function renderDetail(label: string, value?: string | null) {
  return `
    <tr>
      <td style="padding: 6px 0; color: #64748b;">${escapeHtml(label)}</td>
      <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${escapeHtml(
        formatValue(value)
      )}</td>
    </tr>
  `
}

function renderLink(reportUrl?: string) {
  const url = formatValue(reportUrl, "")

  if (!url) return ""

  return `
    <p style="margin: 24px 0 0;">
      <a href="${escapeHtml(url)}" style="display: inline-block; border-radius: 6px; background: #0f172a; color: #ffffff; padding: 10px 14px; text-decoration: none; font-weight: 600;">
        View report
      </a>
    </p>
  `
}

function buildEmail({
  subject,
  greeting,
  intro,
  details,
  reportUrl,
  note,
}: {
  subject: string
  greeting: string
  intro: string
  details: Array<[string, string | null | undefined]>
  reportUrl?: string
  note?: string | null
}): EmailContent {
  const safeNote = formatValue(note, "")
  const html = `
    <div style="margin: 0; padding: 0; background: #f8fafc; font-family: Arial, sans-serif; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
        <div style="border-radius: 8px; background: #ffffff; border: 1px solid #e2e8f0; padding: 24px;">
          <p style="margin: 0 0 6px; color: #2563eb; font-weight: 700; letter-spacing: 0.02em;">CivicPulse</p>
          <h1 style="margin: 0 0 18px; font-size: 22px; line-height: 1.3;">${escapeHtml(
            subject
          )}</h1>
          <p style="margin: 0 0 14px;">${escapeHtml(greeting)}</p>
          <p style="margin: 0 0 20px; color: #334155; line-height: 1.6;">${escapeHtml(
            intro
          )}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
            <tbody>
              ${details.map(([label, value]) => renderDetail(label, value)).join("")}
            </tbody>
          </table>
          ${
            safeNote
              ? `<p style="margin: 16px 0 0; color: #334155; line-height: 1.6;"><strong>Note:</strong> ${escapeHtml(
                  safeNote
                )}</p>`
              : ""
          }
          ${renderLink(reportUrl)}
          <p style="margin: 28px 0 0; color: #64748b; font-size: 13px; line-height: 1.5;">
            This email was sent by CivicPulse. In-app notifications remain available in your account.
          </p>
        </div>
      </div>
    </div>
  `

  const textLines = [
    "CivicPulse",
    subject,
    "",
    greeting,
    intro,
    "",
    ...details.map(([label, value]) => `${label}: ${formatValue(value)}`),
    ...(safeNote ? ["", `Note: ${safeNote}`] : []),
    ...(reportUrl ? ["", `View report: ${reportUrl}`] : []),
  ]

  return {
    subject,
    html,
    text: textLines.join("\n"),
  }
}

export function reportSubmittedEmail(input: ReportSubmittedEmailInput) {
  return buildEmail({
    subject: "Report submitted",
    greeting: `Hi ${formatValue(input.citizenName, "there")},`,
    intro: "Your report has been submitted successfully and is now available in CivicPulse.",
    reportUrl: input.reportUrl,
    details: [
      ["Report", input.reportTitle],
      ["Report ID", input.reportId],
      ["Category", formatEnumLabel(input.category)],
      ["Priority", formatEnumLabel(input.priority)],
      ["Status", formatEnumLabel(input.status)],
    ],
  })
}

export function reportStatusChangedEmail(input: ReportStatusChangedEmailInput) {
  return buildEmail({
    subject: "Report status updated",
    greeting: `Hi ${formatValue(input.citizenName, "there")},`,
    intro: "There is an update on your CivicPulse report.",
    reportUrl: input.reportUrl,
    note: input.note,
    details: [
      ["Report", input.reportTitle],
      ["Report ID", input.reportId],
      ["Previous status", formatEnumLabel(input.previousStatus)],
      ["New status", formatEnumLabel(input.newStatus)],
    ],
  })
}

export function reportResolvedEmail(input: ReportResolvedEmailInput) {
  return buildEmail({
    subject: "Report resolved",
    greeting: `Hi ${formatValue(input.citizenName, "there")},`,
    intro: "Your CivicPulse report has been marked as resolved.",
    reportUrl: input.reportUrl,
    note: input.resolutionNote,
    details: [
      ["Report", input.reportTitle],
      ["Report ID", input.reportId],
      ["Status", "Resolved"],
    ],
  })
}

export function officerAssignedEmail(input: OfficerAssignedEmailInput) {
  return buildEmail({
    subject: "New report assigned",
    greeting: `Hi ${formatValue(input.officerName, "there")},`,
    intro: "A CivicPulse report has been assigned to you for review or action.",
    reportUrl: input.reportUrl,
    details: [
      ["Report", input.reportTitle],
      ["Report ID", input.reportId],
      ["Category", formatEnumLabel(input.category)],
      ["Priority", formatEnumLabel(input.priority)],
      ["Address", input.address],
    ],
  })
}
