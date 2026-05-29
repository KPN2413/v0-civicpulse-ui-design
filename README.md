# CivicPulse - Smart City Public Issue Reporting and Resolution Platform

**Live Demo:** https://v0-civicpulse-ui-design-qiy4jz9nl-prakhars-projects-0908ad55.vercel.app/

CivicPulse is a full-stack civic operations platform for reporting, triaging, assigning, and resolving public infrastructure issues. It is designed as a realistic smart-city workflow system with citizen reporting, administrative review, officer visibility, SLA tracking, duplicate detection, media evidence, maps, audit trails, and notifications.

Built with Next.js App Router, Prisma, PostgreSQL, Clerk, Cloudinary, Resend, Tailwind CSS, shadcn/ui, and Vercel.

## Project Pitch

CivicPulse turns public issue reporting into an end-to-end civic workflow. Citizens can submit location-based reports with evidence, while admins and officers manage verification, assignment, SLA tracking, and resolution through role-based dashboards.

The project demonstrates production-style full-stack engineering: RBAC, real database workflows, signed media upload, duplicate detection, in-app notifications, transactional emails, and deployment-ready documentation.

## Screenshots

Screenshots should be added to `public/screenshots` before sharing the repository publicly.

Recommended screenshots:

- `public/screenshots/citizen-report-form.png` - citizen report submission with map picker and evidence upload.
- `public/screenshots/admin-reports.png` - admin reports list with filters, SLA cards, map overview, and area insights.
- `public/screenshots/report-detail.png` - report detail page with timeline, SLA status, evidence, and location map.
- `public/screenshots/notifications.png` - in-app notifications with read/unread state.

No fake screenshots are included. Add real captures from the deployed app or local demo environment.

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Demo Script](docs/demo-script.md)
- [Testing Checklist](docs/testing-checklist.md)
- [Security Notes](docs/security.md)
- [Resume and Interview Notes](docs/resume-notes.md)
- [Project Presentation Notes](docs/project-presentation.md)
- [Email Notifications](docs/email-notifications.md)

## Feature Overview

### Authentication and Roles

- Clerk authentication with protected route groups.
- Role-based dashboards and navigation for Citizen, Department Officer, Admin, and Super Admin.
- Clerk role metadata synced into the database through the current-user helper.

### Citizen Reporting

- Citizen report submission with title, description, category, address, and map-selected coordinates.
- Leaflet/OpenStreetMap location picker.
- Image evidence upload through direct browser-to-Cloudinary signed uploads.
- Duplicate report warning flow with "submit anyway" confirmation.
- Citizen report list and detail pages backed by PostgreSQL.

### Admin and Officer Workflows

- Admin report management with real database-backed list and detail pages.
- Verify, assign/reassign, reject, and resolve report workflow actions.
- Department CRUD for civic team organization.
- Officer report pages scoped to relevant reports, avoiding global report exposure.
- Super Admin report pages inherit the Admin reports implementation where appropriate.

### Operational Intelligence

- SLA due dates based on report priority.
- SLA status badges, filters, summary cards, and dashboard overview.
- Multi-marker report map overview.
- Area insight clustering for mapped reports.
- Audit logs and status history for workflow accountability.

### Notifications

- In-app notifications with read/unread state and mark-as-read actions.
- Resend transactional email notifications for report submission and workflow updates.
- Email sending is non-blocking so report workflows continue if email delivery fails.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend/App | Server Components, Server Actions, Route Handlers |
| Auth | Clerk |
| Database/ORM | PostgreSQL, Prisma |
| Media | Cloudinary signed uploads |
| Email | Resend |
| Maps | Leaflet, OpenStreetMap |
| Deployment | Vercel |
| Tooling | pnpm, TypeScript, Prisma CLI |

## Architecture Overview

High-level report flow:

1. A citizen signs in and submits a report with issue details, location, and optional evidence.
2. The server checks for similar existing reports using category, text similarity, location distance, and report recency.
3. If potential duplicates exist, the citizen can review the warning and submit anyway.
4. The report is saved in PostgreSQL with SLA fields, status history, audit logs, and attachment metadata.
5. In-app notifications and Resend email notifications are triggered after the core workflow succeeds.
6. Admins verify, assign, reject, or resolve reports.
7. Officers see only reports relevant to their assignment or department scope.
8. Citizens can follow report status, evidence, maps, SLA state, and notifications.

See [docs/architecture.md](docs/architecture.md) for a deeper module and data-flow explanation.

## Role Breakdown

| Role | Capabilities |
| --- | --- |
| Citizen | Submit reports, select map location, upload evidence, review duplicate warnings, view own reports, receive notifications. |
| Department Officer | View officer-relevant reports, inspect report details, SLA status, evidence, maps, and notifications. |
| Admin | Manage departments, review reports, verify reports, assign/reassign departments, reject or resolve reports, view audit-oriented report detail. |
| Super Admin | Uses the admin report experience through shared pages and has separate super-admin dashboard/navigation areas. |

## Local Setup

Use pnpm only.

```bash
pnpm install
```

Create local environment variables based on `.env.example`.

```bash
pnpm prisma generate
```

For a new local database, run migrations with:

```bash
pnpm prisma migrate dev
```

For production or an already managed deployment database, use:

```bash
pnpm prisma migrate deploy
```

Start the development server:

```bash
pnpm dev
```

Validate before shipping:

```bash
pnpm lint
pnpm build
```

## Environment Variables

### Clerk

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/role-redirect
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/role-redirect
```

### Database

```bash
DATABASE_URL=
```

### Cloudinary

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Resend

```bash
RESEND_API_KEY=
EMAIL_FROM="CivicPulse <notifications@yourdomain.com>"
EMAIL_NOTIFICATIONS_ENABLED=true
```

### App URL

```bash
NEXT_PUBLIC_APP_URL=
```

## Production Deployment

1. Create a Vercel project from this repository.
2. Add all required environment variables in Vercel.
3. Configure Clerk authentication URLs and role metadata.
4. Provision PostgreSQL and set `DATABASE_URL`.
5. Run Prisma migrations against the production database.
6. Configure Cloudinary credentials for signed report evidence uploads.
7. Configure Resend with a verified sending domain and `EMAIL_FROM`.
8. Redeploy after changing environment variables.

See [docs/deployment.md](docs/deployment.md) for the full deployment guide.

## Manual Testing Checklist

- Sign in/sign up through Clerk.
- Confirm role redirects for Citizen, Officer, Admin, and Super Admin.
- Submit a citizen report with map location and no evidence.
- Submit a citizen report with image evidence.
- Trigger duplicate warning and confirm "submit anyway" still creates the report.
- Verify SLA badges and due date text on list/detail pages.
- Review report maps and area insights.
- Verify, assign/reassign, reject, and resolve reports as Admin.
- Confirm officers cannot see all reports.
- Confirm in-app notifications are created and can be marked read.
- Confirm Resend emails send when enabled.
- Run `pnpm lint` and `pnpm build`.

See [docs/testing-checklist.md](docs/testing-checklist.md) for a fuller checklist.

## Interview Highlights

- Production-style RBAC using Clerk metadata and protected routes.
- Real workflow state transitions with status history and audit logging.
- SLA tracking across report creation, list pages, detail pages, and dashboards.
- Duplicate detection using text, category, distance, and recency scoring.
- Direct-to-Cloudinary evidence upload to avoid Vercel function payload limits.
- Notification system with both in-app persistence and non-blocking email delivery.
- Map and area intelligence using Leaflet/OpenStreetMap and coordinate clustering.
- Prisma/PostgreSQL persistence with relation-backed report, user, department, audit, notification, and attachment models.

## Future Improvements

- Vercel Cron for SLA warning and overdue email automation with a `CRON_SECRET`.
- Advanced GIS heatmaps and ward-level clustering.
- Department performance analytics and trend reporting.
- Public issue status page for transparent civic updates.
- Automated test coverage and CI expansion.
- More granular admin permission scopes.
