import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/citizen(.*)",
  "/officer(.*)",
  "/admin(.*)",
  "/super-admin(.*)",
  "/notifications(.*)",
  "/settings(.*)",
  "/role-redirect(.*)",
])

const isCitizenRoute = createRouteMatcher(["/citizen(.*)"])
const isOfficerRoute = createRouteMatcher(["/officer(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"])

type AppRole = "CITIZEN" | "DEPARTMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN"

function getRole(sessionClaims: unknown): AppRole {
  const claims = sessionClaims as {
    metadata?: { role?: AppRole }
    publicMetadata?: { role?: AppRole }
  }

  return claims?.metadata?.role || claims?.publicMetadata?.role || "CITIZEN"
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  const { sessionClaims } = await auth()
  const role = getRole(sessionClaims)

  if (isCitizenRoute(req) && role !== "CITIZEN") {
    return NextResponse.redirect(new URL("/role-redirect", req.url))
  }

  if (isOfficerRoute(req) && role !== "DEPARTMENT_OFFICER") {
    return NextResponse.redirect(new URL("/role-redirect", req.url))
  }

  if (isAdminRoute(req) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/role-redirect", req.url))
  }

  if (isSuperAdminRoute(req) && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/role-redirect", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}