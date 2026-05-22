"use client"

import { useState } from "react"
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

const mockNearbyReports = [
  {
    id: "CIV-2024-0892",
    title: "Pothole on Main Road near Bus Stop",
    category: "Road Damage",
    distance: "120m away",
    status: "in-progress" as const,
  },
  {
    id: "CIV-2024-0887",
    title: "Street Light Not Working",
    category: "Street Light Failure",
    distance: "250m away",
    status: "assigned" as const,
  },
]

export default function ReportIssuePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Mock handling - no actual upload
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Report a Civic Issue</h2>
        <p className="text-muted-foreground">
          Submit location-based civic issues and track resolution progress.
        </p>
      </div>

      {/* Status Info Card */}
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

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Report Form */}
        <div className="space-y-6">
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
              {/* Issue Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Large pothole on MG Road near City Mall"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. Include information like size, severity, how long it has been present, and any safety concerns..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

              {/* Priority Preview Badge */}
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

              {/* Address Input */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Enter the full address of the issue location"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Upload Image
              </CardTitle>
              <CardDescription>Upload a clear photo of the issue</CardDescription>
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
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button size="lg" className="w-full gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Submit Report
          </Button>
        </div>

        {/* Right Column - Location Section */}
        <div className="space-y-6">
          {/* Map Placeholder Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Issue Location
              </CardTitle>
              <CardDescription>Select the exact location on the map</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Map Placeholder */}
              <div className="relative mb-4 flex h-[280px] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {/* Grid Pattern */}
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
                {/* Mock roads */}
                <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-muted-foreground/20" />
                <div className="absolute bottom-0 left-1/3 top-0 w-2 bg-muted-foreground/20" />
                <div className="absolute bottom-0 right-1/4 top-0 w-1 bg-muted-foreground/10" />
                <div className="absolute left-0 right-0 top-1/4 h-1 bg-muted-foreground/10" />

                {/* Center Pin Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive shadow-lg">
                    <MapPin className="h-6 w-6 text-destructive-foreground" />
                  </div>
                  <div className="mt-1 h-2 w-2 rounded-full bg-destructive/50" />
                </div>

                {/* Instructions overlay */}
                <div className="absolute bottom-3 left-3 right-3 rounded-md bg-background/90 px-3 py-2 text-center text-sm backdrop-blur-sm">
                  <p className="font-medium text-foreground">Select issue location on map</p>
                  <p className="text-xs text-muted-foreground">
                    Click or drag the pin to set exact location
                  </p>
                </div>
              </div>

              {/* Coordinates Preview */}
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

          {/* Nearby Reports Warning Card */}
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
              <p className="mb-3 text-sm font-medium text-foreground">
                Nearby reports in this area:
              </p>
              <div className="space-y-3">
                {mockNearbyReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          {report.id}
                        </span>
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {report.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{report.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                If your issue matches an existing report, consider adding details to that
                report instead of creating a duplicate.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
