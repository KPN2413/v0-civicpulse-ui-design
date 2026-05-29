# Resume and Interview Notes

## Resume Bullets

- Built CivicPulse, a full-stack smart city issue reporting platform with Clerk RBAC, Prisma/PostgreSQL persistence, role-specific dashboards, and production-style report workflows.
- Implemented civic operations features including SLA tracking, duplicate report detection, audit logs, in-app notifications, Resend email notifications, and Cloudinary evidence uploads.
- Designed map-based reporting with Leaflet/OpenStreetMap location selection, report location maps, multi-marker overviews, and area insight clustering.

## Short Project Explanation

CivicPulse is a smart city public issue reporting and resolution platform. Citizens submit issues with map locations and image evidence, while admins and officers manage the lifecycle through verified, assigned, rejected, and resolved states. The app includes SLA tracking, duplicate warnings, audit logs, notifications, email updates, and map-based area insights.

## Technical Deep Dive

The app uses Next.js App Router with Server Components, Server Actions, and Route Handlers. Clerk handles authentication and role metadata, while Prisma maps users, reports, departments, attachments, audit logs, status history, and notifications into PostgreSQL.

Report submission validates form data, checks for duplicates, calculates an SLA due date, stores the report, and triggers notifications after the database write succeeds. Evidence uploads use signed Cloudinary browser uploads so image binaries never pass through Server Actions. Admin workflow actions run through Prisma transactions to update status, write status history, and write audit logs. Email notifications use Resend server-side helpers and are intentionally non-blocking.

## Interview Questions and Answers

### 1. What problem does CivicPulse solve?

It gives citizens a structured way to report public issues and gives civic teams a workflow to review, assign, track, and resolve those reports.

### 2. Why did you use role-based access control?

The product has different users with different responsibilities. Citizens should see their reports, officers should see relevant reports, and admins should manage workflows and departments.

### 3. How does duplicate detection work?

It compares new submissions against recent reports using category match, location distance, text similarity, and recency, then shows a warning without permanently blocking submission.

### 4. How is SLA tracking implemented?

Reports receive an `slaDueAt` based on priority. Shared helpers classify reports as within SLA, overdue, resolved, or not set for list pages, detail pages, and dashboards.

### 5. Why did you use direct Cloudinary uploads?

Direct uploads avoid sending image binaries through Server Actions and keep Vercel function payloads small. The server signs the upload and stores returned metadata.

### 6. How do notifications work?

In-app notifications are persisted in PostgreSQL and scoped to a recipient user. Email notifications are sent through Resend as a secondary, non-blocking channel.

### 7. How do you keep workflows auditable?

Workflow actions create `ReportStatusHistory` and `AuditLog` records so report changes can be reviewed later.

### 8. What was a production concern you handled?

The evidence upload architecture avoids Server Action body limits by uploading directly to Cloudinary before sending metadata to the server.

### 9. What would you improve next?

I would add Vercel Cron for overdue SLA emails, automated tests, stronger analytics, and more granular admin permission scopes.

### 10. What part best demonstrates full-stack skill?

The report lifecycle combines frontend UX, server validation, database relations, workflow transactions, media uploads, notifications, email, and role-based access control.
