"use client"

import { useRef, useState, useTransition } from "react"
import {
  MapPin,
  Upload,
  Info,
  AlertTriangle,
  FileText,
  Camera,
  Navigation,
  CheckCircle2,
} from "lucide-react"

import { createReportAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/dashboard/status-badge"

const categories = [
  { value: "road-damage", label: "Road Damage" },
  { value: "garbage-overflow", label: "Garbage Overflow" },
  { value: "street-light-failure", label: "Street Light Failure" },
  { value: "water-leakage", label: "Water Leakage" },
  { value: "drainage-problem", label: "Drainage Problem" },
  { value: "public-safety", label: "Public Safety" },
  { value: "other", label: "Other" },
]

type DuplicateWarningReport = {
  title: string
  category: string
  status: "pending" | "verified" | "assigned" | "in-progress" | "resolved" | "rejected"
  classification: "LIKELY_DUPLICATE" | "POSSIBLE_DUPLICATE" | "UNLIKELY_DUPLICATE"
  score: number
  distanceMeters: number
  reasons: string[]
}

const classificationLabels: Record<DuplicateWarningReport["classification"], string> = {
  LIKELY_DUPLICATE: "Likely duplicate",
  POSSIBLE_DUPLICATE: "Possible duplicate",
  UNLIKELY_DUPLICATE: "Unlikely duplicate",
}

function formatDistance(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters)) return "Distance unavailable"

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m away`
  }

  return `${(distanceMeters / 1000).toFixed(1)}km away`
}

function formatScore(score: number) {
  return `${Math.round(score * 100)}% match`
}

export default function ReportIssuePage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarningReport[] | null>(null)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const clearDuplicateWarningOnEdit = () => {
    if (duplicateWarning) {
      setDuplicateWarning(null)
    }
  }

  const handleSubmitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setError(null)
    setSuccessMessage(null)
    setDuplicateWarning(null)

    startTransition(async () => {
      const result = await createReportAction(formData)

      if (!result.success) {
        if ("duplicateWarning" in result && result.duplicateWarning) {
          setDuplicateWarning(result.duplicates)
          return
        }

        setError(result.error)
        return
      }

      formRef.current?.reset()
      setSelectedCategory("")
      setDuplicateWarning(null)
      setSuccessMessage(`Report submitted successfully. Report ID: ${result.reportId}`)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Report a Civic Issue</h2>
        <p className="text-muted-foreground">
          Submit location-based civic issues and track resolution progress.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Submission Process</p>
            <p className="text-sm text-muted-foreground">
              After submission, your report will go to admin verification before department
              assignment. You&apos;ll receive updates at each stage via the Citizen Portal.
            </p>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border-accent/30 bg-accent/10">
          <CardContent className="py-4 text-sm text-accent">{successMessage}</CardContent>
        </Card>
      ) : null}

      {duplicateWarning ? (
        <Card className="border-warning/30 bg-warning/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Similar reports found
            </CardTitle>
            <CardDescription>
              We found reports that may describe the same issue. Review them before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {duplicateWarning.slice(0, 3).map((duplicate, index) => (
                <div
                  key={`${duplicate.title}-${duplicate.distanceMeters}-${index}`}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {classificationLabels[duplicate.classification]}
                    </Badge>
                    <StatusBadge status={duplicate.status} />
                    <Badge variant="secondary">{formatScore(duplicate.score)}</Badge>
                  </div>

                  <p className="mt-2 font-medium text-foreground">{duplicate.title}</p>

                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{duplicate.category}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formatDistance(duplicate.distanceMeters)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {duplicate.reasons.slice(0, 2).join("; ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                If this is a separate issue, use Submit anyway below. If you edit the report,
                check again before submitting.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDuplicateWarning(null)}
              >
                Check again after edits
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form ref={formRef} onSubmit={handleSubmitReport} className="space-y-6">
          <input type="hidden" name="category" value={selectedCategory} />
          <input type="hidden" name="latitude" value="19.076" />
          <input type="hidden" name="longitude" value="72.8777" />
          {duplicateWarning ? (
            <input type="hidden" name="confirmDuplicate" value="true" />
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Issue Details
              </CardTitle>
              <CardDescription>
                Provide detailed information about the civic issue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Large pothole on MG Road near City Mall"
                  onChange={clearDuplicateWarningOnEdit}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the issue in detail. Include information like size, severity, how long it has been present, and any safety concerns..."
                  className="min-h-[120px] resize-none"
                  onChange={clearDuplicateWarningOnEdit}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    clearDuplicateWarningOnEdit()
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border"
                  >
                    Auto
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Priority will be calculated automatically after submission
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter the full address of the issue location"
                    className="pl-9"
                    onChange={clearDuplicateWarningOnEdit}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Image upload will be connected in the Cloudinary step.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>

                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Drag and drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Image upload will be added in the next media step
                  </p>
                </div>

                <Button type="button" variant="outline" className="gap-2" disabled>
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>

                <p className="text-xs text-muted-foreground">
                  Supported formats later: JPG, PNG, WEBP
                </p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={isPending}>
            <CheckCircle2 className="h-5 w-5" />
            {isPending
              ? "Submitting..."
              : duplicateWarning
                ? "Submit anyway"
                : "Submit Report"}
          </Button>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Issue Location
              </CardTitle>
              <CardDescription>Select the exact location on the map</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="relative mb-4 flex h-[280px] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, var(--border) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--border) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-muted-foreground/20" />
                <div className="absolute bottom-0 left-1/3 top-0 w-2 bg-muted-foreground/20" />
                <div className="absolute bottom-0 right-1/4 top-0 w-1 bg-muted-foreground/10" />
                <div className="absolute left-0 right-0 top-1/4 h-1 bg-muted-foreground/10" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive shadow-lg">
                    <MapPin className="h-6 w-6 text-destructive-foreground" />
                  </div>
                  <div className="mt-1 h-2 w-2 rounded-full bg-destructive/50" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 rounded-md bg-background/90 px-3 py-2 text-center text-sm backdrop-blur-sm">
                  <p className="font-medium text-foreground">Default demo location</p>
                  <p className="text-xs text-muted-foreground">
                    Interactive map will be connected in the map integration step
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value="19.0760"
                    readOnly
                    className="bg-muted/30 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value="72.8777"
                    readOnly
                    className="bg-muted/30 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning-foreground">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Possible Duplicate Check
              </CardTitle>
              <CardDescription>
                CivicPulse will check nearby reports with similar category and description
                before submission.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Duplicate checking happens after submission. If similar reports are found,
                you can review them and still submit anyway.
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
