# Testing Checklist

Use this checklist before demos, merges, or deployments.

## Auth Tests

- [ ] New user can sign up with Clerk.
- [ ] Existing user can sign in.
- [ ] Signed-out user is redirected away from protected routes.
- [ ] `/role-redirect` sends each role to the correct dashboard.

## Role Routing Tests

- [ ] Citizen cannot access admin routes.
- [ ] Officer cannot access admin routes.
- [ ] Admin cannot access citizen-only routes.
- [ ] Super Admin can access super-admin routes.
- [ ] Notifications page requires authentication.

## Citizen Report Tests

- [ ] Citizen can submit a report with required fields.
- [ ] Missing map location or invalid coordinates show a friendly validation message.
- [ ] Submitted report appears in citizen reports list.
- [ ] Citizen can open report detail page.
- [ ] Citizen cannot view another user's private report detail.

## Duplicate Detection Tests

- [ ] Unique report submits normally.
- [ ] Similar report with nearby coordinates triggers duplicate warning.
- [ ] Duplicate warning does not create a report immediately.
- [ ] "Submit anyway" creates the report.
- [ ] Editing report fields clears the duplicate warning and rechecks on submit.

## Map and Location Tests

- [ ] Citizen report map picker loads.
- [ ] Clicking map sets latitude and longitude.
- [ ] Moving marker updates selected coordinates.
- [ ] Report detail maps show read-only markers.
- [ ] Report list map overview displays only reports with valid coordinates.
- [ ] Area insights update with filtered report data.

## Evidence Upload Tests

- [ ] Report submits without evidence.
- [ ] Report submits with one image.
- [ ] Report submits with up to three images.
- [ ] Non-image files are rejected.
- [ ] Files larger than 5 MB are rejected.
- [ ] Duplicate-warning-only pass does not upload files.
- [ ] Evidence thumbnails appear on report detail pages.

## Admin Workflow Tests

- [ ] Admin can view all reports.
- [ ] Admin can verify submitted or reopened reports.
- [ ] Admin can assign or reassign department for non-final reports.
- [ ] Admin can reject a non-final report with a reason.
- [ ] Admin can resolve assigned or in-progress reports.
- [ ] Status history is created for workflow actions.
- [ ] Audit log rows are created for workflow actions.

## Officer Workflow Tests

- [ ] Officer reports page shows only relevant reports.
- [ ] Officer detail page does not expose unrelated reports.
- [ ] Officer can view report evidence, map, SLA state, and timeline.
- [ ] Officer does not receive admin-only workflow controls.

## SLA Tests

- [ ] New reports receive an SLA due date.
- [ ] High/critical reports use 24-hour SLA.
- [ ] Medium reports use 3-day SLA.
- [ ] Low reports use 7-day SLA.
- [ ] Resolved reports show resolved SLA state.
- [ ] Overdue reports show overdue state.
- [ ] SLA filters work on admin and officer report lists.
- [ ] Dashboard SLA summary cards render.

## In-App Notification Tests

- [ ] Citizen receives report submitted notification.
- [ ] Admin/Super Admin receives new report notification.
- [ ] Citizen receives workflow update notifications.
- [ ] Officer receives assignment notification when applicable.
- [ ] User can mark one notification as read.
- [ ] User can mark all notifications as read.

## Email Notification Tests

- [ ] `EMAIL_NOTIFICATIONS_ENABLED=false` skips email safely.
- [ ] Missing Resend config does not break report workflows.
- [ ] Citizen receives report submitted email when enabled.
- [ ] Citizen receives status update email when report is verified/assigned/rejected.
- [ ] Citizen receives resolved email when report is resolved.
- [ ] Officer receives assignment email when an officer is assigned.

## Build and Lint Checks

- [ ] `pnpm lint` passes.
- [ ] `pnpm build` passes.
- [ ] No `package-lock.json` or yarn lockfile is created.
