"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"

type ReportLocationMapProps = {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  className?: string
  mapClassName?: string
}

type LeafletModule = typeof import("leaflet")

const MAP_ZOOM = 15

function getValidLocation(latitude?: number | null, longitude?: number | null) {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude }
  }

  return null
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

function createMarkerIcon(Leaflet: LeafletModule): DivIcon {
  return Leaflet.divIcon({
    className: "",
    html: '<div class="civicpulse-location-marker"></div>',
    iconAnchor: [14, 14],
    iconSize: [28, 28],
  })
}

export function ReportLocationMap({
  latitude,
  longitude,
  address,
  className,
  mapClassName,
}: ReportLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const location = getValidLocation(latitude, longitude)

  const removeMap = useCallback(() => {
    markerRef.current?.remove()
    mapRef.current?.remove()
    markerRef.current = null
    mapRef.current = null
    setIsMapReady(false)
  }, [])

  useEffect(() => {
    if (!location || !mapContainerRef.current) {
      removeMap()
      return
    }

    let isMounted = true
    const latLng: [number, number] = [location.latitude, location.longitude]

    void import("leaflet").then((Leaflet) => {
      const mapContainer = mapContainerRef.current

      if (!isMounted || !mapContainer) return

      if (!mapRef.current) {
        const map = Leaflet.map(mapContainer, {
          attributionControl: true,
          boxZoom: false,
          center: latLng,
          doubleClickZoom: false,
          dragging: false,
          keyboard: false,
          scrollWheelZoom: false,
          touchZoom: false,
          zoom: MAP_ZOOM,
          zoomControl: false,
        })

        Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)

        markerRef.current = Leaflet.marker(latLng, {
          icon: createMarkerIcon(Leaflet),
          interactive: false,
        }).addTo(map)

        mapRef.current = map
        setIsMapReady(true)
        window.setTimeout(() => map.invalidateSize(), 0)
        return
      }

      mapRef.current.setView(latLng, MAP_ZOOM)
      markerRef.current?.setLatLng(latLng)
      window.setTimeout(() => mapRef.current?.invalidateSize(), 0)
      setIsMapReady(true)
    })

    return () => {
      isMounted = false
    }
  }, [location?.latitude, location?.longitude, removeMap])

  useEffect(() => removeMap, [removeMap])

  if (!location) {
    return (
      <div className={cn("space-y-3", className)}>
        <div
          className={cn(
            "flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40 p-6 text-center",
            mapClassName
          )}
        >
          <div>
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Location coordinates are not available.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The address is still shown when it was provided.
            </p>
          </div>
        </div>

        {address ? (
          <p className="text-sm text-muted-foreground">{address}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={mapContainerRef}
        className={cn(
          "relative h-[240px] overflow-hidden rounded-lg border border-border bg-muted/30",
          mapClassName
        )}
      >
        {!isMapReady ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted/40 text-sm text-muted-foreground">
            Loading map...
          </div>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        {address ? (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{address}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Lat: {formatCoordinate(location.latitude)}</span>
          <span>Lng: {formatCoordinate(location.longitude)}</span>
        </div>
      </div>
    </div>
  )
}
