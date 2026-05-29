# Demo Script

This script is designed for a 5-7 minute recruiter or interviewer walkthrough.

## 60-Second Project Pitch

CivicPulse is a smart city civic operations platform for reporting and resolving public issues. Citizens can submit issues with evidence and map locations, while admins and officers manage the operational workflow through role-based dashboards. The system includes duplicate detection, SLA tracking, audit logs, in-app notifications, email notifications, and map-based area insights, making it closer to a real municipal operations tool than a simple complaint form.

## 5-7 Minute Demo Flow

1. Sign in as a citizen.
   - Show Clerk authentication and role-based redirect.
   - Land on the citizen dashboard.

2. Submit a report.
   - Enter title, description, category, and address.
   - Select the issue location on the map.
   - Attach image evidence.
   - Submit the report.

3. Show duplicate warning.
   - Submit a similar report if seed data or existing reports make this possible.
   - Explain that duplicate detection compares location, category, text similarity, and recency.
   - Show that the user can still submit anyway.

4. Show citizen report detail.
   - Open the new report.
   - Point out status, priority, SLA due date/state, evidence gallery, map, and timeline.

5. Switch to admin.
   - Open admin reports.
   - Show filters, SLA summary cards, report map overview, and area insights.
   - Open the submitted report detail page.

6. Run admin workflow.
   - Verify the report.
   - Assign or reassign the department.
   - For a separate test report, reject with a reason.
   - For an assigned/in-progress test report, resolve it.
   - Point out status history and audit log entries.

7. Show officer view.
   - Sign in as a department officer.
   - Show that officer reports are scoped to relevant reports, not all reports.
   - Open an assigned/relevant report detail page.

8. Show notifications.
   - Open `/notifications`.
   - Show unread/read state and mark-as-read actions.
   - Mention that Resend email notifications are also sent when enabled.

9. Close with credibility features.
   - RBAC, audit logs, non-blocking email delivery, signed media upload, SLA tracking, and duplicate detection.

## 2-Minute Technical Explanation

CivicPulse uses Next.js App Router with Server Components and Server Actions. Clerk handles authentication and role metadata, while `getCurrentDbUser` syncs authenticated users into PostgreSQL through Prisma. Reports are persisted with status history, audit logs, attachments, SLA fields, and notification records.

On report submission, the server validates input, checks for duplicate candidates, calculates SLA due dates, saves the report, and triggers in-app and email notifications. Image evidence uploads directly from the browser to Cloudinary through signed upload parameters, so large files do not pass through Server Actions. Admin workflows update report status inside transactions and create audit/history records. Officer pages enforce scoped report visibility so officers do not see all reports.

## Likely Interview Questions

### Why is this more than CRUD?

It includes role-based workflows, duplicate detection, SLA tracking, audit logs, media upload, notifications, maps, and operational views for different civic roles.

### How do you prevent officers from seeing every report?

Officer report pages use the current database user and scoped report queries. If a report is not relevant to the officer, detail pages return safely instead of exposing the data.

### Why upload directly to Cloudinary?

Direct browser-to-Cloudinary uploads avoid Server Action body limits and Vercel function payload limits. The server receives only signed metadata.

### How are email failures handled?

Email helpers never throw into core workflows. Failures are logged safely, while report submission and workflow updates continue.

### What would you improve next?

I would add Vercel Cron for SLA warning/overdue automation, automated tests, more granular permissions, and richer analytics.
