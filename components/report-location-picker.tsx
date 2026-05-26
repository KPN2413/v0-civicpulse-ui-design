"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import { MapPin } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ReportLocation = {
  latitude: number
  longitude: number
}

type ReportLocationPickerProps = {
  value: ReportLocation | null
  onChange: (location: ReportLocation) => void
  error?: string | null
  className?: string
}

type LeafletModule = typeof import("leaflet")

const DEFAULT_CENTER: [number, number] = [19.076, 72.8777]
const DEFAULT_ZOOM = 12
const SELECTED_ZOOM = 15

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

export function ReportLocationPicker({
  value,
  onChange,
  error,
  className,
}: ReportLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const leafletRef = useRef<LeafletModule | null>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const setMarkerPosition = useCallback((
    Leaflet: LeafletModule,
    location: ReportLocation,
    shouldNotify: boolean
  ) => {
    const map = mapRef.current

    if (!map) return

    const latLng: [number, number] = [location.latitude, location.longitude]

    if (!markerRef.current) {
      const marker = Leaflet.marker(latLng, {
        draggable: true,
        icon: createMarkerIcon(Leaflet),
      }).addTo(map)

      marker.on("dragend", () => {
        const movedLocation = marker.getLatLng()

        onChangeRef.current({
          latitude: movedLocation.lat,
          longitude: movedLocation.lng,
        })
      })

      markerRef.current = marker
    } else {
      markerRef.current.setLatLng(latLng)
    }

    map.panTo(latLng)

    if (shouldNotify) {
      onChangeRef.current(location)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    void import("leaflet").then((Leaflet) => {
      const mapContainer = mapContainerRef.current

      if (!isMounted || !mapContainer || mapRef.current) return

      leafletRef.current = Leaflet

      const initialValue = valueRef.current
      const initialCenter: [number, number] = initialValue
        ? [initialValue.latitude, initialValue.longitude]
        : DEFAULT_CENTER
      const map = Leaflet.map(mapContainer, {
        center: initialCenter,
        scrollWheelZoom: true,
        zoom: initialValue ? SELECTED_ZOOM : DEFAULT_ZOOM,
      })

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      map.on("click", (event) => {
        setMarkerPosition(
          Leaflet,
          {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          },
          true
        )
      })

      mapRef.current = map

      if (initialValue) {
        setMarkerPosition(Leaflet, initialValue, false)
      }

      setIsMapReady(true)
      window.setTimeout(() => map.invalidateSize(), 0)
    })

    return () => {
      isMounted = false
      markerRef.current?.remove()
      mapRef.current?.remove()
      markerRef.current = null
      mapRef.current = null
      leafletRef.current = null
    }
  }, [setMarkerPosition])

  useEffect(() => {
    const Leaflet = leafletRef.current

    if (!Leaflet || !mapRef.current) return

    if (!value) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    setMarkerPosition(Leaflet, value, false)
  }, [setMarkerPosition, value])

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={mapContainerRef}
        className={cn(
          "relative h-[280px] overflow-hidden rounded-lg border bg-muted/30",
          error ? "border-destructive" : "border-border"
        )}
      >
        {!isMapReady ? (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted/40 text-sm text-muted-foreground">
            Loading map...
          </div>
        ) : null}

        {isMapReady && !value ? (
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-[500] flex items-center gap-2 rounded-md bg-background/90 px-3 py-2 text-sm shadow-sm backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Select a point on the map</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="selected-latitude">Latitude</Label>
          <Input
            id="selected-latitude"
            value={value ? formatCoordinate(value.latitude) : ""}
            readOnly
            placeholder="Not selected"
            className="bg-muted/30 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="selected-longitude">Longitude</Label>
          <Input
            id="selected-longitude"
            value={value ? formatCoordinate(value.longitude) : ""}
            readOnly
            placeholder="Not selected"
            className="bg-muted/30 font-mono text-sm"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
