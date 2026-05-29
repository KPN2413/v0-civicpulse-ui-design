import { Resend } from "resend"

export type TransactionalEmailInput = {
  to?: string | string[] | null
  subject: string
  html: string
  text?: string
}

export type TransactionalEmailResult =
  | { ok: true; skipped?: false }
  | { ok: false; skipped: true; reason: "disabled" | "missing_config" | "missing_recipient" }
  | { ok: false; error: "email_send_failed" }

let resendClient: Resend | null = null

function getRecipients(to?: string | string[] | null) {
  const recipients = Array.isArray(to) ? to : to ? [to] : []

  return recipients
    .map((recipient) => recipient.trim())
    .filter((recipient) => recipient.length > 0)
}

function getResendClient(apiKey: string) {
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput
): Promise<TransactionalEmailResult> {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED !== "true") {
    return { ok: false, skipped: true, reason: "disabled" }
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "missing_config" }
  }

  const recipients = getRecipients(input.to)

  if (recipients.length === 0) {
    return { ok: false, skipped: true, reason: "missing_recipient" }
  }

  try {
    const result = await getResendClient(apiKey).emails.send({
      from,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })

    if (result.error) {
      console.error("Failed to send transactional email", {
        name: result.error.name,
        message: result.error.message,
      })

      return { ok: false, error: "email_send_failed" }
    }

    return { ok: true }
  } catch (error) {
    console.error("Failed to send transactional email", {
      message: error instanceof Error ? error.message : "Unknown email error",
    })

    return { ok: false, error: "email_send_failed" }
  }
}
