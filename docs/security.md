# Security Notes

This document summarizes the current security posture and practical hardening areas for CivicPulse.

## Authentication and Route Protection

CivicPulse uses Clerk for authentication. Protected routes are enforced in `proxy.ts` with Clerk middleware.

Protected route groups include:

- `/citizen`
- `/officer`
- `/admin`
- `/super-admin`
- `/notifications`
- `/settings`
- `/role-redirect`

## Role-Based Access Control

Roles are represented as:

- `CITIZEN`
- `DEPARTMENT_OFFICER`
- `ADMIN`
- `SUPER_ADMIN`

Route-level checks redirect users away from route groups that do not match their role. Server-side pages and actions also use the current database user where workflow-specific access matters.

## Server-Side Actions

Report creation, workflow updates, notifications, and mark-as-read operations run on the server. Server Actions validate authenticated users before mutating data.

Admin workflow actions restrict report updates to Admin and Super Admin users.

## Environment Variable Safety

Sensitive values must stay server-side:

- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`

Only values intentionally needed in the browser should use the `NEXT_PUBLIC_` prefix.

## Cloudinary Signed Upload Flow

Report evidence uploads use a signed Cloudinary upload route. The browser receives upload parameters, not the Cloudinary API secret. Image files upload directly to Cloudinary, and the report action stores only returned metadata.

Current validation includes:

- Image files only.
- Maximum 3 files.
- Maximum 5 MB per image.

## Resend Email Sending

Email sending is server-only through `lib/email.ts` and workflow helpers. The Resend API key is never exposed to the browser.

Email delivery is non-blocking. If configuration is missing or delivery fails, the report workflow still succeeds and logs a safe error.

## Audit Logs

Admin workflow actions write audit log records for important report state changes. Status history records are also created so report lifecycle changes can be inspected.

## Input Validation

The report submission action validates:

- Title length.
- Description length.
- Category.
- Address.
- Latitude and longitude ranges.
- Attachment metadata.

Workflow actions validate required IDs and reject invalid/final-state transitions.

## Current Limitations and Future Hardening

- Add rate limiting for report submission, notification actions, and upload signature requests.
- Expand automated test coverage for RBAC and workflow actions.
- Add stricter admin permission scopes if the team grows beyond Admin and Super Admin.
- Add a `CRON_SECRET` before implementing scheduled SLA jobs.
- Add monitoring and alerting for repeated Cloudinary or Resend failures.
- Review Clerk metadata management so production role changes are controlled by trusted admins only.
