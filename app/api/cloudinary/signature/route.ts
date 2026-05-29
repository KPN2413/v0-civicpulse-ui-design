import { NextResponse } from "next/server"

import { createReportEvidenceUploadSignature } from "@/lib/cloudinary"
import { getCurrentDbUser } from "@/lib/current-user"

export const runtime = "nodejs"

export async function POST() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    return NextResponse.json({ error: "You must be signed in to upload evidence." }, { status: 401 })
  }

  try {
    return NextResponse.json(createReportEvidenceUploadSignature())
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Cloudinary is not configured for evidence uploads."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
