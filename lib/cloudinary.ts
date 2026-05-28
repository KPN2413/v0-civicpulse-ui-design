import { v2 as cloudinary } from "cloudinary"

type CloudinaryUploadResult = {
  url: string
  publicId: string
}

const CLOUDINARY_FOLDER = "civicpulse/report-evidence"

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    )
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return cloudinary
}

export async function uploadReportEvidenceImage(file: File): Promise<CloudinaryUploadResult> {
  const client = getCloudinaryClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary upload did not return a valid image URL."))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    stream.end(buffer)
  })
}
