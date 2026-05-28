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
  X,
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
import {
  ReportLocationPicker,
  type ReportLocation,
} from "@/components/report-location-picker"

const categories = [
  { value: "road-damage", label: "Road Damage" },
  { value: "garbage-overflow", label: "Garbage Overflow" },
  { value: "street-light-failure", label: "Street Light Failure" },
  { value: "water-leakage", label: "Water Leakage" },
  { value: "drainage-problem", label: "Drainage Problem" },
  { value: "public-safety", label: "Public Safety" },
  { value: "other", label: "Other" },
]

const MAX_EVIDENCE_FILES = 3
const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024
const acceptedEvidenceTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

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

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getEvidenceSelectionError(files: File[]) {
  if (files.length > MAX_EVIDENCE_FILES) {
    return `Please upload no more than ${MAX_EVIDENCE_FILES} evidence images.`
  }

  const invalidType = files.find((file) => !acceptedEvidenceTypes.has(file.type))

  if (invalidType) {
    return "Evidence uploads must be JPG, PNG, WEBP, or GIF images."
  }

  const oversizedFile = files.find((file) => file.size > MAX_EVIDENCE_FILE_SIZE)

  if (oversizedFile) {
    return "Each evidence image must be 5 MB or smaller."
  }

  return null
}

export default function ReportIssuePage() {
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarningReport[] | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<ReportLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedEvidenceFiles, setSelectedEvidenceFiles] = useState<File[]>([])
  const [evidenceError, setEvidenceError] = useState<string | null>(null)

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

    addEvidenceFiles(Array.from(event.dataTransfer.files))
  }

  const clearDuplicateWarningOnEdit = () => {
    if (duplicateWarning) {
      setDuplicateWarning(null)
    }
  }

  const handleLocationChange = (location: ReportLocation) => {
    setSelectedLocation(location)
    setLocationError(null)
    clearDuplicateWarningOnEdit()
  }

  const addEvidenceFiles = (files: File[]) => {
    const nextFiles = [...selectedEvidenceFiles, ...files.filter((file) => file.size > 0)]
    const validationError = getEvidenceSelectionError(nextFiles)

    if (validationError) {
      setEvidenceError(validationError)
      return
    }

    setSelectedEvidenceFiles(nextFiles)
    setEvidenceError(null)
    clearDuplicateWarningOnEdit()
  }

  const handleEvidenceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addEvidenceFiles(Array.from(event.target.files ?? []))
    event.target.value = ""
  }

  const removeEvidenceFile = (indexToRemove: number) => {
    const nextFiles = selectedEvidenceFiles.filter((_, index) => index !== indexToRemove)

    setSelectedEvidenceFiles(nextFiles)
    setEvidenceError(null)
    clearDuplicateWarningOnEdit()
  }

  const handleSubmitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    formData.delete("evidence")
    selectedEvidenceFiles.forEach((file) => formData.append("evidence", file))

    setError(null)
    setSuccessMessage(null)
    setDuplicateWarning(null)

    if (!selectedLocation) {
      setLocationError("Please select the issue location on the map before submitting.")
      return
    }

    const evidenceSelectionError = getEvidenceSelectionError(selectedEvidenceFiles)

    if (evidenceSelectionError) {
      setEvidenceError(evidenceSelectionError)
      return
    }

    setLocationError(null)
    setEvidenceError(null)

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
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setSelectedCategory("")
      setSelectedLocation(null)
      setSelectedEvidenceFiles([])
      setEvidenceError(null)
      setLocationError(null)
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
                {selectedEvidenceFiles.length > 0
                  ? " Selected evidence will be included when you submit anyway."
                  : ""}
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
          {selectedLocation ? (
            <>
              <input
                type="hidden"
                name="latitude"
                value={selectedLocation.latitude}
              />
              <input
                type="hidden"
                name="longitude"
                value={selectedLocation.longitude}
              />
            </>
          ) : null}
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
                Evidence Images
              </CardTitle>
              <CardDescription>
                Upload up to 3 images. Each image must be 5 MB or smaller.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleEvidenceFileChange}
              />
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
                    Drag and drop evidence images here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, WEBP, or GIF images are supported
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedEvidenceFiles.length >= MAX_EVIDENCE_FILES}
                >
                  <Upload className="h-4 w-4" />
                  Choose Images
                </Button>

                <p className="text-xs text-muted-foreground">
                  {selectedEvidenceFiles.length} of {MAX_EVIDENCE_FILES} selected
                </p>
              </div>

              {evidenceError ? (
                <p className="mt-2 text-sm text-destructive">{evidenceError}</p>
              ) : null}

              {selectedEvidenceFiles.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {selectedEvidenceFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.type || "Image"} - {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidenceFile(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
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
              <ReportLocationPicker
                value={selectedLocation}
                onChange={handleLocationChange}
                error={locationError}
              />
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
