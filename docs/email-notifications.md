# Email Notifications

CivicPulse uses Resend for transactional email notifications. Email sending is a secondary channel: in-app notifications remain the primary fallback, and report workflows continue even if email delivery fails.

## Required Environment Variables

```bash
RESEND_API_KEY=
EMAIL_FROM="CivicPulse <notifications@yourdomain.com>"
EMAIL_NOTIFICATIONS_ENABLED=true
NEXT_PUBLIC_APP_URL="https://your-civicpulse-domain.com"
```

`RESEND_API_KEY` must be configured only on the server. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Resend Setup

1. Create a Resend account.
2. Verify the sending domain you want to use.
3. Create a Resend API key.
4. Add the environment variables above locally and in Vercel.
5. Redeploy the Vercel project after adding production environment variables.

If `EMAIL_NOTIFICATIONS_ENABLED` is not set to `true`, email delivery is skipped. If Resend configuration is missing or an email send fails, the workflow logs a safe error and continues.
