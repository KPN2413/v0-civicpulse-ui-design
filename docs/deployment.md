# Deployment Guide

CivicPulse is designed to deploy on Vercel with PostgreSQL, Clerk, Cloudinary, and Resend.

## Vercel Deployment Steps

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the package manager to pnpm.
4. Keep the existing build command: `pnpm build`.
5. Add all required environment variables in Vercel.
6. Run database migrations against the production database.
7. Redeploy after environment variables are added or changed.

## Required Environment Variables

### Clerk

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/role-redirect
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/role-redirect
```

### PostgreSQL and Prisma

```bash
DATABASE_URL=
```

Use the production database URL from the managed PostgreSQL provider. Run:

```bash
pnpm prisma migrate deploy
```

Use `pnpm prisma migrate dev` only for local development migrations.

### Cloudinary

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

The Cloudinary API secret is used only server-side to sign uploads. It must never be exposed in client code.

### Resend

```bash
RESEND_API_KEY=
EMAIL_FROM="CivicPulse <notifications@yourdomain.com>"
EMAIL_NOTIFICATIONS_ENABLED=true
```

Important: Resend's `onboarding@resend.dev` sender is for testing only. Production email should use a verified sending domain.

### App URL

```bash
NEXT_PUBLIC_APP_URL=
```

Set this to the deployed Vercel URL or custom production domain. It is used to build links in email notifications.

## Clerk Setup Notes

- Configure sign-in and sign-up routes to match the app routes.
- Store the user role in Clerk metadata as one of:
  - `CITIZEN`
  - `DEPARTMENT_OFFICER`
  - `ADMIN`
  - `SUPER_ADMIN`
- Confirm role redirects after deployment.

## Cloudinary Setup Notes

- Create a Cloudinary account.
- Add cloud name, API key, and API secret to Vercel.
- The app uses signed browser uploads for report evidence.
- If upload fails, verify the signature route can read the Cloudinary env vars.

## Resend Setup Notes

- Create a Resend account.
- Verify a sending domain.
- Create a server-side API key.
- Set `EMAIL_FROM` to a sender on the verified domain.
- Set `EMAIL_NOTIFICATIONS_ENABLED=true`.

Email sending is non-blocking. Core report workflows continue if email delivery fails.

## Common Troubleshooting

### Missing Environment Variables

Symptoms: build errors, upload signature errors, missing email delivery, or database connection failures.

Fix: confirm all required environment variables are present in the correct Vercel environment and redeploy.

### Email Not Sent

- Confirm `EMAIL_NOTIFICATIONS_ENABLED=true`.
- Confirm `RESEND_API_KEY` is present.
- Confirm `EMAIL_FROM` uses a verified sender in production.
- Check Vercel function logs for safe email error messages.

### Cloudinary Upload Issue

- Confirm all Cloudinary env vars are present.
- Confirm the user is authenticated before requesting upload signatures.
- Confirm selected files are images and within the 5 MB per-file limit.

### Database Connection Issue

- Confirm `DATABASE_URL`.
- Run `pnpm prisma migrate deploy`.
- Check provider SSL requirements.

### Clerk Role Redirect Issue

- Confirm Clerk metadata role matches the app enum.
- Confirm the user exists or can be synced through `getCurrentDbUser`.
- Visit `/role-redirect` after login to verify dashboard routing.
