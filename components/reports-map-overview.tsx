"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DivIcon, LayerGroup, Map as LeafletMap } from "leaflet"
import { MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ReportsMapOverviewReport = {
  id: string
  title: string
  category: string
  status: string
  priority: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

type ValidReportLocation = ReportsMapOverviewReport & {
  latitude: number
  longitude: number
}

type ReportsMapOverviewProps = {
  reports: ReportsMapOverviewReport[]
  className?: string
  mapClassName?: string
}

type LeafletModule = typeof import("leaflet")

const DEFAULT_CENTER: [number, number] = [19.076, 72.8777]
const DEFAULT_ZOOM = 12
const SINGLE_MARKER_ZOOM = 15

function isValidCoordinate(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

function getValidReportLocations(
  reports: ReportsMapOverviewReport[]
): ValidReportLocation[] {
  return reports.filter(
    (report): report is ValidReportLocation =>
      isValidCoordinate(report.latitude, report.longitude)
  )
}

function createMarkerIcon(Leaflet: LeafletModule): DivIcon {
  return Leaflet.divIcon({
    className: "",
    html: '<div class="civicpulse-location-marker"></div>',
    iconAnchor: [14, 14],
    iconSize: [28, 28],
  })
}

function formatLabel(value: string) {
  return value.replace(/[_-]/g, " ").toLowerCase()
}

function appendTextElement(
  parent: HTMLElement,
  tagName: "p" | "span",
  text: string,
  className: string
) {
  const element = document.createElement(tagName)
  element.className = className
  element.textContent = text
  parent.appendChild(element)

  return element
}

function createPopupContent(report: ValidReportLocation) {
  const container = document.createElement("div")
  container.className = "space-y-2 text-sm"

  appendTextElement(container, "p", report.title, "font-medium text-foreground")

  const badges = document.createElement("div")
  badges.className = "flex flex-wrap gap-1.5"
  container.appendChild(badges)

  appendTextElement(
    badges,
    "span",
    formatLabel(report.category),
    "rounded-md border px-2 py-0.5 text-xs capitalize text-muted-foreground"
  )
  appendTextElement(
    badges,
    "span",
    formatLabel(report.status),
    "rounded-md border px-2 py-0.5 text-xs capitalize text-muted-foreground"
  )
  appendTextElement(
    badges,
    "span",
    formatLabel(report.priority),
    "rounded-md border px-2 py-0.5 text-xs capitalize text-muted-foreground"
  )

  if (report.address) {
    appendTextElement(container, "p", report.address, "text-xs text-muted-foreground")
  }

  return container
}

export function ReportsMapOverview({
  reports,
  className,
  mapClassName,
}: ReportsMapOverviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerLayerRef = useRef<LayerGroup | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const validReports = useMemo(() => getValidReportLocations(reports), [reports])

  const removeMap = useCallback(() => {
    markerLayerRef.current?.remove()
    mapRef.current?.remove()
    markerLayerRef.current = null
    mapRef.current = null
    setIsMapReady(false)
  }, [])

  useEffect(() => {
    if (validReports.length === 0 || !mapContainerRef.current) {
      removeMap()
      return
    }

    let isMounted = true

    void import("leaflet").then((Leaflet) => {
      const mapContainer = mapContainerRef.current

      if (!isMounted || !mapContainer) return

      if (!mapRef.current) {
        const map = Leaflet.map(mapContainer, {
          center: DEFAULT_CENTER,
          scrollWheelZoom: true,
          zoom: DEFAULT_ZOOM,
        })

        Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map
      }

      if (!markerLayerRef.current) {
        markerLayerRef.current = Leaflet.layerGroup().addTo(mapRef.current)
      }

      markerLayerRef.current.clearLayers()

      validReports.forEach((report) => {
        Leaflet.marker([report.latitude, report.longitude], {
          icon: createMarkerIcon(Leaflet),
        })
          .bindPopup(createPopupContent(report), {
            maxWidth: 280,
          })
          .addTo(markerLayerRef.current!)
      })

      if (validReports.length === 1) {
        mapRef.current.setView(
          [validReports[0].latitude, validReports[0].longitude],
          SINGLE_MARKER_ZOOM
        )
      } else {
        const bounds = Leaflet.latLngBounds(
          validReports.map((report) => [report.latitude, report.longitude])
        )

        mapRef.current.fitBounds(bounds, {
          maxZoom: SINGLE_MARKER_ZOOM,
          padding: [24, 24],
        })
      }

      setIsMapReady(true)
      window.setTimeout(() => mapRef.current?.invalidateSize(), 0)
    })

    return () => {
      isMounted = false
    }
  }, [removeMap, validReports])

  useEffect(() => removeMap, [removeMap])

  if (validReports.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex h-[280px] items-center justify-center p-6 text-center">
          <div>
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No report locations available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={mapContainerRef}
        className={cn(
          "relative h-[360px] overflow-hidden rounded-lg border border-border bg-muted/30",
          mapClassName
        )}
      >
        {!isMapReady ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted/40 text-sm text-muted-foreground">
            Loading map...
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {validReports.length} report location
        {validReports.length === 1 ? "" : "s"}.
      </p>
    </div>
  )
}
