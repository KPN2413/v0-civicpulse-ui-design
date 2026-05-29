import { v2 as cloudinary } from "cloudinary"

export const CLOUDINARY_REPORT_EVIDENCE_FOLDER = "civicpulse/report-evidence"

type CloudinaryCredentials = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

function getCloudinaryCredentials(): CloudinaryCredentials {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    )
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  }
}

export function createReportEvidenceUploadSignature() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()
  const timestamp = Math.round(Date.now() / 1000)
  const folder = CLOUDINARY_REPORT_EVIDENCE_FOLDER
  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    apiSecret
  )

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  }
}
