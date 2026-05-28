import { ExternalLink, Image as ImageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ReportEvidenceItem = {
  id: string
  url: string
  fileName?: string | null
  fileType?: string | null
  fileSize?: number | null
}

type ReportEvidenceGalleryProps = {
  evidence: ReportEvidenceItem[]
  className?: string
  showTitle?: boolean
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ReportEvidenceGallery({
  evidence,
  className,
  showTitle = true,
}: ReportEvidenceGalleryProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showTitle ? (
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Evidence</p>
        </div>
      ) : null}

      {evidence.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => {
            const fileSize = formatFileSize(item.fileSize)

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-lg border bg-background transition-colors hover:border-primary/50"
              >
                <img
                  src={item.url}
                  alt={item.fileName ? `Report evidence: ${item.fileName}` : "Report evidence"}
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.fileName ?? "Evidence image"}
                    </p>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.fileType ? (
                      <Badge variant="secondary">{item.fileType}</Badge>
                    ) : null}
                    {fileSize ? <Badge variant="outline">{fileSize}</Badge> : null}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 text-center">
          <div>
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No evidence uploaded</p>
          </div>
        </div>
      )}
    </div>
  )
}
