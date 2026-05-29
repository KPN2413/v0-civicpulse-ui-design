# Project Presentation Notes

Use this file for GitHub repository metadata, LinkedIn posts, resume tailoring, and interview prep.

## GitHub Repository Description Suggestion

Smart city public issue reporting platform built with Next.js, Prisma, PostgreSQL, Clerk, Cloudinary, Resend, maps, SLA tracking, duplicate detection, RBAC dashboards, and notifications.

## LinkedIn-Ready Project Summary

I built CivicPulse, a full-stack smart city public issue reporting and resolution platform. Citizens can submit reports with map-selected locations and image evidence, while admins and department officers manage verification, assignment, SLA tracking, and resolution through role-based dashboards.

The project includes PostgreSQL/Prisma workflows, duplicate report detection, Cloudinary signed uploads, in-app notifications, Resend email notifications, audit logs, and deployment-focused documentation for Vercel.

## Resume Bullets

- Built CivicPulse, a CivicTech smart city issue reporting platform with role-based dashboards for citizens, department officers, admins, and super admins.
- Implemented PostgreSQL/Prisma report workflows covering submission, verification, department assignment, rejection, resolution, status history, and audit logs.
- Added SLA tracking with priority-based due dates, SLA badges, filters, summary cards, and dashboard-level visibility.
- Developed duplicate report detection using category matching, text similarity, location distance, and recency scoring while preserving user confirmation flow.
- Integrated map-based reporting with Leaflet/OpenStreetMap location selection, read-only report maps, multi-marker overviews, and area insight clustering.
- Added Cloudinary evidence uploads, in-app notifications, Resend email notifications, and production-ready documentation for Vercel deployment.

## Short Interview Pitch

CivicPulse is a production-style civic operations platform for reporting and resolving public infrastructure issues. It combines citizen reporting, admin workflows, officer visibility, SLA tracking, duplicate detection, evidence upload, maps, audit logs, and notifications in one full-stack application.

## Technical Pitch

The application uses Next.js App Router with Server Components, Server Actions, and Route Handlers. Clerk handles authentication and role metadata, while Prisma persists users, departments, reports, attachments, status history, audit logs, and notifications in PostgreSQL.

Report submission validates user input, checks for possible duplicates, calculates SLA due dates, stores report data, and triggers non-blocking notifications. Evidence uploads directly from the browser to Cloudinary using signed upload parameters, keeping large image files out of Server Action payloads. Admin workflow actions preserve status history and audit logs, while officer pages enforce scoped report visibility.

## Tech Stack Summary

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: Server Components, Server Actions, Route Handlers.
- Auth: Clerk with role-based routing.
- Database: PostgreSQL with Prisma.
- Media: Cloudinary signed upload flow.
- Email: Resend transactional email.
- Maps: Leaflet and OpenStreetMap.
- Deployment: Vercel.

## Suggested GitHub Topics

- nextjs
- typescript
- prisma
- postgresql
- clerk
- cloudinary
- resend
- civictech
- smart-city
- tailwindcss
- leaflet
