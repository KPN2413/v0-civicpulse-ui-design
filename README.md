# CivicPulse - Smart City Public Issue Reporting and Resolution Platform

**Live Demo:** https://v0-civicpulse-ui-design-qiy4jz9nl-prakhars-projects-0908ad55.vercel.app/

CivicPulse is a full-stack civic operations platform for reporting, triaging, assigning, and resolving public infrastructure issues. It is designed as a realistic smart-city workflow system with citizen reporting, administrative review, officer visibility, SLA tracking, duplicate detection, media evidence, maps, audit trails, and notifications.

Built with Next.js App Router, Prisma, PostgreSQL, Clerk, Cloudinary, Resend, Tailwind CSS, shadcn/ui, and Vercel.

## Project Pitch

CivicPulse turns public issue reporting into an end-to-end civic workflow. Citizens can submit location-based reports with evidence, while admins and officers manage verification, assignment, SLA tracking, and resolution through role-based dashboards.

The project demonstrates production-style full-stack engineering: RBAC, real database workflows, signed media upload, duplicate detection, in-app notifications, transactional emails, and deployment-ready documentation.

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


## Future Improvements

- Vercel Cron for SLA warning and overdue email automation with a `CRON_SECRET`.
- Advanced GIS heatmaps and ward-level clustering.
- Department performance analytics and trend reporting.
- Public issue status page for transparent civic updates.
- Automated test coverage and CI expansion.
- More granular admin permission scopes.
